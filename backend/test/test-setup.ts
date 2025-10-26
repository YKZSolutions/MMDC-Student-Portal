import { INestApplication } from '@nestjs/common';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { TestAppService } from './test-app.service';

export interface TestContext {
  testService: TestAppService;
  prismaClient: ExtendedPrismaClient;
  adminApp: INestApplication;
  mentorApp: INestApplication;
  studentApp: INestApplication;
  unauthApp: INestApplication;
}

// Test context for the current test suite
let testContext: TestContext | null = null;

/**
 * Setup test environment for a test suite
 *
 * This should be called in beforeAll() of each test file.
 * It reuses the global database and creates app instances.
 */
export async function setupTestEnvironment(): Promise<TestContext> {
  console.log('[TEST-SETUP] ⚙️  Creating test context...');

  // Create a test service instance
  const testService = new TestAppService();
  await testService.start();

  // Create app instances for different user roles
  console.log('[TEST-SETUP] ⚙️  Creating app instances...');
  const { app: adminApp } = await testService.createTestApp();
  const { app: mentorApp } = await testService.createTestApp(
    testService.getMockUser('mentor'),
  );
  const { app: studentApp } = await testService.createTestApp(
    testService.getMockUser('student'),
  );
  const { app: unauthApp } = await testService.createTestApp(
    testService.getMockUser('unauth'),
  );

  testContext = {
    testService,
    prismaClient: testService.prismaClient,
    adminApp,
    mentorApp,
    studentApp,
    unauthApp,
  };

  console.log('[TEST-SETUP] ✓ Test context ready');
  return testContext;
}

/**
 * Cleanup test environment
 *
 * This should be called in afterAll() of each test file.
 */
export async function cleanupTestEnvironment(): Promise<void> {
  if (testContext) {
    console.log('[TEST-SETUP] 🧹 Cleaning up test context...');
    await testContext.testService?.close();
    await testContext.testService.resetDatabase();
    testContext = null;
    console.log('[TEST-SETUP] ✓ Cleanup completed');
  }
}
