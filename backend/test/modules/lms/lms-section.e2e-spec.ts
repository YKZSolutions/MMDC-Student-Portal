import request from 'supertest';
import {
    setupTestEnvironment,
    teardownTestEnvironment,
    TestContext,
} from '../../test-setup';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('LmsSectionController (Integration)', () => {
  let context: TestContext;
  let testModuleId: string;

  const createSectionPayload = {
    title: 'Introduction Section',
    description: 'This section covers the basics',
    order: 1,
  };

  const updateSectionPayload = {
    title: 'Updated Section Title',
    description: 'Updated description',
    order: 2,
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();

    // We'll use a placeholder module ID for testing
    // In a real scenario, you'd create a module first
    testModuleId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // --- POST /modules/:moduleId/sections ---
  describe('POST /modules/:moduleId/sections', () => {
    it('should return 404 (Not Found) for non-existent module ID', async () => {
      await request(context.adminApp.getHttpServer())
        .post(`/modules/${testModuleId}/sections`)
        .send(createSectionPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) if a student tries to create a section', async () => {
      await request(context.studentApp.getHttpServer())
        .post(`/modules/${testModuleId}/sections`)
        .send(createSectionPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a section', async () => {
      await request(context.mentorApp.getHttpServer())
        .post(`/modules/${testModuleId}/sections`)
        .send(createSectionPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post(`/modules/${testModuleId}/sections`)
        .send(createSectionPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post(`/modules/${testModuleId}/sections`)
        .send({ title: 'Test' })
        .expect(400);
    });

    it('should return 400 (Bad Request) for invalid UUID format', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/modules/invalid-uuid/sections')
        .send(createSectionPayload)
        .expect(400);
    });
  });

  // --- GET /modules/:moduleId/sections ---
  describe('GET /modules/:moduleId/sections', () => {
    it('should return 404 (Not Found) for non-existent module ID', async () => {
      await request(context.adminApp.getHttpServer())
        .get(`/modules/${testModuleId}/sections`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/modules/${testModuleId}/sections`)
        .expect(401);
    });

    it('should return 400 (Bad Request) for invalid UUID format', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/modules/invalid-uuid/sections')
        .expect(400);
    });
  });

  // --- GET /modules/:moduleId/sections/:moduleSectionId ---
  describe('GET /modules/:moduleId/sections/:moduleSectionId', () => {
    it('should return 404 (Not Found) for non-existent section ID', async () => {
      const nonExistentSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/modules/${testModuleId}/sections/${nonExistentSectionId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .get(`/modules/${testModuleId}/sections/${testSectionId}`)
        .expect(401);
    });

    it('should return 400 (Bad Request) for invalid section UUID format', async () => {
      await request(context.adminApp.getHttpServer())
        .get(`/modules/${testModuleId}/sections/invalid-uuid`)
        .expect(400);
    });
  });

  // --- PATCH /modules/:moduleId/sections/:moduleSectionId ---
  describe('PATCH /modules/:moduleId/sections/:moduleSectionId', () => {
    it('should return 404 (Not Found) for non-existent section ID', async () => {
      const nonExistentSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .patch(`/modules/${testModuleId}/sections/${nonExistentSectionId}`)
        .send(updateSectionPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to update section', async () => {
      const testSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .patch(`/modules/${testModuleId}/sections/${testSectionId}`)
        .send(updateSectionPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) when student tries to update section', async () => {
      const testSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .patch(`/modules/${testModuleId}/sections/${testSectionId}`)
        .send(updateSectionPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .patch(`/modules/${testModuleId}/sections/${testSectionId}`)
        .send(updateSectionPayload)
        .expect(401);
    });
  });

  // --- DELETE /modules/:moduleId/sections/:moduleSectionId ---
  describe('DELETE /modules/:moduleId/sections/:moduleSectionId', () => {
    it('should return 404 (Not Found) for non-existent section ID', async () => {
      const nonExistentSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(`/modules/${testModuleId}/sections/${nonExistentSectionId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete section', async () => {
      const testSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .delete(`/modules/${testModuleId}/sections/${testSectionId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to delete section', async () => {
      const testSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .delete(`/modules/${testModuleId}/sections/${testSectionId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testSectionId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .delete(`/modules/${testModuleId}/sections/${testSectionId}`)
        .expect(401);
    });
  });
});
