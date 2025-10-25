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
describe('BillingController (Integration)', () => {
  let context: TestContext;

  const createBillingPayload = {
    bill: {
      name: 'Tuition Fee',
      amount: 50000,
      semester: 1,
      schoolYear: '2024-2025',
    },
    dueDates: [
      {
        date: new Date('2024-09-01'),
        amount: 25000,
      },
      {
        date: new Date('2024-10-01'),
        amount: 25000,
      },
    ],
  };

  const updateBillingPayload = {
    name: 'Updated Tuition Fee',
    amount: 55000,
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- POST /billing ---
  describe('POST /billing', () => {
    it('should allow an admin to create a new bill (201)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.name).toBe(createBillingPayload.bill.name);
      expect(body.amount).toBe(createBillingPayload.bill.amount);
      expect(body.semester).toBe(createBillingPayload.bill.semester);
      expect(body.schoolYear).toBe(createBillingPayload.bill.schoolYear);
      expect(body).toHaveProperty('dueDates');
      expect(Array.isArray(body.dueDates)).toBe(true);
    });

    it('should return 403 (Forbidden) if a student tries to create a bill', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a bill', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/billing')
        .send({ bill: { name: 'Test' } })
        .expect(400);
    });
  });

  // --- GET /billing ---
  describe('GET /billing', () => {
    let createdBillId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(201);
      createdBillId = body.id;
    });

    it('should return paginated list of bills for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/billing')
        .expect(200);

      expect(body).toHaveProperty('bills');
      expect(Array.isArray(body.bills)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should allow students to view their own bills (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/billing')
        .expect(200);

      expect(body).toHaveProperty('bills');
      expect(Array.isArray(body.bills)).toBe(true);
    });

    it('should allow mentors to view bills (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .get('/billing')
        .expect(200);

      expect(body).toHaveProperty('bills');
      expect(Array.isArray(body.bills)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/billing')
        .expect(401);
    });
  });

  // --- GET /billing/:id ---
  describe('GET /billing/:id', () => {
    let createdBillId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(201);
      createdBillId = body.id;
    });

    it('should return specific bill by ID for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/billing/${createdBillId}`)
        .expect(200);

      expect(body).toHaveProperty('id', createdBillId);
      expect(body.name).toBe(createBillingPayload.bill.name);
    });

    it('should return 404 (Not Found) for non-existent bill ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/billing/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/billing/${createdBillId}`)
        .expect(401);
    });
  });

  // --- PATCH /billing/:id ---
  describe('PATCH /billing/:id', () => {
    let createdBillId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(201);
      createdBillId = body.id;
    });

    it('should allow admin to update bill (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/billing/${createdBillId}`)
        .send(updateBillingPayload)
        .expect(200);

      expect(body.name).toBe(updateBillingPayload.name);
      expect(body.amount).toBe(updateBillingPayload.amount);
    });

    it('should return 404 (Not Found) for non-existent bill ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .patch(`/billing/${nonExistentId}`)
        .send(updateBillingPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to update bill', async () => {
      await request(context.mentorApp.getHttpServer())
        .patch(`/billing/${createdBillId}`)
        .send(updateBillingPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) when student tries to update bill', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/billing/${createdBillId}`)
        .send(updateBillingPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/billing/${createdBillId}`)
        .send(updateBillingPayload)
        .expect(401);
    });
  });

  // --- DELETE /billing/:id ---
  describe('DELETE /billing/:id', () => {
    it('should soft delete first, then permanently delete on second call', async () => {
      const { body: bill } = await request(context.adminApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(201);

      const soft = await request(context.adminApp.getHttpServer())
        .delete(`/billing/${bill.id}`)
        .expect(200);
      expect(soft.body.message).toContain('marked for deletion');

      const second = await request(context.adminApp.getHttpServer())
        .delete(`/billing/${bill.id}`)
        .expect(200);
      expect(second.body.message).toContain('permanently deleted');

      await request(context.adminApp.getHttpServer())
        .get(`/billing/${bill.id}`)
        .expect(404);
    });

    it('should return 404 (Not Found) for non-existent bill ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(`/billing/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { body: bill } = await request(context.adminApp.getHttpServer())
        .post('/billing')
        .send(createBillingPayload)
        .expect(201);

      await request(context.unauthApp.getHttpServer())
        .delete(`/billing/${bill.id}`)
        .expect(401);
    });
  });
});
