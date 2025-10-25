import { PrismaClient, Role, StudentType, UserStatus } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { execSync } from 'child_process';
import { Client } from 'pg';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import {
  ExecutionContext,
  INestApplication,
  Logger,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { MockUser, mockUsers } from './mocks/mock-users';
import { AuthGuard } from '@/common/guards/auth.guard';
import { AuthService } from '@/modules/auth/auth.service';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { CustomPrismaService } from 'nestjs-prisma';
import { GlobalHttpExceptionFilter } from '@/common/filters/http-exceptions.filters';
import { AuthUser, UserMetadata } from '@/common/interfaces/auth.user-metadata';
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
  private static IMAGE = 'postgres:14-alpine';
  private static initializationInProgress = false;
  private static container: StartedPostgreSqlContainer;
  private static prismaService: CustomPrismaService<ExtendedPrismaClient>;

  private prismaClient: ExtendedPrismaClient;
  private pgClient: Client;
  private instanceMockUsers: typeof mockUsers;
  private databaseUrl: string;

  /**
   * Starts a PostgreSQL test container, applies Prisma migrations,
   * initializes a Prisma client with pagination extension, and seeds user data.
   *
   * @returns An object containing the initialized Prisma client
   */
  async start(): Promise<{ prismaClient: ExtendedPrismaClient }> {
    try {
      await this.initializeStaticResources();

      this.prismaClient = TestAppService.prismaService.client;

      // Create instance-specific mock users to avoid test interference
      this.instanceMockUsers = this.cloneMockUsers();

      // Setup user data for this test instance
      await this.setupUserData();

      return { prismaClient: this.prismaClient };
    } catch (error) {
      console.error('Failed to start test environment:', error);
      // Clean up any partially initialized resources
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Initialize static resources (container, Prisma client) that can be reused
   */
  private async initializeStaticResources() {
    if (TestAppService.initializationInProgress) {
      // Wait for initialization to complete
      while (TestAppService.initializationInProgress) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    TestAppService.initializationInProgress = true;

    try {
      if (!TestAppService.container) {
        TestAppService.container = await new PostgreSqlContainer(
          TestAppService.IMAGE,
        ).start();

        console.log(
          `[TestAppService] PostgreSQL container started on port ${TestAppService.container.getPort()}`,
        );

        // Wait for the database to be ready
        await this.waitForDatabase();
      }

      // Initialize the Prisma client only once
      if (!TestAppService.prismaService) {
        this.databaseUrl = TestAppService.container.getConnectionUri();
        console.log('[TestAppService] Database URL:', this.databaseUrl);

        // Run Prisma migrations
        console.log('[TestAppService] Running Prisma migrations...');

        // Run migrations once
        execSync(
          'npx prisma db push --skip-generate --schema=./prisma/schema.prisma ',
          {
            stdio: 'inherit',
            env: {
              ...process.env,
              DATABASE_URL: this.databaseUrl,
              DATABASE_CLOUD_URL: this.databaseUrl,
              DIRECT_CLOUD_URL: this.databaseUrl,
            },
            cwd: process.cwd(),
          },
        );

        const extendedPrismaClient = new PrismaClient({
          datasources: { db: { url: this.databaseUrl } },
          // Add retry logic for connection issues
          log: ['warn', 'error'],
        }).$extends(pagination());

        // Test the connection
        await extendedPrismaClient.$connect();

        TestAppService.prismaService =
          new CustomPrismaService<ExtendedPrismaClient>(extendedPrismaClient);
      }

      console.log('Test environment initialized successfully');
    } catch (error) {
      TestAppService.initializationInProgress = false;
      throw error;
    } finally {
      TestAppService.initializationInProgress = false;
    }
  }

  /**
   * Wait for the database to be ready with retry logic
   */
  private async waitForDatabase(retries = 20, delay = 1000): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      this.pgClient = new Client({
        host: TestAppService.container.getHost(),
        port: TestAppService.container.getPort(),
        database: TestAppService.container.getDatabase(),
        user: TestAppService.container.getUsername(),
        password: TestAppService.container.getPassword(),
      });

      try {
        await this.pgClient.connect();
        await this.pgClient.query('SELECT 1'); // Test query
        console.log('[TestAppService] Database ready');
        return;
      } catch (error) {
        lastError = error as Error;
        console.log(
          `[TestAppService] Waiting for database (attempt ${attempt}/${retries})...`,
        );
        if (this.pgClient) {
          try {
            await this.pgClient.end();
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        if (attempt === retries) {
          throw new Error(
            `Failed to connect to database after ${retries} attempts`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Clone the mock users to avoid test interference
   */
  private cloneMockUsers(): typeof mockUsers {
    const clone = {} as typeof mockUsers;

    Object.keys(mockUsers).forEach((key) => {
      const userType = key as keyof typeof mockUsers;
      const original = mockUsers[userType];

      if (original === null) {
        clone[userType] = null;
      } else {
        clone[userType] = {
          id: uuidv4(), // New unique ID for each test instance
          user_metadata: {
            ...original.user_metadata,
            user_id: uuidv4(), // New user_id for the database
          },
        };
      }
    });

    return clone;
  }

  /**
   * Seeds mock user data
   */
  private async setupUserData() {
    try {
      const userCreationPromises = Object.entries(this.instanceMockUsers)
        .filter(([_, value]) => value !== null)
        .map(async ([userType, mockUser]) => {
          if (!mockUser) return;

          const role = userType; // Handle unauth case

          return await this.prismaClient.$transaction(
            async (tx) => {
              // Create user
              const user = await tx.user.create({
                data: {
                  firstName:
                    userType.charAt(0).toUpperCase() + userType.slice(1),
                  lastName: 'User',
                  role: role as Role,
                },
              });

              // Update metadata with actual user ID
              if (mockUser.user_metadata) {
                mockUser.user_metadata.user_id = user.id;
              }

              const uniqueSuffix = uuidv4().substring(0, 8);

              const [account, details, roleDetails] = await Promise.all([
                tx.userAccount.create({
                  data: {
                    userId: user.id,
                    authUid: mockUser.id,
                    email: `${userType}-${uniqueSuffix}@user.com`,
                  },
                }),
                tx.userDetails.create({
                  data: {
                    userId: user.id,
                    dateJoined: new Date().toISOString(),
                    dob: new Date().toISOString(),
                    gender: 'male',
                  },
                }),
                userType === 'student'
                  ? tx.studentDetails.create({
                      data: {
                        userId: user.id,
                        studentNumber: Math.random().toString().substring(2, 8),
                        studentType: StudentType.regular,
                        admissionDate: new Date().toISOString(),
                        otherDetails: {},
                      },
                    })
                  : tx.staffDetails.create({
                      data: {
                        userId: user.id,
                        employeeNumber: parseInt(
                          Math.random().toString().substring(2, 8),
                        ),
                        department: 'System Administration',
                        position: 'Specialist',
                        otherDetails: {},
                      },
                    }),
              ]);

              return { user, account, details, roleDetails };
            },
            {
              timeout: 30000,
              maxWait: 5000,
            },
          );
        });
      await Promise.all(userCreationPromises);
      console.log(`[User data setup completed`);
    } catch (error) {
      console.error(`[Failed to setup user data:`, error);
      throw error;
    }
  }
  /**
   * Get a mock user for this test instance
   */
  getMockUser(userType: keyof typeof mockUsers): MockUser {
    return this.instanceMockUsers[userType];
  }

  /**
   * Get all mock users for this test instance
   */
  getMockUsers(): typeof mockUsers {
    return this.instanceMockUsers;
  }

  /**
   * Create and cache app instances to avoid recreating for every test
   */
  private appCache = new Map<string, INestApplication>();

  /**
   * Creates a NestJS test application with overridden dependencies:
   * - Injects Prisma client
   * - Mocks AuthGuard to attach the provided mockUser
   * - Mocks AuthService methods for user operations
   *
   * @param mockUser - The user to authenticate requests with (default: admin)
   * @returns An object containing the initialized NestJS app
   */
  async createTestApp(
    mockUser: MockUser | null = this.instanceMockUsers.admin,
  ) {
    const cacheKey = mockUser?.id || 'unauth';

    if (this.appCache.has(cacheKey)) {
      return { app: this.appCache.get(cacheKey) };
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('PrismaService')
      .useValue(TestAppService.prismaService)
      .overrideProvider(AuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          if (mockUser === null)
            throw new UnauthorizedException('Invalid token');

          const req = ctx
            .switchToHttp()
            .getRequest<Request & { user?: AuthUser }>();
          req.user = mockUser as AuthUser;
          return true;
        },
      })
      .overrideProvider(AuthService)
      .useValue({
        create: jest.fn().mockImplementation((role: Role, email: string) => {
          return Promise.resolve({
            id: uuidv4(),
            email,
            user_metadata: {
              role: role,
              status: UserStatus.active as UserStatus,
            } as UserMetadata,
          });
        }),
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
              role: role,
              status: UserStatus.active as UserStatus,
            } as UserMetadata,
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

        delete: jest.fn().mockImplementation(() => {
          return Promise.resolve(undefined);
        }),
      })
      .compile();

    const logger =
      process.env.TEST_LOGS === 'true'
        ? new Logger('E2E-Test', {
            timestamp: true,
          })
        : false; // Disable logging by default

    const app = moduleRef.createNestApplication({
      logger,
    });

    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    this.appCache.set(cacheKey, app);

    return { app };
  }

  /**
   * Close instance-specific resources
   */
  async close() {
    await this.cleanup();
  }

  /**
   * Internal cleanup method for partial cleanups during errors
   */
  private async cleanup() {
    const errors: Error[] = [];

    // Close all cached apps
    for (const app of this.appCache.values()) {
      try {
        await app.close();
      } catch (error) {
        errors.push(error as Error);
      }
    }
    this.appCache.clear();

    // Close PostgreSQL client
    if (this.pgClient) {
      try {
        await this.pgClient.end();
      } catch (error) {
        errors.push(error as Error);
      }
    }

    if (errors.length > 0) {
      console.warn(`Cleanup completed with ${errors.length} errors`);
    }
  }
}
