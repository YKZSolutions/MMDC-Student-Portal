import request from 'supertest';
import { TestAppService } from './utils/test-app.service';
import { INestApplication } from '@nestjs/common';
import { v4 } from 'uuid';
import {
  createMajor,
  createMajorUpdate,
  createInvalidMajor,
} from './factories/major.factory';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('MajorsController (Integration)', () => {
  let testService: TestAppService;

  // Cache for frequently used app instances
  let adminApp: INestApplication;
  let studentApp: INestApplication;
  let mentorApp: INestApplication;
  let unauthApp: INestApplication;

  let createdMajorId: string;

  // Test data using factory functions with a proper API structure
  const validMajorPayload = createMajor({
    programId: v4(),
    majorCode: 'CS',
    name: 'Computer Science',
    description: 'Bachelor of Science in Computer Science',
  });
  const anotherValidMajorPayload = createMajor({
    programId: v4(),
    majorCode: 'MATH',
    name: 'Mathematics',
    description: 'Bachelor of Science in Mathematics',
  });
  const updatePayload = createMajorUpdate();

  beforeAll(async () => {
    testService = new TestAppService();
    await testService.start();

    // Pre-create frequently used app instances
    const { app: admin } = await testService.createTestApp();
    const { app: student } = await testService.createTestApp(
      testService.getMockUser('student'),
    );
    const { app: mentor } = await testService.createTestApp(
      testService.getMockUser('mentor'),
    );
    const { app: unauth } = await testService.createTestApp(
      testService.getMockUser('unauth'),
    );

    adminApp = admin;
    studentApp = student;
    mentorApp = mentor;
    unauthApp = unauth;
  }, 800000);

  afterAll(async () => {
    await testService.close();
    await TestAppService.closeAll(); // Clean up static resources
  });

  // --- POST /majors ---
  describe('POST /majors', () => {
    it('should allow admin to create a major (201)', async () => {
      await testService.resetDatabase();

      const { body } = await request(adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.major.majorCode).toBe(validMajorPayload.major.majorCode);
      expect(body.major.name).toBe(validMajorPayload.major.name);
      expect(body.major.description).toBe(validMajorPayload.major.description);
      expect(body.programId).toBe(validMajorPayload.programId);
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');

      createdMajorId = body.id;
    });

    it('should return 409 when creating duplicate code (409)', async () => {
      await testService.resetDatabase();

      await request(adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(409);
    });

    it('should return 400 for missing required fields', async () => {
      await request(adminApp.getHttpServer())
        .post('/majors')
        .send(createInvalidMajor.missingMajor())
        .expect(400);
    });

    it('should return 403 when student tries to create', async () => {
      await request(studentApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(403);
    });

    it('should return 403 when mentor tries to create', async () => {
      await request(mentorApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(403);
    });

    it('should return 401 when unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(401);
    });
  });

  // --- GET /majors ---
  describe('GET /majors', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create test data once for all GET tests
      await request(adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/majors')
        .send(anotherValidMajorPayload)
        .expect(201);
    });

    it('should return a list of majors with meta (200)', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .get('/majors?page=1')
        .expect(200);

      expect(body).toHaveProperty('majors');
      expect(Array.isArray(body.majors)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should support search by name', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .get('/majors?search=Computer')
        .expect(200);
      expect(
        body.majors.some((m: any) => m.major.name.includes('Computer')),
      ).toBe(true);
    });

    it('should return 400 for invalid page param', async () => {
      await request(adminApp.getHttpServer()).get('/majors?page=0').expect(400);
    });

    it('should return 403 for student', async () => {
      await request(studentApp.getHttpServer()).get('/majors').expect(403);
    });

    it('should return 403 for mentor', async () => {
      await request(mentorApp.getHttpServer()).get('/majors').expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer()).get('/majors').expect(401);
    });
  });

  // --- GET /majors/:id ---
  describe('GET /majors/:id', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test major for individual GET tests
      const { body } = await request(adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      createdMajorId = body.id;
    });

    it('should return a major by ID (200)', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .get(`/majors/${createdMajorId}`)
        .expect(200);
      expect(body.id).toBe(createdMajorId);
      expect(body.major.majorCode).toBe(validMajorPayload.major.majorCode);
      expect(body.major.name).toBe(validMajorPayload.major.name);
      expect(body.major.description).toBe(validMajorPayload.major.description);
      expect(body.programId).toBe(validMajorPayload.programId);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(adminApp.getHttpServer())
        .get(`/majors/${v4()}`)
        .expect(404);
    });

    it('should return 403 for student', async () => {
      await request(studentApp.getHttpServer())
        .get(`/majors/${createdMajorId}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .get(`/majors/${createdMajorId}`)
        .expect(401);
    });
  });

  // --- PATCH /majors/:id ---
  describe('PATCH /majors/:id', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test major for PATCH tests
      const { body } = await request(adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      createdMajorId = body.id;
    });

    it('should allow admin to update (200)', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send(updatePayload)
        .expect(200);
      expect(body.major.majorCode).toBe(updatePayload.majorCode);
      expect(body.major.name).toBe(updatePayload.name);
      expect(body.major.description).toBe(updatePayload.description);
    });

    it('should return 400 for invalid update data', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send(createInvalidMajor.updateMissingCode())
        .expect(400);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/majors/${v4()}`)
        .send(updatePayload)
        .expect(404);
    });

    it('should return 403 for student', async () => {
      await request(studentApp.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send(updatePayload)
        .expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send(updatePayload)
        .expect(401);
    });
  });

  // --- DELETE /majors/:id ---
  describe('DELETE /majors/:id', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test major for DELETE tests
      const { body } = await request(adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      createdMajorId = body.id;
    });

    it('should soft delete then permanently delete', async () => {
      const soft = await request(adminApp.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(200);
      expect(soft.body.message).toBe('Major marked for deletion');

      const hard = await request(adminApp.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(200);
      expect(hard.body.message).toBe('Major permanently deleted');
    });

    it('should return 404 for non-existent ID', async () => {
      await request(adminApp.getHttpServer())
        .delete(`/majors/${v4()}`)
        .expect(404);
    });

    it('should return 403 for student', async () => {
      await request(studentApp.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(401);
    });
  });
});
