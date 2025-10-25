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
describe('InstallmentController (Integration)', () => {
  let context: TestContext;
  let testBillId: string;

  beforeAll(async () => {
    context = await setupTestEnvironment();

    // Create a bill to use for installment tests
    const { body: bill } = await request(context.adminApp.getHttpServer())
      .post('/billing')
      .send({
        bill: {
          name: 'Test Bill for Installments',
          amount: 10000,
          semester: 1,
          schoolYear: '2024-2025',
        },
        dueDates: [
          {
            date: new Date('2024-09-01'),
            amount: 5000,
          },
          {
            date: new Date('2024-10-01'),
            amount: 5000,
          },
        ],
      })
      .expect(201);

    testBillId = bill.id;
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- GET /billing/:billId/installments ---
  describe('GET /billing/:billId/installments', () => {
    it('should return list of installments for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/billing/${testBillId}/installments`)
        .expect(200);

      expect(body).toHaveProperty('installments');
      expect(Array.isArray(body.installments)).toBe(true);
    });

    it('should allow students to view their own bill installments (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get(`/billing/${testBillId}/installments`)
        .expect(200);

      expect(body).toHaveProperty('installments');
      expect(Array.isArray(body.installments)).toBe(true);
    });

    it('should allow mentors to view installments (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .get(`/billing/${testBillId}/installments`)
        .expect(200);

      expect(body).toHaveProperty('installments');
      expect(Array.isArray(body.installments)).toBe(true);
    });

    it('should return 404 (Not Found) for non-existent bill ID', async () => {
      const nonExistentBillId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/billing/${nonExistentBillId}/installments`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/billing/${testBillId}/installments`)
        .expect(401);
    });
  });

  // --- GET /billing/:billId/installments/:id ---
  describe('GET /billing/:billId/installments/:id', () => {
    it('should return 404 (Not Found) for non-existent installment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/billing/${testBillId}/installments/${nonExistentId}`)
        .expect(404);
    });

    it('should return 404 (Not Found) for non-existent bill ID', async () => {
      const nonExistentBillId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      const testInstallmentId = '2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/billing/${nonExistentBillId}/installments/${testInstallmentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testInstallmentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .get(`/billing/${testBillId}/installments/${testInstallmentId}`)
        .expect(401);
    });
  });
});
