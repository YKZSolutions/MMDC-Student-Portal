import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

/**
 * Global Teardown for E2E Tests
 *
 * This runs ONCE after all tests are complete.
 * It cleans up the PostgreSQL container and disconnects Prisma.
 */
/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
*/

export default async function globalTeardown() {
  console.log('\n🧹 [GLOBAL-TEARDOWN] Starting global cleanup...\n');

  const errors: Error[] = [];

  // Disconnect Prisma client
  try {
    const prismaClient = (global as any).__PRISMA_CLIENT__;
    if (prismaClient) {
      console.log('[GLOBAL-TEARDOWN] ⚙️  Disconnecting Prisma client...');
      await prismaClient.$disconnect();
      console.log('[GLOBAL-TEARDOWN] ✓ Prisma client disconnected');
    }
  } catch (error) {
    console.error('[GLOBAL-TEARDOWN] ❌ Error disconnecting Prisma:', error);
    errors.push(error as Error);
  }

  // Stop container
  try {
    const container = (global as any)
      .__TESTCONTAINER__ as StartedPostgreSqlContainer;
    if (container) {
      console.log('[GLOBAL-TEARDOWN] ⚙️  Stopping PostgreSQL container...');
      await container.stop();
      console.log('[GLOBAL-TEARDOWN] ✓ Container stopped');
    }
  } catch (error) {
    console.error('[GLOBAL-TEARDOWN] ❌ Error stopping container:', error);
    errors.push(error as Error);
  }

  // Clean up global references
  delete (global as any).__TESTCONTAINER__;
  delete (global as any).__PRISMA_CLIENT__;
  delete (global as any).__PRISMA_SERVICE__;

  if (errors.length > 0) {
    console.warn(
      `\n⚠️  [GLOBAL-TEARDOWN] Cleanup completed with ${errors.length} error(s)\n`,
    );
  } else {
    console.log(
      '\n✅ [GLOBAL-TEARDOWN] Global cleanup completed successfully\n',
    );
  }
}
