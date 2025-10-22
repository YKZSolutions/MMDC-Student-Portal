import request from 'supertest';
import { TestAppService } from './utils/test-app.service';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { INestApplication } from '@nestjs/common';
import { v4 } from 'uuid';
import {
  createUser,
  createStudent,
  createStaff,
  createInvite,
  createUpdate,
  createInvalid,
} from './factories/user.factory';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('UsersController (Integration)', () => {
  let testService: TestAppService;
  let app: INestApplication;
  let prismaClient: ExtendedPrismaClient;

  // Cache for frequently used app instances
  let adminApp: INestApplication;
  let studentApp: INestApplication;
  let unauthApp: INestApplication;

  // Test payloads using simple factory functions
  const validUserPayload = createUser({ role: 'student' });
  const validStudentPayload = createStudent();
  const validStaffPayload = createStaff({ role: 'mentor' });

  beforeAll(async () => {
    testService = new TestAppService();
    await testService.start();
    const { prismaClient: p } = await testService.start();
    prismaClient = p;

    // Pre-create frequently used app instances
    const { app: admin } = await testService.createTestApp();
    const { app: student } = await testService.createTestApp(
      testService.getMockUser('student'),
    );
    const { app: unauth } = await testService.createTestApp(
      testService.getMockUser('unauth'),
    );

    adminApp = admin;
    studentApp = student;
    unauthApp = unauth;

    app = adminApp; // Default app for tests
  }, 800000);

  afterAll(async () => {
    await testService.close();
    await TestAppService.closeAll(); // Clean up static resources
  });

  describe('POST /users', () => {
    it('should create a new user with valid data when authenticated as admin (201)', async () => {
      await testService.resetDatabase();
      const response = await request(adminApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(validUserPayload.user.firstName);
      expect(response.body.role).toBe(validUserPayload.role);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidPayload = createInvalid.user.missingFields();

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 400 when an invalid role is provided', async () => {
      const invalidPayload = createInvalid.user.invalidRole();

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        testService.getMockUser('unauth'),
      );

      await request(unauthApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      const { app: studentApp } = await testService.createTestApp(
        testService.getMockUser('student'),
      );

      await request(studentApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(403);
    });
  });

  describe('GET /users', () => {
    it('should retrieve a paginated list of users when authenticated as admin (200)', async () => {
      const response = await request(adminApp.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should filter users by role query parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?role=student')
        .expect(200);

      expect(response.body.users.every((user) => user.role === 'student')).toBe(
        true,
      );
    });

    it('should filter users by search query parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?search=Dog')
        .expect(200);

      expect(
        response.body.users.every((user) => user.firstName.includes('Dog')),
      ).toBe(true);
    });

    it('should paginate results correctly with page query parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1')
        .expect(200);

      expect(response.body.meta.currentPage).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        testService.getMockUser('unauth'),
      );

      await request(unauthApp.getHttpServer()).get('/users').expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      const { app: studentApp } = await testService.createTestApp(
        testService.getMockUser('student'),
      );

      await request(studentApp.getHttpServer()).get('/users').expect(403);
    });
  });

  describe('GET /users/me', () => {
    it('should retrieve the full profile of the authenticated admin (200)', async () => {
      const { app: adminApp } = await testService.createTestApp(
        testService.getMockUser('admin'),
      );
      const response = await request(adminApp.getHttpServer())
        .get('/users/me')
        .expect(200);

      expect(response.body.role).toBe('admin');
      expect(response.body).toHaveProperty('staffDetails');
    });

    it('should retrieve the full profile of the authenticated mentor (200)', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        testService.getMockUser('mentor'),
      );
      const response = await request(mentorApp.getHttpServer())
        .get('/users/me')
        .expect(200);

      expect(response.body.role).toBe('mentor');
      expect(response.body).toHaveProperty('staffDetails');
    });

    it('should retrieve the full profile of the authenticated student (200)', async () => {
      const { app: studentApp } = await testService.createTestApp(
        testService.getMockUser('student'),
      );
      const response = await request(studentApp.getHttpServer())
        .get('/users/me')
        .expect(200);

      expect(response.body.role).toBe('student');
      expect(response.body).toHaveProperty('studentDetails');
    });

    it('should return 401 when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        testService.getMockUser('unauth'),
      );

      await request(unauthApp.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('PUT /users/me', () => {
    const updatedUserPayload = createUpdate.user();

    it('should update the personal details of the authenticated user (200)', async () => {
      await testService.resetDatabase();

      const response = await request(adminApp.getHttpServer())
        .put('/users/me')
        .send(updatedUserPayload)
        .expect(200);

      expect(response.body.firstName).toBe(updatedUserPayload.user.firstName);
    });

    it('should return 400 when invalid data is provided', async () => {
      const invalidPayload = createInvalid.user.invalidType();

      await request(app.getHttpServer())
        .put('/users/me')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .put('/users/me')
        .send(updatedUserPayload)
        .expect(401);
    });
  });

  describe('GET /users/{id}', () => {
    it('should retrieve a specific user by ID when authenticated as admin (200)', async () => {
      const createUserResponse = await request(adminApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);

      const createdUserId = createUserResponse.body.id;

      const response = await request(adminApp.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body.id).toBe(createdUserId);
    });

    it('should return 400 for an invalid ID format', async () => {
      await request(app.getHttpServer()).get('/users/invalid-id').expect(400);
    });

    it('should return 404 for a non-existent user ID', async () => {
      const nonExistentId = '11111111-1111-1111-1111-111111111111';
      await request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        testService.getMockUser('unauth'),
      );

      await request(unauthApp.getHttpServer())
        .get(`/users/${v4()}`)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      const { app: studentApp } = await testService.createTestApp(
        testService.getMockUser('student'),
      );

      await request(studentApp.getHttpServer())
        .get(`/users/${v4()}`)
        .expect(403);
    });
  });

  describe('PATCH /users/{id}/status', () => {
    let createdUserId: string;

    beforeAll(async () => {
      const createUserResponse = await request(adminApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);

      createdUserId = createUserResponse.body.id;
    });

    it('should successfully disable a user when authenticated as admin (200)', async () => {
      const response = await request(adminApp.getHttpServer())
        .patch(`/users/${createdUserId}/status`)
        .send({ status: 'disabled' })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User disabled successfully.',
      );
    });

    it('should successfully enable a user when authenticated as admin (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/status`)
        .send({ status: 'active' })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User enabled successfully.',
      );
    });

    it('should return 404 for a non-existent user ID', async () => {
      const nonExistentId = '11111111-1111-1111-1111-111111111111';
      await request(app.getHttpServer())
        .patch(`/users/${nonExistentId}/status`)
        .send({ status: 'disabled' })
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .patch(`/users/${createdUserId}/status`)
        .send({ status: 'disabled' })
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      await request(studentApp.getHttpServer())
        .patch(`/users/${createdUserId}/status`)
        .send({ status: 'disabled' })
        .expect(403);
    });
  });

  describe('DELETE /users/{id}', () => {
    it('should soft-delete a user by default when authenticated as admin (200)', async () => {
      await testService.resetDatabase();

      const createUserResponse = await request(adminApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);

      const createdUserId = createUserResponse.body.id;

      const response = await request(adminApp.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User has been soft deleted',
      );
      const user = await prismaClient.user.findUnique({
        where: { id: createdUserId },
      });
      expect(user.deletedAt).not.toBeNull();
    });

    it('should permanently delete a user with directDelete=true query parameter when authenticated as admin (200)', async () => {
      await testService.resetDatabase();

      const createUserResponse = await request(adminApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);
      const tempUserId = createUserResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/users/${tempUserId}?directDelete=true`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User has been permanently deleted',
      );
      const user = await prismaClient.user.findUnique({
        where: { id: tempUserId },
      });
      expect(user).toBeNull();
    });

    it('should return 404 for a non-existent user ID', async () => {
      const nonExistentId = '11111111-1111-1111-1111-111111111111';
      await request(app.getHttpServer())
        .delete(`/users/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .delete(`/users/${v4()}`)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      await request(studentApp.getHttpServer())
        .delete(`/users/${v4()}`)
        .expect(403);
    });
  });

  describe('POST /users/student', () => {
    it('should create a new student user when authenticated as admin (201)', async () => {
      await testService.resetDatabase();

      const response = await request(adminApp.getHttpServer())
        .post('/users/student')
        .send(validStudentPayload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.role).toBe('student');
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidPayload = createInvalid.student.missingFields();

      await request(app.getHttpServer())
        .post('/users/student')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .post('/users/student')
        .send(validStudentPayload)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      await request(studentApp.getHttpServer())
        .post('/users/student')
        .send(validStudentPayload)
        .expect(403);
    });
  });

  describe('POST /users/staff', () => {
    it('should create a new staff user (mentor or admin) when authenticated as admin (201)', async () => {
      await testService.resetDatabase();

      const response = await request(adminApp.getHttpServer())
        .post('/users/staff')
        .send(validStaffPayload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(['mentor', 'admin']).toContain(response.body.role);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidPayload = createInvalid.staff.missingFields();

      await request(app.getHttpServer())
        .post('/users/staff')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .post('/users/staff')
        .send(validStaffPayload)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      await request(studentApp.getHttpServer())
        .post('/users/staff')
        .send(validStaffPayload)
        .expect(403);
    });
  });

  describe('POST /users/invite', () => {
    const invitePayload = createInvite({ role: 'student' });

    it('should invite a new user with a valid email and role when authenticated as admin (201)', async () => {
      await testService.resetDatabase();

      const response = await request(adminApp.getHttpServer())
        .post('/users/invite')
        .send(invitePayload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(invitePayload.firstName);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidPayload = createInvalid.invite.missingFields();

      await request(app.getHttpServer())
        .post('/users/invite')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .post('/users/invite')
        .send(invitePayload)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      await request(studentApp.getHttpServer())
        .post('/users/invite')
        .send(invitePayload)
        .expect(403);
    });
  });

  describe('PUT /users/{id}/student', () => {
    const updateStudentPayload = createUpdate.student();

    it("should update a student's specific details when authenticated as admin (200)", async () => {
      await testService.resetDatabase();

      const createUserResponse = await request(adminApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);

      const createdStudentId = createUserResponse.body.id;

      const response = await request(adminApp.getHttpServer())
        .put(`/users/${createdStudentId}/student`)
        .send(updateStudentPayload)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdStudentId);
    });

    it('should return 400 when invalid data is provided', async () => {
      const invalidPayload = createInvalid.student.invalidType();

      await request(app.getHttpServer())
        .put(`/users/${v4()}/student`)
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 404 for a non-existent student ID', async () => {
      const nonExistentId = '11111111-1111-1111-1111-111111111111';
      await request(app.getHttpServer())
        .put(`/users/${nonExistentId}/student`)
        .send(updateStudentPayload)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .put(`/users/${v4()}/student`)
        .send(updateStudentPayload)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      await request(studentApp.getHttpServer())
        .put(`/users/${v4()}/student`)
        .send(updateStudentPayload)
        .expect(403);
    });
  });

  describe('PUT /users/{id}/staff', () => {
    const updateStaffPayload = createUpdate.staff();

    it("should update a staff member's specific details when authenticated as admin (200)", async () => {
      await testService.resetDatabase();

      const createUserResponse = await request(adminApp.getHttpServer())
        .post('/users')
        .send(validUserPayload)
        .expect(201);

      const createdStaffId = createUserResponse.body.id;

      const response = await request(adminApp.getHttpServer())
        .put(`/users/${createdStaffId}/staff`)
        .send(updateStaffPayload)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdStaffId);
    });

    it('should return 400 when invalid data is provided', async () => {
      const invalidPayload = createInvalid.staff.invalidNumber();

      await request(app.getHttpServer())
        .put(`/users/${v4()}/staff`)
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 404 for a non-existent staff ID', async () => {
      const nonExistentId = '11111111-1111-1111-1111-111111111111';
      await request(app.getHttpServer())
        .put(`/users/${nonExistentId}/staff`)
        .send(updateStaffPayload)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .put(`/users/${v4()}/staff`)
        .send(updateStaffPayload)
        .expect(401);
    });

    it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
      await request(studentApp.getHttpServer())
        .put(`/users/${v4()}/staff`)
        .send(updateStaffPayload)
        .expect(403);
    });
  });
});
