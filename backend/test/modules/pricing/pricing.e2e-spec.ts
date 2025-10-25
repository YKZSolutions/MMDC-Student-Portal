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
describe('PricingController (Integration)', () => {
  let context: TestContext;

  const createPricingPayload = {
    name: 'Tuition Fee',
    amount: 50000,
    description: 'Per semester tuition fee',
  };

  const updatePricingPayload = {
    name: 'Updated Tuition Fee',
    amount: 55000,
    description: 'Updated description',
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // --- POST /pricing ---
  describe('POST /pricing', () => {
    it('should allow an admin to create a new pricing entry (201)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send(createPricingPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.name).toBe(createPricingPayload.name);
      expect(body.amount).toBe(createPricingPayload.amount);
      expect(body.description).toBe(createPricingPayload.description);
    });

    it('should return 403 (Forbidden) if a student tries to create a pricing entry', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/pricing')
        .send(createPricingPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a pricing entry', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/pricing')
        .send(createPricingPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/pricing')
        .send(createPricingPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({ name: 'Test' })
        .expect(400);
    });
  });

  // --- GET /pricing ---
  describe('GET /pricing', () => {
    beforeAll(async () => {
      await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({
          name: 'Lab Fee',
          amount: 3000,
          description: 'Laboratory fee per semester',
        })
        .expect(201);
    });

    it('should return paginated list of pricing entries for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/pricing')
        .expect(200);

      expect(body).toHaveProperty('pricings');
      expect(Array.isArray(body.pricings)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should support pagination with page parameter', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/pricing?page=1')
        .expect(200);

      expect(body.meta).toHaveProperty('currentPage', 1);
    });

    it('should return 403 (Forbidden) when student tries to get pricing', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/pricing')
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to get pricing', async () => {
      await request(context.mentorApp.getHttpServer())
        .get('/pricing')
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/pricing')
        .expect(401);
    });
  });

  // --- GET /pricing/:id ---
  describe('GET /pricing/:id', () => {
    let createdPricingId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({
          name: 'Miscellaneous Fee',
          amount: 2000,
          description: 'Other fees',
        })
        .expect(201);
      createdPricingId = body.id;
    });

    it('should return specific pricing by ID for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/pricing/${createdPricingId}`)
        .expect(200);

      expect(body).toHaveProperty('id', createdPricingId);
      expect(body.name).toBe('Miscellaneous Fee');
    });

    it('should return 404 (Not Found) for non-existent pricing ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/pricing/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to get a pricing by ID', async () => {
      await request(context.studentApp.getHttpServer())
        .get(`/pricing/${createdPricingId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to get a pricing by ID', async () => {
      await request(context.mentorApp.getHttpServer())
        .get(`/pricing/${createdPricingId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/pricing/${createdPricingId}`)
        .expect(401);
    });
  });

  // --- PATCH /pricing/:id ---
  describe('PATCH /pricing/:id', () => {
    let createdPricingId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({
          name: 'Registration Fee',
          amount: 1500,
          description: 'Registration fee per semester',
        })
        .expect(201);
      createdPricingId = body.id;
    });

    it('should allow admin to update pricing (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/pricing/${createdPricingId}`)
        .send(updatePricingPayload)
        .expect(200);

      expect(body.name).toBe(updatePricingPayload.name);
      expect(body.amount).toBe(updatePricingPayload.amount);
      expect(body.description).toBe(updatePricingPayload.description);
    });

    it('should return 404 (Not Found) for non-existent pricing ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .patch(`/pricing/${nonExistentId}`)
        .send(updatePricingPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to update pricing', async () => {
      await request(context.mentorApp.getHttpServer())
        .patch(`/pricing/${createdPricingId}`)
        .send(updatePricingPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) when student tries to update pricing', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/pricing/${createdPricingId}`)
        .send(updatePricingPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/pricing/${createdPricingId}`)
        .send(updatePricingPayload)
        .expect(401);
    });
  });

  // --- DELETE /pricing/:id ---
  describe('DELETE /pricing/:id', () => {
    it('should soft delete first, then permanently delete on second call', async () => {
      const { body: pricing } = await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({
          name: 'Temporary Fee',
          amount: 1000,
          description: 'Fee to be deleted',
        })
        .expect(201);

      const soft = await request(context.adminApp.getHttpServer())
        .delete(`/pricing/${pricing.id}`)
        .expect(200);
      expect(soft.body.message).toContain('marked for deletion');

      const second = await request(context.adminApp.getHttpServer())
        .delete(`/pricing/${pricing.id}`)
        .expect(200);
      expect(second.body.message).toContain('permanently deleted');

      await request(context.adminApp.getHttpServer())
        .get(`/pricing/${pricing.id}`)
        .expect(404);
    });

    it('should allow direct delete with query parameter', async () => {
      const { body: pricing } = await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({
          name: 'Direct Delete Fee',
          amount: 1000,
          description: 'Fee to be directly deleted',
        })
        .expect(201);

      const directDelete = await request(context.adminApp.getHttpServer())
        .delete(`/pricing/${pricing.id}?directDelete=true`)
        .expect(200);
      expect(directDelete.body.message).toContain('permanently deleted');

      await request(context.adminApp.getHttpServer())
        .get(`/pricing/${pricing.id}`)
        .expect(404);
    });

    it('should return 404 (Not Found) for non-existent pricing ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(`/pricing/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete pricing', async () => {
      const { body: pricing } = await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({
          name: 'Student Delete Test',
          amount: 1000,
          description: 'Test',
        })
        .expect(201);

      await request(context.studentApp.getHttpServer())
        .delete(`/pricing/${pricing.id}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { body: pricing } = await request(context.adminApp.getHttpServer())
        .post('/pricing')
        .send({
          name: 'Unauth Delete Test',
          amount: 1000,
          description: 'Test',
        })
        .expect(201);

      await request(context.unauthApp.getHttpServer())
        .delete(`/pricing/${pricing.id}`)
        .expect(401);
    });
  });
});
