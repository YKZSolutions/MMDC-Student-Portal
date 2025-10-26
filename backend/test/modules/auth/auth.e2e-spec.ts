import request from 'supertest';
import {
  cleanupTestEnvironment,
  setupTestEnvironment,
  TestContext,
} from '../../test-setup';

/* eslint-disable @typescript-eslint/no-unsafe-argument,
 */
describe('AuthController (Integration)', () => {
  let context: TestContext;

  const validLoginPayload = {
    email: 'test@example.com',
    password: 'testpassword123',
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 60000);

  afterAll(async () => {
    await cleanupTestEnvironment();
  }, 30000);

  // --- POST /auth/login ---
  describe('POST /auth/login', () => {
    it('should return 401 (Unauthorized) with valid format but invalid credentials', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 400 (Bad Request) when password is missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('should return 400 (Bad Request) when email is missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({ password: 'testpassword123' })
        .expect(400);
    });

    it('should return 400 (Bad Request) when both email and password are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 400 (Bad Request) with invalid email format', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'testpassword123',
        })
        .expect(400);
    });

    it('should be publicly accessible without authentication token', async () => {
      // This test verifies the endpoint is public by using unauthApp
      const response = await request(context.unauthApp.getHttpServer())
        .post('/auth/login')
        .send(validLoginPayload);

      // Should not be 403 Forbidden (which would indicate endpoint requires auth)
      // The actual status depends on whether the credentials are valid
      expect(response.status).not.toBe(403);
      expect([200, 201, 401]).toContain(response.status);
    });
  });

  // --- GET /auth/:uid/metadata ---
  describe('GET /auth/:uid/metadata', () => {
    it('should return 404 (Not Found) for non-existent user UID', async () => {
      const nonExistentUid = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/auth/${nonExistentUid}/metadata`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to get user metadata', async () => {
      const testUid = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .get(`/auth/${testUid}/metadata`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to get user metadata', async () => {
      const testUid = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .get(`/auth/${testUid}/metadata`)
        .expect(403);
    });

    it('should handle invalid UUID format', async () => {
      const invalidUid = 'not-a-valid-uuid';
      // The endpoint should either return 400 for invalid UUID or 404 for not found
      // depending on implementation
      const response = await request(context.adminApp.getHttpServer()).get(
        `/auth/${invalidUid}/metadata`,
      );

      expect([400, 404, 500]).toContain(response.status);
    });
  });

  // Edge cases
  describe('Edge cases and error handling', () => {
    it('should handle malformed JSON in login request body (400)', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should handle SQL injection attempts in email field', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: "' OR '1'='1",
          password: 'test',
        })
        .expect(400); // Invalid email format - validation error
    });

    it('should handle XSS attempts in email field', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: '<script>alert("xss")</script>',
          password: 'test',
        })
        .expect(400); // Invalid email format - validation error
    });

    it('should handle extremely long email strings', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: longEmail,
          password: 'test',
        })
        .expect(400); // Invalid email format - validation error
    });

    it('should handle extremely long password strings', async () => {
      const longPassword = 'a'.repeat(10000);
      await request(context.adminApp.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: longPassword,
        })
        .expect(401);
    });
  });
});
