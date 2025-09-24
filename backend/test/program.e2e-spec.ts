import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestAppService } from './utils/test-app.service';
import { mockUsers } from './utils/mock-users';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';

describe('ProgramController (Integration)', () => {
  const testService = new TestAppService();
  let app: INestApplication;
  let prisma: ExtendedPrismaClient;
  let createdProgramId: string;

  const validProgramPayload = {
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    description:
      'A comprehensive program covering the fundamentals of computing.',
  };

  const anotherValidProgramPayload = {
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    description: 'A program focused on practical IT applications.',
  };

  beforeAll(async () => {
    const { prisma: p } = await testService.start();
    prisma = p;
  }, 800000);

  afterAll(async () => {
    await testService.close();
  });

  // --- POST /program ---
  describe('POST /program', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
    });

    afterEach(async () => {
      await testService.resetDatabase(prisma);
    });

    it('should allow an admin to create a new program with valid data (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.code).toBe(validProgramPayload.code);
      expect(res.body.name).toBe(validProgramPayload.name);
    });

    it('should reject creating a duplicate program code (400 or 409)', async () => {
      await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload);

      expect([400, 409]).toContain(res.status);
    });

    it('should return 400 (Bad Request) if required fields are missing', async () => {
      const invalidPayload = {
        name: 'Incomplete Program',
        // missing code and description
      };

      await request(app.getHttpServer())
        .post('/program')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 400 (Bad Request) when code is empty', async () => {
      const invalidPayload = { ...validProgramPayload, code: '' };

      await request(app.getHttpServer())
        .post('/program')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 403 (Forbidden) if a student tries to create a program', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );

      await request(studentApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(403);

      await studentApp.close();
    });

    it('should return 403 (Forbidden) if a mentor tries to create a program', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );

      await request(mentorApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(403);

      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );

      await request(unauthApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(401);

      await unauthApp.close();
    });
  });

  // --- GET /program ---
  describe('GET /program', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      // Seed via API
      await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/program')
        .send(anotherValidProgramPayload)
        .expect(201);
    });

    afterEach(async () => {
      await testService.resetDatabase(prisma);
    });

    it('should allow an admin to retrieve a paginated list of all programs (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/program')
        .expect(200);

      expect(res.body).toHaveProperty('meta');
      expect(res.body).toHaveProperty('programs');
      expect(Array.isArray(res.body.programs)).toBe(true);
      expect(res.body.programs.length).toBeGreaterThan(0);
    });

    it('should correctly filter programs by the search query parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/program?search=Computer')
        .expect(200);

      expect(
        res.body.programs.some((program) => program.name.includes('Computer')),
      ).toBe(true);
    });

    it('should support pagination with page query parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/program?page=1')
        .expect(200);

      expect(res.body.meta.currentPage).toBe(1);
    });

    it('should return 403 (Forbidden) if a student tries to get the program list', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );

      await request(studentApp.getHttpServer()).get('/program').expect(403);

      await studentApp.close();
    });

    it('should return 403 (Forbidden) if a mentor tries to get the program list', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );

      await request(mentorApp.getHttpServer()).get('/program').expect(403);

      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );

      await request(unauthApp.getHttpServer()).get('/program').expect(401);

      await unauthApp.close();
    });
  });

  // --- GET /program/{id} ---
  describe('GET /program/{id}', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      const res = await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      createdProgramId = res.body.id;
    });

    afterEach(async () => {
      await testService.resetDatabase(prisma);
    });

    it('should allow an admin to retrieve a single program by its ID (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(200);

      expect(res.body.id).toBe(createdProgramId);
      expect(res.body.code).toBe(validProgramPayload.code);
    });

    it('should return 404 (Not Found) for a non-existent program ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11'; // well-formed UUID

      await request(app.getHttpServer())
        .get(`/program/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 (Bad Request) for invalid ID format', async () => {
      await request(app.getHttpServer()).get('/program/invalid-id').expect(400);
    });

    it('should return 403 (Forbidden) when student tries to get a program by ID', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );

      await request(studentApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(403);

      await studentApp.close();
    });

    it('should return 403 (Forbidden) when mentor tries to get a program by ID', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );

      await request(mentorApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(403);

      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );

      await request(unauthApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(401);

      await unauthApp.close();
    });
  });

  // --- PATCH /program/{id} ---
  describe('PATCH /program/{id}', () => {
    const updatePayload = {
      name: 'Updated Program Name',
      description: 'Updated description',
    };

    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      const res = await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      createdProgramId = res.body.id;
    });

    afterEach(async () => {
      await testService.resetDatabase(prisma);
    });

    it('should allow an admin to update an existing program (200)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(200);

      expect(res.body.name).toBe(updatePayload.name);
      expect(res.body.description).toBe(updatePayload.description);
    });

    it('should return 404 (Not Found) when trying to update a non-existent program', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';

      await request(app.getHttpServer())
        .patch(`/program/${nonExistentId}`)
        .send(updatePayload)
        .expect(404);
    });

    it('should return 400 (Bad Request) with invalid update data', async () => {
      const invalidPayload = { code: '' }; // invalid empty code

      await request(app.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 403 (Forbidden) when student tries to update program', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );

      await request(studentApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(403);

      await studentApp.close();
    });

    it('should return 403 (Forbidden) when mentor tries to update program', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );

      await request(mentorApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(403);

      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );

      await request(unauthApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(401);

      await unauthApp.close();
    });
  });

  // --- DELETE /program/{id} ---
  describe('DELETE /program/{id}', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      const res = await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      createdProgramId = res.body.id;
    });

    afterEach(async () => {
      await testService.resetDatabase(prisma);
    });

    it('should allow an admin to delete a program (200) and then return 404 on fetch', async () => {
      const delRes = await request(app.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(200);

      expect(delRes.body).toHaveProperty('message');
      expect(typeof delRes.body.message).toBe('string');

      // Verify deletion by attempting to fetch
      await request(app.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(404);
    });

    it('should return 404 (Not Found) when trying to delete a non-existent program', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';

      await request(app.getHttpServer())
        .delete(`/program/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete program', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );

      await request(studentApp.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(403);

      await studentApp.close();
    });

    it('should return 403 (Forbidden) when mentor tries to delete program', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );

      await request(mentorApp.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(403);

      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );

      await request(unauthApp.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(401);

      await unauthApp.close();
    });
  });

  // --- Edge cases and error handling ---
  describe('Edge Cases and Error Handling', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
    });

    afterEach(async () => {
      await testService.resetDatabase(prisma);
    });

    it('should handle concurrent program creation with same code (one 201, one 400/409)', async () => {
      const promises = [
        request(app.getHttpServer()).post('/program').send(validProgramPayload),
        request(app.getHttpServer()).post('/program').send(validProgramPayload),
      ];

      const results = await Promise.allSettled(promises);
      const statuses = results.map((r) =>
        r.status === 'fulfilled' ? r.value.status : 500,
      );

      expect(statuses).toContain(201);
      expect(statuses.some((s) => s === 400 || s === 409)).toBe(true);
    });

    it('should validate program code uniqueness case-insensitively (400 or 409)', async () => {
      await request(app.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);

      const duplicatePayload = {
        ...validProgramPayload,
        code: validProgramPayload.code.toLowerCase(),
      };

      const res = await request(app.getHttpServer())
        .post('/program')
        .send(duplicatePayload);

      expect([400, 409]).toContain(res.status);
    });

    it('should handle malformed JSON in request body (400)', async () => {
      await request(app.getHttpServer())
        .post('/program')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });
});
