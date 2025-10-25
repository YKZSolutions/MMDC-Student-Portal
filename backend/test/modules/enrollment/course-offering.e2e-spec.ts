import request from 'supertest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TestContext,
} from '../../test-setup';

/* eslint-disable @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
*/
describe('CourseOfferingController (Integration)', () => {
  let context: TestContext;
  let testEnrollmentId: string;

  const createCourseOfferingPayload = {
    courseId: '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11',
    sectionName: 'Section A',
    maxSlots: 30,
  };

  const createCurriculumOfferingsPayload = {
    curriculumId: '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11',
    yearLevel: 1,
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();

    // Create a pricing group first (required for enrollment period)
    const pricingGroup = await context.prismaClient.pricingGroup.create({
      data: {
        name: 'Test Pricing Group',
        amount: '50000',
        prices: {
          create: [
            {
              name: 'Tuition Fee',
              amount: '45000',
              type: 'tuition',
            },
          ],
        },
      },
    });

    // Create an enrollment period for testing
    const { body: enrollment } = await request(context.adminApp.getHttpServer())
      .post('/enrollments')
      .send({
        startYear: 2024,
        endYear: 2025,
        term: 1,
        startDate: '2024-09-01T00:00:00Z',
        endDate: '2024-12-20T00:00:00Z',
        status: 'active',
        pricingGroupId: pricingGroup.id,
      })
      .expect(201);

    testEnrollmentId = enrollment.id;
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- POST /enrollments/:enrollmentId/offerings ---
  describe('POST /enrollments/:enrollmentId/offerings', () => {
    it('should return 400 (Bad Request) for non-existent enrollment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .post(`/enrollments/${nonExistentId}/offerings`)
        .send(createCourseOfferingPayload)
        .expect(400);
    });

    it('should return 400 (Bad Request) for non-existent course ID', async () => {
      await request(context.adminApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/offerings`)
        .send(createCourseOfferingPayload)
        .expect(400);
    });

    it('should return 403 (Forbidden) if a student tries to create course offering', async () => {
      await request(context.studentApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/offerings`)
        .send(createCourseOfferingPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create course offering', async () => {
      await request(context.mentorApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/offerings`)
        .send(createCourseOfferingPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/offerings`)
        .send(createCourseOfferingPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/offerings`)
        .send({ sectionName: 'Test' })
        .expect(400);
    });

    it('should return 400 (Bad Request) for invalid enrollment UUID format', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/enrollments/invalid-uuid/offerings')
        .send(createCourseOfferingPayload)
        .expect(400);
    });
  });

  // --- POST /enrollments/:enrollmentId/curriculum ---
  describe('POST /enrollments/:enrollmentId/curriculum', () => {
    it('should return 400 (Bad Request) for non-existent enrollment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .post(`/enrollments/${nonExistentId}/curriculum`)
        .send(createCurriculumOfferingsPayload)
        .expect(400);
    });

    it('should return 400 (Bad Request) for non-existent curriculum ID', async () => {
      await request(context.adminApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/curriculum`)
        .send(createCurriculumOfferingsPayload)
        .expect(400);
    });

    it('should return 403 (Forbidden) if a student tries to create curriculum offerings', async () => {
      await request(context.studentApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/curriculum`)
        .send(createCurriculumOfferingsPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/curriculum`)
        .send(createCurriculumOfferingsPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post(`/enrollments/${testEnrollmentId}/curriculum`)
        .send({ yearLevel: 1 })
        .expect(400);
    });
  });

  // --- GET /enrollments/:enrollmentId/offerings ---
  describe('GET /enrollments/:enrollmentId/offerings', () => {
    it('should return list of course offerings for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/enrollments/${testEnrollmentId}/offerings`)
        .expect(200);

      expect(body).toHaveProperty('courseOfferings');
      expect(Array.isArray(body.courseOfferings)).toBe(true);
    });

    it('should allow students to view course offerings (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get(`/enrollments/${testEnrollmentId}/offerings`)
        .expect(200);

      expect(body).toHaveProperty('courseOfferings');
      expect(Array.isArray(body.courseOfferings)).toBe(true);
    });

    it('should return 403 (Forbidden) when mentor tries to view offerings', async () => {
      await request(context.mentorApp.getHttpServer())
        .get(`/enrollments/${testEnrollmentId}/offerings`)
        .expect(403);
    });

    it('should return 200 with empty results for non-existent enrollment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/enrollments/${nonExistentId}/offerings`)
        .expect(200);

      expect(body.courseOfferings).toEqual([]);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/enrollments/${testEnrollmentId}/offerings`)
        .expect(401);
    });

    it('should support pagination with page parameter', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/enrollments/${testEnrollmentId}/offerings?page=1`)
        .expect(200);

      expect(body).toHaveProperty('meta');
    });

    it('should return 400 (Bad Request) for invalid enrollment UUID format', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/enrollments/invalid-uuid/offerings')
        .expect(400);
    });
  });

  // --- GET /enrollments/:enrollmentId/offerings/:offeringId ---
  describe('GET /enrollments/:enrollmentId/offerings/:offeringId', () => {
    it('should return 404 (Not Found) for non-existent offering ID', async () => {
      const nonExistentOfferingId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(
          `/enrollments/${testEnrollmentId}/offerings/${nonExistentOfferingId}`,
        )
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testOfferingId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .get(`/enrollments/${testEnrollmentId}/offerings/${testOfferingId}`)
        .expect(401);
    });

    it('should return 400 (Bad Request) for invalid offering UUID format', async () => {
      await request(context.adminApp.getHttpServer())
        .get(`/enrollments/${testEnrollmentId}/offerings/invalid-uuid`)
        .expect(400);
    });
  });

  // --- DELETE /enrollments/:enrollmentId/offerings/:offeringId ---
  describe('DELETE /enrollments/:enrollmentId/offerings/:offeringId', () => {
    it('should return 404 (Not Found) for non-existent offering ID', async () => {
      const nonExistentOfferingId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(
          `/enrollments/${testEnrollmentId}/offerings/${nonExistentOfferingId}`,
        )
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete offering', async () => {
      const testOfferingId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .delete(`/enrollments/${testEnrollmentId}/offerings/${testOfferingId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to delete offering', async () => {
      const testOfferingId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .delete(`/enrollments/${testEnrollmentId}/offerings/${testOfferingId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testOfferingId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .delete(`/enrollments/${testEnrollmentId}/offerings/${testOfferingId}`)
        .expect(401);
    });
  });
});
