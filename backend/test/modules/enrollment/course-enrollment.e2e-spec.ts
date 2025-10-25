import request from 'supertest';
import { createModuleSetup } from '../../factories/lms.factory';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TestContext,
} from '../../test-setup';

/* eslint-disable @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
*/
describe('CourseEnrollmentController (Integration)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await setupTestEnvironment();

    // Create test data for enrollment tests
    const setup = createModuleSetup({ type: 'tree' });
    const studentUserId =
      context.testService.getMockUser('student').user_metadata.user_id;

    // Create enrollment period
    const period = await context.prismaClient.enrollmentPeriod.create({
      data: setup.enrollmentPeriod,
    });

    // Create course
    const course = await context.prismaClient.course.create({
      data: setup.course,
    });

    // Create a course offering
    const offering = await context.prismaClient.courseOffering.create({
      data: setup.courseOffering(course.id, period.id),
    });

    // Create a course section
    const section = await context.prismaClient.courseSection.create({
      data: setup.courseSection(offering.id),
    });

    // Create an enrollment for the student with 'enlisted' status
    await context.prismaClient.courseEnrollment.create({
      data: {
        courseOfferingId: offering.id,
        courseSectionId: section.id,
        studentId: studentUserId,
        status: 'enlisted', // Must be 'enlisted' or 'finalized' to be returned by the endpoint
        startedAt: new Date(),
      },
    });
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- POST /enrollment/student/sections ---
  describe('POST /enrollment/student/sections', () => {
    it('should return list of enrolled sections for student (201)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .post('/enrollment/student/sections')
        .expect(201);

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('courseSection');
        expect(body[0]).toHaveProperty('courseOffering');
      }
    });

    it('should allow admin to get enrollments (201)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/enrollment/student/sections')
        .expect(201);

      expect(Array.isArray(body)).toBe(true);
    });

    it('should allow mentor to get enrollments (201)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .post('/enrollment/student/sections')
        .expect(201);

      expect(Array.isArray(body)).toBe(true);
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
    it('should return 400 (Bad Request) when no active enrollment exists', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/enrollment/student/finalize')
        .send({})
        .expect(400);
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
