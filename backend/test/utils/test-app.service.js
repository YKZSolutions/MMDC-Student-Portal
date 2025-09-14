"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestAppService = void 0;
const client_1 = require("@prisma/client");
const prisma_extension_pagination_1 = require("prisma-extension-pagination");
const child_process_1 = require("child_process");
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../src/app.module");
const common_1 = require("@nestjs/common");
const mock_users_1 = require("./mock-users");
const auth_guard_1 = require("../../src/common/guards/auth.guard");
const auth_service_1 = require("../../src/modules/auth/auth.service");
const postgresql_1 = require("@testcontainers/postgresql");
const pg_1 = require("pg");
const http_exceptions_filters_1 = require("@/common/filters/http-exceptions.filters");
const uuid_1 = require("uuid");
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
class TestAppService {
    prisma;
    pgContainer;
    pgClient;
    app;
    /**
     * Starts a PostgreSQL test container, applies Prisma migrations,
     * initializes Prisma client with pagination extension, and seeds user data.
     *
     * @returns An object containing the initialized Prisma client
     */
    async start() {
        const IMAGE = 'postgres:14-alpine';
        this.pgContainer = await new postgresql_1.PostgreSqlContainer(IMAGE).start();
        this.pgClient = new pg_1.Client({
            host: this.pgContainer.getHost(),
            port: this.pgContainer.getPort(),
            database: this.pgContainer.getDatabase(),
            user: this.pgContainer.getUsername(),
            password: this.pgContainer.getPassword(),
        });
        await this.pgClient.connect();
        const databaseUrl = `postgresql://${this.pgClient.user}:${this.pgClient.password}@${this.pgClient.host}:${this.pgClient.port}/${this.pgClient.database}`;
        (0, child_process_1.execSync)('npx prisma db push --skip-generate', {
            stdio: 'inherit',
            env: {
                DATABASE_CLOUD_URL: databaseUrl,
                DIRECT_CLOUD_URL: databaseUrl,
            },
        });
        this.prisma = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
            log: ['query'],
        }).$extends((0, prisma_extension_pagination_1.pagination)());
        console.log('connected to test db...');
        this.setupUserData();
        return { prisma: this.prisma };
    }
    /**
     * Seeds mock user data (admin, mentor, student, etc.) into the database.
     * Also updates the `mockUsers` object with the created DB IDs for linking.
     */
    async setupUserData() {
        for (const [key, value] of Object.entries(mock_users_1.mockUsers)) {
            if (!value)
                continue;
            await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        firstName: key.charAt(0).toUpperCase() + key.slice(1),
                        lastName: 'User',
                        role: client_1.Role[key],
                    },
                });
                mock_users_1.mockUsers[key].user_metadata.user_id = user.id;
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
                            studentNumber: 1,
                            studentType: client_1.StudentType.regular,
                            admissionDate: new Date().toISOString(),
                            otherDetails: {},
                        },
                    });
                }
                else {
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
    }
    /**
     * Resets the database by truncating all public schema tables.
     * This ensures tests can start with a clean slate.
     *
     * @param prisma - The Prisma client connected to the test DB
     */
    async resetDatabase(prisma) {
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
    async createTestApp(mockUser = mock_users_1.mockUsers.admin) {
        const prismaClient = {
            client: this.prisma,
        };
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider('PrismaService')
            .useValue(prismaClient)
            .overrideProvider(auth_guard_1.AuthGuard)
            .useValue({
            canActivate: (ctx) => {
                if (mockUser === null)
                    throw new common_1.UnauthorizedException('User not authenticated');
                const req = ctx.switchToHttp().getRequest();
                req.user = mockUser;
                return true;
            },
        })
            .overrideProvider(auth_service_1.AuthService)
            .useValue({
            create: jest
                .fn()
                .mockImplementation((role, email, password) => {
                return Promise.resolve({
                    id: (0, uuid_1.v4)(),
                    email,
                    user_metadata: {
                        role,
                        status: 'active',
                    },
                });
            }),
            login: jest
                .fn()
                .mockImplementation((email, password) => {
                if (password !== 'correct-password') {
                    throw new common_1.UnauthorizedException('Wrong login credentials');
                }
                return Promise.resolve('mock-access-token');
            }),
            invite: jest.fn().mockImplementation((email, role) => {
                return Promise.resolve({
                    id: (0, uuid_1.v4)(),
                    email,
                    user_metadata: {
                        role,
                        status: 'active',
                    },
                });
            }),
            updateMetadata: jest
                .fn()
                .mockImplementation((uid, metadata) => {
                return Promise.resolve({
                    id: uid,
                    user_metadata: {
                        ...metadata,
                    },
                });
            }),
            delete: jest.fn().mockImplementation((uid) => {
                return Promise.resolve(undefined);
            }),
        })
            .compile();
        const app = moduleRef.createNestApplication();
        app.useGlobalFilters(new http_exceptions_filters_1.GlobalHttpExceptionFilter());
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
        }));
        await app.init();
        this.app = app;
        return { app };
    }
    /**
     * Closes the Prisma client, PostgreSQL client, container, and NestJS app.
     * Should be called in `afterAll()` to clean up test resources.
     */
    async close() {
        await this.prisma.$disconnect();
        await this.pgClient.end();
        await this.pgContainer.stop();
        await this.app.close();
    }
}
exports.TestAppService = TestAppService;
