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
describe('NotificationsController (Integration)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- GET /notifications/count ---
  describe('GET /notifications/count', () => {
    it('should return notification counts for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/notifications/count')
        .expect(200);

      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('read');
      expect(body).toHaveProperty('unread');
      expect(typeof body.total).toBe('number');
      expect(typeof body.read).toBe('number');
      expect(typeof body.unread).toBe('number');
    });

    it('should return notification counts for student (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/notifications/count')
        .expect(200);

      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('read');
      expect(body).toHaveProperty('unread');
    });

    it('should return notification counts for mentor (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .get('/notifications/count')
        .expect(200);

      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('read');
      expect(body).toHaveProperty('unread');
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/notifications/count')
        .expect(401);
    });
  });

  // --- GET /notifications ---
  describe('GET /notifications', () => {
    it('should return paginated list of notifications for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/notifications')
        .expect(200);

      expect(body).toHaveProperty('notifications');
      expect(Array.isArray(body.notifications)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should return notifications for student (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/notifications')
        .expect(200);

      expect(body).toHaveProperty('notifications');
      expect(Array.isArray(body.notifications)).toBe(true);
    });

    it('should return notifications for mentor (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .get('/notifications')
        .expect(200);

      expect(body).toHaveProperty('notifications');
      expect(Array.isArray(body.notifications)).toBe(true);
    });

    it('should support pagination with page parameter', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/notifications?page=1')
        .expect(200);

      expect(body.meta).toHaveProperty('currentPage', 1);
    });

    it('should support filtering by read status', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/notifications?isRead=false')
        .expect(200);

      expect(body).toHaveProperty('notifications');
      expect(Array.isArray(body.notifications)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/notifications')
        .expect(401);
    });
  });

  // --- GET /notifications/:id ---
  describe('GET /notifications/:id', () => {
    it('should return 404 (Not Found) for non-existent notification ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/notifications/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .get(`/notifications/${testId}`)
        .expect(401);
    });
  });

  // --- POST /notifications/mark-read ---
  describe('POST /notifications/mark-read', () => {
    it('should allow marking notifications as read for admin (200)', async () => {
      const markReadPayload = {
        notificationIds: ['1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11'],
      };

      const { body } = await request(context.adminApp.getHttpServer())
        .post('/notifications/mark-read')
        .send(markReadPayload)
        .expect(200);

      expect(body).toHaveProperty('success');
    });

    it('should allow marking notifications as read for student (200)', async () => {
      const markReadPayload = {
        notificationIds: ['2f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11'],
      };

      const { body } = await request(context.studentApp.getHttpServer())
        .post('/notifications/mark-read')
        .send(markReadPayload)
        .expect(200);

      expect(body).toHaveProperty('success');
    });

    it('should return 400 (Bad Request) when notificationIds is missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/notifications/mark-read')
        .send({})
        .expect(400);
    });

    it('should return 400 (Bad Request) when notificationIds is not an array', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/notifications/mark-read')
        .send({ notificationIds: 'not-an-array' })
        .expect(400);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const markReadPayload = {
        notificationIds: ['1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11'],
      };

      await request(context.unauthApp.getHttpServer())
        .post('/notifications/mark-read')
        .send(markReadPayload)
        .expect(401);
    });
  });

  // --- GET /notifications/subscribe (SSE) ---
  describe('GET /notifications/subscribe', () => {
    it('should establish SSE connection for admin', async () => {
      const response = await request(context.adminApp.getHttpServer())
        .get('/notifications/subscribe')
        .set('Accept', 'text/event-stream')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/event-stream');
    });

    it('should establish SSE connection for student', async () => {
      const response = await request(context.studentApp.getHttpServer())
        .get('/notifications/subscribe')
        .set('Accept', 'text/event-stream')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/event-stream');
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/notifications/subscribe')
        .expect(401);
    });
  });
});
