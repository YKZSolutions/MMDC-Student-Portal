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

export async function setupTestEnvironment(): Promise<TestContext> {
  const testService = new TestAppService();
  await testService.start();
  const { prismaClient } = await testService.start();

  // Pre-create frequently used app instances
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

  // Reset the database at once for all tests
  await testService.resetDatabase();

  return {
    testService,
    prismaClient,
    adminApp,
    mentorApp,
    studentApp,
    unauthApp,
  };
}

export async function teardownTestEnvironment(
  context: TestContext,
): Promise<void> {
  await context.testService.close();
}
