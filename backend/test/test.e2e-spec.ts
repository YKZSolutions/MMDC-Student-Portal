import request from 'supertest';
import { mockUsers } from './utils/mock-users';
import { Role } from '@prisma/client';
import { TestAppService } from './utils/test-app.service';

describe('UsersController (Integration)', () => {
  const testService = new TestAppService();
  let prisma;

  let createdUserId: string;

  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('The system cannot find the path specified')
    ) {
      return;
    }
    originalError(...args);
  };

  beforeAll(async () => {
    const { prisma: p } = await testService.start();
    prisma = p;
  }, 800000);

  afterAll(async () => {
    await testService.close();
  });

  describe('POST /users', () => {
    const validUserPayload = {
      role: 'student',
      user: {
        firstName: 'Dog',
        lastName: 'Junior',
      },
      credentials: {
        email: 'dog.junior@example.com',
        password: 'SecurePass123!',
      },
      userDetails: {
        dateJoined: new Date().toISOString(),
        dob: '2000-01-15T00:00:00.000Z',
        gender: 'male',
      },
    };

    it('should create a sample user', async () => {
      const sample = await prisma.user.create({
        data: {
          role: validUserPayload.role as Role,
          ...validUserPayload.user,
        },
      });

      expect(sample.firstName).toBe(validUserPayload.user.firstName);
    });

    it('should create a new user when authenticated as admin', async () => {
      const { app } = await testService.createTestApp();

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(validUserPayload.user.firstName);
      expect(response.body.lastName).toBe(validUserPayload.user.lastName);
      expect(response.body.role).toBe(validUserPayload.role);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Store the created user ID for cleanup
      createdUserId = response.body.id;
    });

    it('should return 401 when not authenticated', async () => {
      const { app } = await testService.createTestApp(mockUsers.unauth);

      await request(app.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(401);
    });

    it('should return 403 when authenticated as student (insufficient permissions)', async () => {
      const { app } = await testService.createTestApp(mockUsers.student);

      await request(app.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect((res) => {
          console.log('Response:', res.status, res.body);
        })
        .expect(403);
    });

    it('should return 400 when required fields are missing', async () => {
      const { app } = await testService.createTestApp();

      const invalidPayload = {
        ...validUserPayload,
        user: {
          firstName: 'John',
          // Missing lastName
        },
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Bad Request');
    });
  });
});
