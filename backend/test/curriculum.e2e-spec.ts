import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestAppService } from './utils/test-app.service';
import { mockUsers } from './utils/mock-users';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';

describe('CurriculumsController (Integration)', () => {
  const testService = new TestAppService();
  let app: INestApplication;
  let prisma: ExtendedPrismaClient;
  let createdCurriculumId: string;

  const validCurriculumPayload = {
    year: 2025,
    effectiveSemester: '1st Semester',
    description: 'CS Curriculum for 2025',
  };

  const anotherValidCurriculumPayload = {
    year: 2026,
    effectiveSemester: '2nd Semester',
    description: 'CS Curriculum for 2026',
  };

  beforeAll(async () => {
    const { prisma: p } = await testService.start();
    prisma = p;
  }, 800000);

  afterAll(async () => {
    await testService.close();
  });

  // --- POST /curriculums ---
  describe('POST /curriculums', () => {
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

    it('should allow admin to create a curriculum (201)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.year).toBe(validCurriculumPayload.year);
      createdCurriculumId = body.id;
    });

    it('should return 409 when creating duplicate year+semester (409)', async () => {
      await request(app.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(409);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/curriculums')
        .send({ year: 2025 }) // missing effectiveSemester and description
        .expect(400);
    });

    it('should return 403 when student tries to create', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(403);
      await studentApp.close();
    });

    it('should return 403 when mentor tries to create', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(403);
      await mentorApp.close();
    });

    it('should return 401 when unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- GET /curriculums ---
  describe('GET /curriculums', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      await request(app.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/curriculums')
        .send(anotherValidCurriculumPayload)
        .expect(201);
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should return a paginated list with meta (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/curriculums?page=1')
        .expect(200);

      expect(body).toHaveProperty('curriculums');
      expect(Array.isArray(body.curriculums)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should support search by description', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/curriculums?search=2025')
        .expect(200);
      expect(
        body.curriculums.some((c: any) => c.description.includes('2025')),
      ).toBe(true);
    });

    it('should return 400 when page < 1', async () => {
      await request(app.getHttpServer()).get('/curriculums?page=0').expect(400);
    });

    it('should return 403 for student', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer()).get('/curriculums').expect(403);
      await studentApp.close();
    });

    it('should return 403 for mentor', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer()).get('/curriculums').expect(403);
      await mentorApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer()).get('/curriculums').expect(401);
      await unauthApp.close();
    });
  });

  // --- GET /curriculums/:id ---
  describe('GET /curriculums/:id', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
      const { body } = await request(app.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);
      createdCurriculumId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should return a curriculum by ID (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/curriculums/${createdCurriculumId}`)
        .expect(200);
      expect(body.id).toBe(createdCurriculumId);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .get('/curriculums/11111111-1111-1111-1111-111111111111')
        .expect(404);
    });

    it('should return 403 for student', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .get(`/curriculums/${createdCurriculumId}`)
        .expect(403);
      await studentApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .get(`/curriculums/${createdCurriculumId}`)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- PATCH /curriculums/:id ---
  describe('PATCH /curriculums/:id', () => {
    const updatePayload = { description: 'Updated CS Curriculum' };

    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
      const { body } = await request(app.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);
      createdCurriculumId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should allow admin to update (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .patch(`/curriculums/${createdCurriculumId}`)
        .send(updatePayload)
        .expect(200);
      expect(body.description).toBe(updatePayload.description);
    });

    it('should return 400 for invalid update data', async () => {
      await request(app.getHttpServer())
        .patch(`/curriculums/${createdCurriculumId}`)
        .send({ year: -2020 })
        .expect(400);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .patch('/curriculums/11111111-1111-1111-1111-111111111111')
        .send(updatePayload)
        .expect(404);
    });

    it('should return 403 for mentor', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer())
        .patch(`/curriculums/${createdCurriculumId}`)
        .send(updatePayload)
        .expect(403);
      await mentorApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .patch(`/curriculums/${createdCurriculumId}`)
        .send(updatePayload)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- DELETE /curriculums/:id ---
  describe('DELETE /curriculums/:id', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
      const { body } = await request(app.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);
      createdCurriculumId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should soft delete then permanently delete', async () => {
      const soft = await request(app.getHttpServer())
        .delete(`/curriculums/${createdCurriculumId}`)
        .expect(200);
      expect(soft.body.message).toBe('Curriculum marked for deletion');

      const hard = await request(app.getHttpServer())
        .delete(`/curriculums/${createdCurriculumId}`)
        .expect(200);
      expect(hard.body.message).toBe('Curriculum permanently deleted');
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .delete('/curriculums/11111111-1111-1111-1111-111111111111')
        .expect(404);
    });

    it('should return 403 for student', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .delete(`/curriculums/${createdCurriculumId}`)
        .expect(403);
      await studentApp.close();
    });

    it('should return 401 for unauthenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .delete(`/curriculums/${createdCurriculumId}`)
        .expect(401);
      await unauthApp.close();
    });
  });
});
