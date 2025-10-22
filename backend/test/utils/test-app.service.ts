import { PrismaClient, Role, StudentType } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { execSync } from 'child_process';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { MockUser, mockUsers } from './mock-users';
import { AuthGuard } from '@/common/guards/auth.guard';
import { AuthService } from '@/modules/auth/auth.service';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { CustomPrismaService } from 'nestjs-prisma';
import { GlobalHttpExceptionFilter } from '@/common/filters/http-exceptions.filters';
import { UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { v4 as uuidv4 } from 'uuid';

/**
 * TestAppService
 *
 * A utility service for setting up and tearing down an isolated
 * PostgreSQL + Prisma + NestJS application environment for integration tests.
 *
 * Responsibilities:
 * - Spin up a PostgreSQL container using Testcontainers
 * - Run Prisma migrations against the test DB
 * - Seed mock user data (admin, mentor, student, etc.)
 * - Create a NestJS app instance with overridden providers
 * - Provide helpers to reset and close the test environment
 */
export class TestAppService {
  private prisma: ExtendedPrismaClient;
  private pgContainer: StartedPostgreSqlContainer;
  private pgClient: Client;
  private app: INestApplication;

  /**
   * Starts a PostgreSQL test container, applies Prisma migrations,
   * initializes a Prisma client with pagination extension, and seeds user data.
   *
   * @returns An object containing the initialized Prisma client
   */
  async start() {
    try {
      const IMAGE = 'postgres:14-alpine';
      this.pgContainer = await new PostgreSqlContainer(IMAGE).start();

      this.pgClient = new Client({
        host: this.pgContainer.getHost(),
        port: this.pgContainer.getPort(),
        database: this.pgContainer.getDatabase(),
        user: this.pgContainer.getUsername(),
        password: this.pgContainer.getPassword(),
      });

      await this.pgClient.connect();

      const databaseUrl = `postgresql://${this.pgClient.user}:${this.pgClient.password}@${this.pgClient.host}:${this.pgClient.port}/${this.pgClient.database}`;

      // Wait a bit for the database to be fully ready
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use both DATABASE_URL and your custom variables
      execSync(
        'npx prisma db push --skip-generate --force-reset --accept-data-loss --schema=./prisma/schema.prisma',
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl, // Standard Prisma environment variable
            DATABASE_CLOUD_URL: databaseUrl,
            DIRECT_CLOUD_URL: databaseUrl,
          },
          cwd: process.cwd(), // Ensure we're in the correct directory
        },
      );

      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: ['query'],
      }).$extends(pagination());

      console.log('connected to test db...');

      // Wait for setupUserData to complete
      await this.setupUserData();

      return { prisma: this.prisma };
    } catch (error) {
      console.error('Failed to start test environment:', error);
      // Cleanup any partially initialized resources
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Seeds mock user data (admin, mentor, student, etc.) into the database.
   * Also updates the `mockUsers` object with the created DB IDs for linking.
   */
  async setupUserData() {
    try {
      for (const [key, value] of Object.entries(mockUsers)) {
        if (!value) continue;

        await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              firstName: key.charAt(0).toUpperCase() + key.slice(1),
              lastName: 'User',
              role: Role[key],
            },
          });

          mockUsers[key].user_metadata.user_id = user.id;

          await tx.userAccount.create({
            data: {
              userId: user.id,
              authUid: value.id,
              email: `${key}@user.com`,
            },
          });

          await tx.userDetails.create({
            data: {
              userId: user.id,
              dateJoined: new Date().toISOString(),
              dob: new Date().toISOString(),
              gender: 'male',
            },
          });

          if (key === 'student') {
            await tx.studentDetails.create({
              data: {
                userId: user.id,
                studentNumber: '1',
                studentType: StudentType.regular,
                admissionDate: new Date().toISOString(),
                otherDetails: {},
              },
            });
          } else {
            await tx.staffDetails.create({
              data: {
                userId: user.id,
                employeeNumber: key === 'admin' ? 1 : 2,
                department: 'System Administration',
                position: 'Specialist',
                otherDetails: {},
              },
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to setup user data:', error);
      throw error;
    }
  }

  /**
   * Resets the database by truncating all public schema tables.
   * This ensures tests can start with a clean slate.
   *
   * @param prisma - The Prisma client connected to the test DB
   */
  async resetDatabase(prisma: ExtendedPrismaClient) {
    await prisma.$executeRawUnsafe(`
    DO $$ DECLARE
        tables text;
    BEGIN
        SELECT string_agg(format('TRUNCATE TABLE %I.%I RESTART IDENTITY CASCADE', schemaname, tablename), '; ')
        INTO tables
        FROM pg_tables
        WHERE schemaname = 'public';

        EXECUTE tables;
    END $$;
  `);
  }

  /**
   * Creates a NestJS test application with overridden dependencies:
   * - Injects Prisma client
   * - Mocks AuthGuard to attach the provided mockUser
   * - Mocks AuthService methods for user operations
   *
   * @param mockUser - The user to authenticate requests with (default: admin)
   * @returns An object containing the initialized NestJS app
   */
  async createTestApp(mockUser: MockUser = mockUsers.admin) {
    const prismaClient: CustomPrismaService<ExtendedPrismaClient> = {
      client: this.prisma,
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('PrismaService')
      .useValue(prismaClient)
      .overrideProvider(AuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          if (mockUser === null)
            throw new UnauthorizedException('User not authenticated');

          const req = ctx.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideProvider(AuthService)
      .useValue({
        create: jest
          .fn()
          .mockImplementation(
            (role: Role, email: string, password?: string) => {
              return Promise.resolve({
                id: uuidv4(),
                email,
                user_metadata: {
                  role,
                  status: 'active',
                },
              });
            },
          ),

        login: jest
          .fn()
          .mockImplementation((email: string, password: string) => {
            if (password !== 'correct-password') {
              throw new UnauthorizedException('Wrong login credentials');
            }
            return Promise.resolve('mock-access-token');
          }),

        invite: jest.fn().mockImplementation((email: string, role: Role) => {
          return Promise.resolve({
            id: uuidv4(),
            email,
            user_metadata: {
              role,
              status: 'active',
            },
          });
        }),

        updateMetadata: jest
          .fn()
          .mockImplementation(
            (uid: string, metadata: Partial<UserMetadata>) => {
              return Promise.resolve({
                id: uid,
                user_metadata: {
                  ...metadata,
                },
              });
            },
          ),

        delete: jest.fn().mockImplementation((uid: string) => {
          return Promise.resolve(undefined);
        }),
      })
      .compile();

    const app = moduleRef.createNestApplication();

    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();

    this.app = app;

    return { app };
  }

  /**
   * Internal cleanup method for partial cleanups during errors
   */
  private async cleanup() {
    const errors: Error[] = [];

    // Close Prisma client
    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
      } catch (error) {
        console.error('Error disconnecting Prisma:', error);
        errors.push(error as Error);
      }
    }

    // Close PostgreSQL client
    if (this.pgClient) {
      try {
        await this.pgClient.end();
      } catch (error) {
        console.error('Error closing PG client:', error);
        errors.push(error as Error);
      }
    }

    // Stop PostgreSQL container
    if (this.pgContainer) {
      try {
        await this.pgContainer.stop();
      } catch (error) {
        console.error('Error stopping container:', error);
        errors.push(error as Error);
      }
    }

    // Close NestJS app
    if (this.app) {
      try {
        await this.app.close();
      } catch (error) {
        console.error('Error closing app:', error);
        errors.push(error as Error);
      }
    }

    // If there were errors but we need to continue, log them
    if (errors.length > 0) {
      console.warn(`Cleanup completed with ${errors.length} errors`);
    }
  }

  /**
   * Closes the Prisma client, PostgreSQL client, container, and NestJS app.
   * Should be called in `afterAll()` to clean up test resources.
   */
  async close() {
    await this.cleanup();
  }
}
