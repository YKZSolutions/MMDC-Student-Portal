import { PGlite } from '@electric-sql/pglite';
import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { execSync } from 'child_process';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { MockUser, mockUsers } from './mock-users';
import { AuthGuard } from '../../src/common/guards/auth.guard';
import { AuthService } from '../../src/modules/auth/auth.service';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { CustomPrismaService } from 'nestjs-prisma';

export class TestAppService {
  private prisma: ExtendedPrismaClient;
  private pgContainer: StartedPostgreSqlContainer;
  private pgClient: Client;
  // private db: PGlite;
  // private server: PGLiteSocketServer;
  private app: INestApplication;

  /**
   * @deprecated
   */
  async initializeLocalDB() {
    // const db = await PGlite.create();
    // // const adapter = new PrismaPGlite(pglite);
    // this.db = db;

    // const server = new PGLiteSocketServer({ db });
    // await server.start();

    // this.server = server;
    const prisma: ExtendedPrismaClient = new PrismaClient().$extends(
      pagination(),
    );

    // execSync('npx prisma db push', {
    //   stdio: 'inherit',
    //   env: {
    //     ...process.env,
    //     DATABASE_CLOUD_URL: url,
    //     DIRECT_CLOUD_URL: url,
    //   },
    // });

    this.prisma = prisma;

    return { prisma };
  }

  async start() {
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

    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      env: {
        DATABASE_CLOUD_URL: databaseUrl,
        DIRECT_CLOUD_URL: databaseUrl,
      },
    });

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: ['query'],
    }).$extends(pagination());

    console.log('connected to test db...');

    return { prisma: this.prisma };
  }

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
        create: jest.fn().mockResolvedValue({
          id: '3e426584-59c3-4168-9119-3c61959ae759',
          email: 'mock@example.com',
        }),
        updateMetadata: jest.fn().mockResolvedValue({
          id: '3e426584-59c3-4168-9119-3c61959ae759',
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    const app = moduleRef.createNestApplication();

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

  async close() {
    await this.prisma.$disconnect();
    await this.pgClient.end();
    await this.pgContainer.stop();
    // await this.server.stop();
    // await this.db.close();
    this.app.close();
  }
}
