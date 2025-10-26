import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { execSync } from 'child_process';
import { Client } from 'pg';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { CustomPrismaService } from 'nestjs-prisma';

/**
 * Global Setup for E2E Tests
 *
 * This runs ONCE before all tests begin.
 * It initializes the PostgreSQL container and runs migrations.
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access,
 */
export default async function globalSetup() {
  console.log('\n🚀 [GLOBAL-SETUP] Starting global test setup...\n');

  try {
    // Start PostgreSQL container
    console.log('[GLOBAL-SETUP] ⚙️  Starting PostgreSQL container...');
    const container = await new PostgreSqlContainer(
      'postgres:14-alpine',
    ).start();

    console.log(
      `[GLOBAL-SETUP] ✓ PostgreSQL container started on port ${container.getPort()}`,
    );

    // Wait for the database to be ready
    await waitForDatabase(container);

    // Get connection URL
    const databaseUrl = container.getConnectionUri();
    console.log('[GLOBAL-SETUP] ✓ Database URL:', databaseUrl);

    // Store connection details in global for teardown
    (global as any).__TESTCONTAINER__ = container;

    // Run Prisma migrations
    console.log('[GLOBAL-SETUP] ⚙️  Running Prisma migrations...');
    execSync(
      'npx prisma db push --skip-generate --schema=./prisma/schema.prisma',
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          DATABASE_CLOUD_URL: databaseUrl,
          DIRECT_CLOUD_URL: databaseUrl,
        },
        cwd: process.cwd(),
      },
    );
    console.log('[GLOBAL-SETUP] ✓ Migrations completed');

    // Initialize Prisma client
    console.log('[GLOBAL-SETUP] ⚙️  Initializing Prisma client...');
    const extendedPrismaClient = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
      log: ['warn', 'error'],
    }).$extends(pagination());

    await extendedPrismaClient.$connect();
    console.log('[GLOBAL-SETUP] ✓ Prisma client connected');

    // Store in global for tests to access
    (global as any).__PRISMA_CLIENT__ = extendedPrismaClient;
    (global as any).__PRISMA_SERVICE__ =
      new CustomPrismaService<ExtendedPrismaClient>(extendedPrismaClient);

    console.log('\n✅ [GLOBAL-SETUP] Global setup completed successfully\n');
  } catch (error) {
    console.error(
      '\n❌ [GLOBAL-SETUP] Failed to initialize test environment:',
      error,
    );
    throw error;
  }
}

/**
 * Wait for the database to be ready with retry logic
 */
async function waitForDatabase(
  container: StartedPostgreSqlContainer,
  retries = 20,
  delay = 1000,
): Promise<void> {
  console.log('[GLOBAL-SETUP] ⏳ Waiting for database to be ready...');

  for (let attempt = 1; attempt <= retries; attempt++) {
    const client = new Client({
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      user: container.getUsername(),
      password: container.getPassword(),
    });

    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('[GLOBAL-SETUP] ✓ Database ready');
      return;
    } catch (error) {
      console.log(
        `[GLOBAL-SETUP] ⏳ Waiting for database (attempt ${attempt}/${retries})...`,
      );
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
      if (attempt === retries) {
        throw new Error(
          `Failed to connect to database after ${retries} attempts: ${error}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
