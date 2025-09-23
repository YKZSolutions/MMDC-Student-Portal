import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestAppService } from './utils/test-app.service';
import { mockUsers } from './utils/mock-users';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';

describe('MajorsController (Integration)', () => {
  const testService = new TestAppService();
  let app: INestApplication;
  let prisma: ExtendedPrismaClient;
  let createdMajorId: string;

  const validMajorPayload = {
    code: 'CS',
    name: 'Computer Science',
    description: 'A program focused on computing and software engineering.',
  };

  const anotherValidMajorPayload = {
    code: 'MATH',
    name: 'Mathematics',
    description: 'Major in pure and applied mathematics.',
  };

  beforeAll(async () => {
    const { prisma: p } = await testService.start();
    prisma = p;
  }, 800000);

  afterAll(async () => {
    await testService.close();
  });

  // --- POST /majors ---
  describe('POST /majors', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should allow admin to create a major (201)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.code).toBe(validMajorPayload.code);
      createdMajorId = body.id;
    });

    it('should return 409 when creating duplicate code (409)', async () => {
      await request(app.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(409);
    });

    it('should return 400 for invalid payload', async () => {
      await request(app.getHttpServer())
        .post('/majors')
        .send({ code: 'ENG' }) // missing fields
        .expect(400);
    });

    it('should return 403 when student tries to create', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(403);
      await studentApp.close();
    });

    it('should return 403 when mentor tries to create', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(403);
      await mentorApp.close();
    });

    it('should return 401 when unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- GET /majors ---
  describe('GET /majors', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      await request(app.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/majors')
        .send(anotherValidMajorPayload)
        .expect(201);
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should return a list of majors with meta (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/majors?page=1')
        .expect(200);

      expect(body).toHaveProperty('majors');
      expect(Array.isArray(body.majors)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should support search by name', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/majors?search=Computer')
        .expect(200);
      expect(body.majors.some((m: any) => m.name.includes('Computer'))).toBe(
        true,
      );
    });

    it('should return 400 for invalid page param', async () => {
      await request(app.getHttpServer()).get('/majors?page=0').expect(400);
    });

    it('should return 403 for student', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer()).get('/majors').expect(403);
      await studentApp.close();
    });

    it('should return 403 for mentor', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer()).get('/majors').expect(403);
      await mentorApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer()).get('/majors').expect(401);
      await unauthApp.close();
    });
  });

  // --- GET /majors/:id ---
  describe('GET /majors/:id', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
      const { body } = await request(app.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      createdMajorId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should return a major by ID (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/majors/${createdMajorId}`)
        .expect(200);
      expect(body.id).toBe(createdMajorId);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .get('/majors/11111111-1111-1111-1111-111111111111')
        .expect(404);
    });

    it('should return 403 for student', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .get(`/majors/${createdMajorId}`)
        .expect(403);
      await studentApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .get(`/majors/${createdMajorId}`)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- PATCH /majors/:id ---
  describe('PATCH /majors/:id', () => {
    const updatePayload = { name: 'Updated Major' };

    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
      const { body } = await request(app.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      createdMajorId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should allow admin to update (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send(updatePayload)
        .expect(200);
      expect(body.name).toBe(updatePayload.name);
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send({ year: -1 })
        .expect(400);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .patch('/majors/11111111-1111-1111-1111-111111111111')
        .send(updatePayload)
        .expect(404);
    });

    it('should return 403 for student', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send(updatePayload)
        .expect(403);
      await studentApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .patch(`/majors/${createdMajorId}`)
        .send(updatePayload)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- DELETE /majors/:id ---
  describe('DELETE /majors/:id', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
      const { body } = await request(app.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);
      createdMajorId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should soft delete then permanently delete', async () => {
      const soft = await request(app.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(200);
      expect(soft.body.message).toBe('Major marked for deletion');

      const hard = await request(app.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(200);
      expect(hard.body.message).toBe('Major permanently deleted');
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .delete('/majors/11111111-1111-1111-1111-111111111111')
        .expect(404);
    });

    it('should return 403 for mentor', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(403);
      await mentorApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .delete(`/majors/${createdMajorId}`)
        .expect(401);
      await unauthApp.close();
    });
  });
});
