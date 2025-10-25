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
describe('EnrollmentController (Integration)', () => {
  let context: TestContext;
  let testPricingGroupId: string;

  const createEnrollmentPayload = {
    startYear: 2024,
    endYear: 2025,
    term: 1,
    startDate: '2024-09-01T00:00:00Z',
    endDate: '2024-12-20T00:00:00Z',
    status: 'draft',
    pricingGroupId: '', // Will be set in beforeAll
  };

  const updateEnrollmentPayload = {
    startDate: '2024-09-15T00:00:00Z',
    endDate: '2024-12-31T00:00:00Z',
    pricingGroupId: '', // Will be set in beforeAll
  };

  const updateStatusPayload = {
    status: 'closed',
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();

    // Create a pricing group that can be reused
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

    testPricingGroupId = pricingGroup.id;
    createEnrollmentPayload.pricingGroupId = testPricingGroupId;
    updateEnrollmentPayload.pricingGroupId = testPricingGroupId;
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- POST /enrollments ---
  describe('POST /enrollments', () => {
    it('should allow an admin to create a new enrollment period (201)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send(createEnrollmentPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.startYear).toBe(createEnrollmentPayload.startYear);
      expect(body.endYear).toBe(createEnrollmentPayload.endYear);
      expect(body.term).toBe(createEnrollmentPayload.term);
      expect(body.status).toBe(createEnrollmentPayload.status);
    });

    it('should return 409 (Conflict) if enrollment period already exists for the same year/term', async () => {
      // First create an enrollment with unique year/term
      const uniquePayload = {
        ...createEnrollmentPayload,
        startYear: 2099,
        endYear: 2100,
      };
      
      await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send(uniquePayload)
        .expect(201);

      // Try to create duplicate
      await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send(uniquePayload)
        .expect(409);
    });

    it('should return 403 (Forbidden) if a student tries to create enrollment period', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/enrollments')
        .send(createEnrollmentPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create enrollment period', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/enrollments')
        .send(createEnrollmentPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/enrollments')
        .send(createEnrollmentPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send({ startYear: 2024 })
        .expect(400);
    });
  });

  // --- GET /enrollments ---
  describe('GET /enrollments', () => {
    beforeAll(async () => {
      await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send({
          ...createEnrollmentPayload,
          startYear: 2025,
          endYear: 2026,
        })
        .expect(201);
    });

    it('should return paginated list of enrollments for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/enrollments')
        .expect(200);

      expect(body).toHaveProperty('enrollments');
      expect(Array.isArray(body.enrollments)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should allow students to view enrollments (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/enrollments')
        .expect(200);

      expect(body).toHaveProperty('enrollments');
      expect(Array.isArray(body.enrollments)).toBe(true);
    });

    it('should allow mentors to view enrollments (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .get('/enrollments')
        .expect(200);

      expect(body).toHaveProperty('enrollments');
      expect(Array.isArray(body.enrollments)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/enrollments')
        .expect(401);
    });

    it('should support pagination with page parameter', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/enrollments?page=1')
        .expect(200);

      expect(body.meta).toHaveProperty('currentPage', 1);
    });
  });

  // --- GET /enrollments/active ---
  describe('GET /enrollments/active', () => {
    it('should return the active enrollment period for admin (200)', async () => {
      // Create an active enrollment
      const { body: created } = await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send({
          ...createEnrollmentPayload,
          startYear: 2026,
          endYear: 2027,
          status: 'active',
        })
        .expect(201);

      const { body } = await request(context.adminApp.getHttpServer())
        .get('/enrollments/active')
        .expect(200);

      expect(body).toHaveProperty('id');
      expect(body.status).toBe('active');
    });

    it('should allow students to view active enrollment (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/enrollments/active')
        .expect(200);

      expect(body).toHaveProperty('id');
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/enrollments/active')
        .expect(401);
    });
  });

  // --- GET /enrollments/:enrollmentId ---
  describe('GET /enrollments/:enrollmentId', () => {
    let createdEnrollmentId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send({
          ...createEnrollmentPayload,
          startYear: 2027,
          endYear: 2028,
        })
        .expect(201);
      createdEnrollmentId = body.id;
    });

    it('should return specific enrollment by ID for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/enrollments/${createdEnrollmentId}`)
        .expect(200);

      expect(body).toHaveProperty('id', createdEnrollmentId);
    });

    it('should allow students to view enrollment by ID (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get(`/enrollments/${createdEnrollmentId}`)
        .expect(200);

      expect(body).toHaveProperty('id', createdEnrollmentId);
    });

    it('should return 404 (Not Found) for non-existent enrollment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/enrollments/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/enrollments/${createdEnrollmentId}`)
        .expect(401);
    });
  });

  // --- PATCH /enrollments/:enrollmentId ---
  describe('PATCH /enrollments/:enrollmentId', () => {
    let createdEnrollmentId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send({
          ...createEnrollmentPayload,
          startYear: 2028,
          endYear: 2029,
        })
        .expect(201);
      createdEnrollmentId = body.id;
    });

    it('should allow admin to update enrollment (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/enrollments/${createdEnrollmentId}`)
        .send(updateEnrollmentPayload)
        .expect(200);

      expect(body.id).toBe(createdEnrollmentId);
    });

    it('should return 404 (Not Found) for non-existent enrollment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .patch(`/enrollments/${nonExistentId}`)
        .send(updateEnrollmentPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to update enrollment', async () => {
      await request(context.mentorApp.getHttpServer())
        .patch(`/enrollments/${createdEnrollmentId}`)
        .send(updateEnrollmentPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) when student tries to update enrollment', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/enrollments/${createdEnrollmentId}`)
        .send(updateEnrollmentPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/enrollments/${createdEnrollmentId}`)
        .send(updateEnrollmentPayload)
        .expect(401);
    });
  });

  // --- PATCH /enrollments/:enrollmentId/status ---
  describe('PATCH /enrollments/:enrollmentId/status', () => {
    let createdEnrollmentId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/enrollments')
        .send({
          ...createEnrollmentPayload,
          startYear: 2029,
          endYear: 2030,
        })
        .expect(201);
      createdEnrollmentId = body.id;
    });

    it('should allow admin to update enrollment status (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/enrollments/${createdEnrollmentId}/status`)
        .send(updateStatusPayload)
        .expect(200);

      expect(body.status).toBe(updateStatusPayload.status);
    });

    it('should return 404 (Not Found) for non-existent enrollment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .patch(`/enrollments/${nonExistentId}/status`)
        .send(updateStatusPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to update status', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/enrollments/${createdEnrollmentId}/status`)
        .send(updateStatusPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/enrollments/${createdEnrollmentId}/status`)
        .send(updateStatusPayload)
        .expect(401);
    });
  });

  // --- DELETE /enrollments/:enrollmentId ---
  describe('DELETE /enrollments/:enrollmentId', () => {
    it('should soft delete first, then permanently delete on second call', async () => {
      const { body: enrollment } = await request(
        context.adminApp.getHttpServer(),
      )
        .post('/enrollments')
        .send({
          ...createEnrollmentPayload,
          startYear: 2030,
          endYear: 2031,
        })
        .expect(201);

      const soft = await request(context.adminApp.getHttpServer())
        .delete(`/enrollments/${enrollment.id}`)
        .expect(200);
      expect(soft.body.message).toContain('marked for deletion');

      const second = await request(context.adminApp.getHttpServer())
        .delete(`/enrollments/${enrollment.id}`)
        .expect(200);
      expect(second.body.message).toContain('permanently deleted');
    });

    it('should return 404 (Not Found) for non-existent enrollment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(`/enrollments/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { body: enrollment } = await request(
        context.adminApp.getHttpServer(),
      )
        .post('/enrollments')
        .send({
          ...createEnrollmentPayload,
          startYear: 2031,
          endYear: 2032,
        })
        .expect(201);

      await request(context.unauthApp.getHttpServer())
        .delete(`/enrollments/${enrollment.id}`)
        .expect(401);
    });
  });
});
