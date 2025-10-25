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
describe('PaymentsController (Integration)', () => {
  let context: TestContext;
  let testBillId: string;

  const createPaymentPayload = {
    payment: {
      amountPaid: '5000',
      paymentDate: '2024-09-01T00:00:00Z',
      paymentType: 'manual',
      notes: 'Test payment REF123456',
    },
  };

  const updatePaymentPayload = {
    amountPaid: '6000',
    paymentType: 'card',
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();

    // Create a pricing group first
    const pricingGroup = await context.prismaClient.pricingGroup.create({
      data: {
        name: 'Test Pricing Group for Payments',
        amount: '10000',
        prices: {
          create: [
            {
              name: 'Test Fee',
              amount: '10000',
              type: 'tuition',
            },
          ],
        },
      },
    });

    // Create a bill to use for payment tests
    const { body: bill } = await request(context.adminApp.getHttpServer())
      .post('/billing')
      .send({
        bill: {
          payerName: 'Test Payer',
          payerEmail: 'payer@test.com',
          billType: 'academic',
          paymentScheme: 'full',
          totalAmount: '10000',
          costBreakdown: [
            {
              name: 'Tuition Fee',
              cost: '10000',
              category: 'Tuition',
            },
          ],
        },
        dueDates: ['2024-09-01T00:00:00Z'],
      })
      .expect(201);

    testBillId = bill.id;
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- POST /billing/:billId/payments ---
  describe('POST /billing/:billId/payments', () => {
    it('should allow an admin to create a new payment (201)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send(createPaymentPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.amountPaid).toBe(createPaymentPayload.payment.amountPaid);
      expect(body.paymentType).toBe(createPaymentPayload.payment.paymentType);
      expect(body.notes).toBe(createPaymentPayload.payment.notes);
    });

    it('should return 403 (Forbidden) if a student tries to create a payment manually', async () => {
      await request(context.studentApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send(createPaymentPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a payment', async () => {
      await request(context.mentorApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send(createPaymentPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send(createPaymentPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) for non-existent bill ID', async () => {
      const nonExistentBillId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .post(`/billing/${nonExistentBillId}/payments`)
        .send(createPaymentPayload)
        .expect(400);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send({ payment: { amountPaid: '1000' } })
        .expect(400);
    });
  });

  // --- GET /billing/:billId/payments ---
  describe('GET /billing/:billId/payments', () => {
    beforeAll(async () => {
      // Create a payment for testing
      await request(context.adminApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send({
          payment: {
            amountPaid: '5000',
            paymentDate: '2024-09-01T00:00:00Z',
            paymentType: 'manual',
            notes: 'REF-GET-TEST',
          },
        })
        .expect(201);
    });

    it('should return list of payments for admin (200)', async () => {
      const body = await request(context.adminApp.getHttpServer())
        .get(`/billing/${testBillId}/payments`)
        .expect(200)
        .then((res) => res.body);

      expect(Array.isArray(body)).toBe(true);
    });

    it('should allow students to view their own bill payments (200)', async () => {
      const body = await request(context.studentApp.getHttpServer())
        .get(`/billing/${testBillId}/payments`)
        .expect(200)
        .then((res) => res.body);

      expect(Array.isArray(body)).toBe(true);
    });

    it('should allow mentors to view payments (200)', async () => {
      const body = await request(context.mentorApp.getHttpServer())
        .get(`/billing/${testBillId}/payments`)
        .expect(200)
        .then((res) => res.body);

      expect(Array.isArray(body)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/billing/${testBillId}/payments`)
        .expect(401);
    });

    it('should return 200 with empty array for non-existent bill ID', async () => {
      const nonExistentBillId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      const body = await request(context.adminApp.getHttpServer())
        .get(`/billing/${nonExistentBillId}/payments`)
        .expect(200)
        .then((res) => res.body);

      expect(Array.isArray(body)).toBe(true);
      expect(body).toEqual([]);
    });
  });

  // --- GET /billing/:billId/payments/:id ---
  describe('GET /billing/:billId/payments/:id', () => {
    let createdPaymentId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send({
          payment: {
            amountPaid: '5000',
            paymentDate: '2024-09-01T00:00:00Z',
            paymentType: 'manual',
            notes: 'REF-GETONE-TEST',
          },
        })
        .expect(201);
      createdPaymentId = body.id;
    });

    it('should return specific payment by ID for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/billing/${testBillId}/payments/${createdPaymentId}`)
        .expect(200);

      expect(body).toHaveProperty('id', createdPaymentId);
      expect(body.amountPaid).toBe('5000');
    });

    it('should return 404 (Not Found) for non-existent payment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/billing/${testBillId}/payments/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/billing/${testBillId}/payments/${createdPaymentId}`)
        .expect(401);
    });
  });

  // --- PATCH /billing/:billId/payments/:id ---
  describe('PATCH /billing/:billId/payments/:id', () => {
    let createdPaymentId: string;

    beforeAll(async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send({
          payment: {
            amountPaid: '5000',
            paymentDate: '2024-09-01T00:00:00Z',
            paymentType: 'manual',
            notes: 'REF-PATCH-TEST',
          },
        })
        .expect(201);
      createdPaymentId = body.id;
    });

    it('should allow admin to update payment (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/billing/${testBillId}/payments/${createdPaymentId}`)
        .send(updatePaymentPayload)
        .expect(200);

      expect(body.amountPaid).toBe(updatePaymentPayload.amountPaid);
      expect(body.paymentType).toBe(updatePaymentPayload.paymentType);
    });

    it('should return 404 (Not Found) for non-existent payment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .patch(`/billing/${testBillId}/payments/${nonExistentId}`)
        .send(updatePaymentPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to update payment', async () => {
      await request(context.mentorApp.getHttpServer())
        .patch(`/billing/${testBillId}/payments/${createdPaymentId}`)
        .send(updatePaymentPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) when student tries to update payment', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/billing/${testBillId}/payments/${createdPaymentId}`)
        .send(updatePaymentPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/billing/${testBillId}/payments/${createdPaymentId}`)
        .send(updatePaymentPayload)
        .expect(401);
    });
  });

  // --- DELETE /billing/:billId/payments/:id ---
  describe('DELETE /billing/:billId/payments/:id', () => {
    it('should soft delete first, then permanently delete on second call', async () => {
      const { body: payment } = await request(context.adminApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send({
          payment: {
            amountPaid: '5000',
            paymentDate: '2024-09-01T00:00:00Z',
            paymentType: 'manual',
            notes: 'REF-DELETE-TEST',
          },
        })
        .expect(201);

      const soft = await request(context.adminApp.getHttpServer())
        .delete(`/billing/${testBillId}/payments/${payment.id}`)
        .expect(200);
      expect(soft.body.message).toContain('soft deleted');

      const second = await request(context.adminApp.getHttpServer())
        .delete(`/billing/${testBillId}/payments/${payment.id}`)
        .expect(200);
      expect(second.body.message).toContain('permanently deleted');
    });

    it('should return 404 (Not Found) for non-existent payment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(`/billing/${testBillId}/payments/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { body: payment } = await request(context.adminApp.getHttpServer())
        .post(`/billing/${testBillId}/payments`)
        .send({
          payment: {
            amountPaid: '5000',
            paymentDate: '2024-09-01T00:00:00Z',
            paymentType: 'manual',
            notes: 'REF-DELETE-UNAUTH',
          },
        })
        .expect(201);

      await request(context.unauthApp.getHttpServer())
        .delete(`/billing/${testBillId}/payments/${payment.id}`)
        .expect(401);
    });
  });

  // --- POST /billing/:billId/payments/pay (Payment Intent) ---
  describe('POST /billing/:billId/payments/pay', () => {
    it('should return 400 (Bad Request) for invalid payload with non-existent bill', async () => {
      const nonExistentBillId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      const initiatePaymentPayload = {
        amount: 5000,
        paymentMethod: 'card',
      };

      await request(context.studentApp.getHttpServer())
        .post(`/billing/${nonExistentBillId}/payments/pay`)
        .send(initiatePaymentPayload)
        .expect(400);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const initiatePaymentPayload = {
        amount: 5000,
        paymentMethod: 'card',
      };

      await request(context.unauthApp.getHttpServer())
        .post(`/billing/${testBillId}/payments/pay`)
        .send(initiatePaymentPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.studentApp.getHttpServer())
        .post(`/billing/${testBillId}/payments/pay`)
        .send({})
        .expect(400);
    });
  });
});
