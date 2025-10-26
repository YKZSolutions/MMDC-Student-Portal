import { Role, StudentType, UserStatus } from '@prisma/client';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
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
import { CustomPrismaService } from 'nestjs-prisma';
import { GlobalHttpExceptionFilter } from '@/common/filters/http-exceptions.filters';
import { AuthUser, UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { v4 as uuidv4 } from 'uuid';

/**
 * TestAppService
 *
 * A utility service for setting up and managing test environments.
 * Uses global resources initialized by Jest's globalSetup.
 *
 * Responsibilities:
 * - Access shared Prisma client from global setup
 * - Seed mock user data for tests
 * - Create NestJS app instances with overridden providers
 * - Provide helpers to reset the database between tests
 */
export class TestAppService {
  private instanceMockUsers: typeof mockUsers;
  private appCache = new Map<string, INestApplication>();

  public prismaClient: ExtendedPrismaClient;
  public static prismaService: CustomPrismaService<ExtendedPrismaClient>;

  /**
   * Initialize the test service using global resources
   */
  async start() {
    try {
      // Get Prisma client and service from global setup
      this.prismaClient = (global as any).__PRISMA_CLIENT__;
      TestAppService.prismaService = (global as any).__PRISMA_SERVICE__;

      if (!this.prismaClient || !TestAppService.prismaService) {
        throw new Error(
          'Prisma client not initialized. Make sure globalSetup is configured in jest config.',
        );
      }

      // Create instance-specific mock users to avoid test interference
      this.instanceMockUsers = this.cloneMockUsers();

      // Reset database and setup user data for this test instance
      await this.resetDatabase();

      console.log('[TestAppService] ✓ Test service initialized');
    } catch (error) {
      console.error(
        '[TestAppService] ❌ Failed to start test environment:',
        error,
      );
      throw error;
    }
  }

  /**
   * Clone the mock users with new IDs to avoid conflicts
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
      console.log('[TestAppService] ✓ User data setup completed');
    } catch (error) {
      console.error('[TestAppService] ❌ Failed to setup user data:', error);
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
   * Resets the database by truncating all public schema tables.
   * This ensures tests can start with a clean slate.
   */
  async resetDatabase() {
    try {
      const tableNames = await this.prismaClient.$queryRaw<
        Array<{ tablename: string }>
      >`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%';
      `;

      const tablesToTruncate = tableNames
        .map((t) => `"${t.tablename}"`)
        .join(', ');

      if (tablesToTruncate) {
        await this.prismaClient.$executeRawUnsafe(
          `TRUNCATE TABLE ${tablesToTruncate} RESTART IDENTITY CASCADE;`,
        );
      }

      // Re-seed the database with base users after truncating
      await this.setupUserData();

      console.log('[TestAppService] ✓ Database reset completed');
    } catch (error) {
      console.error('[TestAppService] ❌ Failed to reset database:', error);
      throw error;
    }
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
   * Close instance-specific resources (cached apps)
   */
  async close() {
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

    if (errors.length > 0) {
      console.warn(
        `[TestAppService] ⚠️  Cleanup completed with ${errors.length} error(s)`,
      );
    }
  }
}
