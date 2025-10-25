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
describe('CourseEnrollmentController (Integration)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- POST /enrollment/student/sections ---
  describe('POST /enrollment/student/sections', () => {
    it('should return list of enrolled sections for student (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .post('/enrollment/student/sections')
        .expect(200);

      expect(body).toHaveProperty('enrollments');
      expect(Array.isArray(body.enrollments)).toBe(true);
    });

    it('should allow admin to get enrollments (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/enrollment/student/sections')
        .expect(200);

      expect(body).toHaveProperty('enrollments');
      expect(Array.isArray(body.enrollments)).toBe(true);
    });

    it('should allow mentor to get enrollments (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .post('/enrollment/student/sections')
        .expect(200);

      expect(body).toHaveProperty('enrollments');
      expect(Array.isArray(body.enrollments)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/enrollment/student/sections')
        .expect(401);
    });
  });

  // --- GET /enrollment/student ---
  describe('GET /enrollment/student', () => {
    it('should return paginated list of all enrollments for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/enrollment/student')
        .expect(200);

      expect(body).toHaveProperty('enrollments');
      expect(Array.isArray(body.enrollments)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should support pagination with page parameter', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/enrollment/student?page=1')
        .expect(200);

      expect(body.meta).toHaveProperty('currentPage', 1);
    });

    it('should return 403 (Forbidden) when student tries to get all enrollments', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/enrollment/student')
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to get all enrollments', async () => {
      await request(context.mentorApp.getHttpServer())
        .get('/enrollment/student')
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/enrollment/student')
        .expect(401);
    });
  });

  // --- POST /enrollment/student/sections/:sectionId ---
  describe('POST /enrollment/student/sections/:sectionId', () => {
    it('should return 404 (Not Found) for non-existent section ID', async () => {
      const nonExistentSectionId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .post(`/enrollment/student/sections/${nonExistentSectionId}`)
        .send({})
        .expect(404);
    });

    it('should return 400 (Bad Request) for invalid section UUID format', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/enrollment/student/sections/invalid-uuid')
        .send({})
        .expect(400);
    });

    it('should return 403 (Forbidden) when mentor tries to enroll', async () => {
      const testSectionId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .post(`/enrollment/student/sections/${testSectionId}`)
        .send({})
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testSectionId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .post(`/enrollment/student/sections/${testSectionId}`)
        .send({})
        .expect(401);
    });
  });

  // --- DELETE /enrollment/student/sections/:sectionId ---
  describe('DELETE /enrollment/student/sections/:sectionId', () => {
    it('should return 404 (Not Found) for non-existent section ID', async () => {
      const nonExistentSectionId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .delete(`/enrollment/student/sections/${nonExistentSectionId}`)
        .expect(404);
    });

    it('should return 400 (Bad Request) for invalid section UUID format', async () => {
      await request(context.studentApp.getHttpServer())
        .delete('/enrollment/student/sections/invalid-uuid')
        .expect(400);
    });

    it('should return 403 (Forbidden) when mentor tries to drop enrollment', async () => {
      const testSectionId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .delete(`/enrollment/student/sections/${testSectionId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testSectionId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .delete(`/enrollment/student/sections/${testSectionId}`)
        .expect(401);
    });
  });

  // --- POST /enrollment/student/finalize ---
  describe('POST /enrollment/student/finalize', () => {
    it('should return 404 (Not Found) when no active enrollment exists', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/enrollment/student/finalize')
        .send({})
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to finalize', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/enrollment/student/finalize')
        .send({})
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/enrollment/student/finalize')
        .send({})
        .expect(401);
    });
  });
});
