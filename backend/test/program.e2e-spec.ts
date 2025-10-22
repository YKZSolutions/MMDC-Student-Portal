import request from 'supertest';
import { TestAppService } from './utils/test-app.service';
import { INestApplication } from '@nestjs/common';
import { v4 } from 'uuid';
import {
  createProgram,
  createProgramUpdate,
  createInvalidProgram,
} from './factories/program.factory';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('ProgramController (Integration)', () => {
  let testService: TestAppService;

  // Cache for frequently used app instances
  let adminApp: INestApplication;
  let studentApp: INestApplication;
  let mentorApp: INestApplication;
  let unauthApp: INestApplication;

  let createdProgramId: string;

  // Test data using factory functions with a proper API structure
  const validProgramPayload = createProgram({
    programCode: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    description:
      'A comprehensive program covering the fundamentals of computing.',
    yearDuration: 4,
  });
  const anotherValidProgramPayload = createProgram({
    programCode: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    description: 'A program focused on practical IT applications.',
    yearDuration: 4,
  });
  const updatePayload = createProgramUpdate();

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

  // --- POST /program ---
  describe('POST /program', () => {
    it('should allow an admin to create a new program with valid data (201)', async () => {
      await testService.resetDatabase();

      const res = await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.programCode).toBe(validProgramPayload.programCode);
      expect(res.body.name).toBe(validProgramPayload.name);
      expect(res.body.description).toBe(validProgramPayload.description);
      expect(res.body.yearDuration).toBe(validProgramPayload.yearDuration);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');

      createdProgramId = res.body.id;
    });

    it('should reject creating a duplicate program code (400 or 409)', async () => {
      await testService.resetDatabase();

      await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);

      const res = await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload);

      expect([400, 409]).toContain(res.status);
    });

    it('should return 400 (Bad Request) if required fields are missing', async () => {
      await request(adminApp.getHttpServer())
        .post('/program')
        .send(createInvalidProgram.missingFields())
        .expect(400);
    });

    it('should return 400 (Bad Request) when programCode is empty', async () => {
      await request(adminApp.getHttpServer())
        .post('/program')
        .send(createInvalidProgram.emptyFields())
        .expect(400);
    });

    it('should return 400 (Bad Request) when yearDuration is invalid', async () => {
      await request(adminApp.getHttpServer())
        .post('/program')
        .send(createInvalidProgram.invalidYearDuration())
        .expect(400);
    });

    it('should return 403 (Forbidden) if a student tries to create a program', async () => {
      await request(studentApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a program', async () => {
      await request(mentorApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(unauthApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(401);
    });
  });

  // --- GET /program ---
  describe('GET /program', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create test data once for all GET tests
      await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/program')
        .send(anotherValidProgramPayload)
        .expect(201);
    });

    it('should allow an admin to retrieve a paginated list of all programs (200)', async () => {
      const res = await request(adminApp.getHttpServer())
        .get('/program')
        .expect(200);

      expect(res.body).toHaveProperty('meta');
      expect(res.body).toHaveProperty('programs');
      expect(Array.isArray(res.body.programs)).toBe(true);
      expect(res.body.programs.length).toBeGreaterThan(0);
    });

    it('should correctly filter programs by the search query parameter', async () => {
      const res = await request(adminApp.getHttpServer())
        .get('/program?search=Computer')
        .expect(200);

      expect(
        res.body.programs.some((program) => program.name.includes('Computer')),
      ).toBe(true);
    });

    it('should support pagination with page query parameter', async () => {
      const res = await request(adminApp.getHttpServer())
        .get('/program?page=1')
        .expect(200);

      expect(res.body.meta.currentPage).toBe(1);
    });

    it('should return 403 (Forbidden) if a student tries to get the program list', async () => {
      await request(studentApp.getHttpServer()).get('/program').expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to get the program list', async () => {
      await request(mentorApp.getHttpServer()).get('/program').expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer()).get('/program').expect(401);
    });
  });

  // --- GET /program/{id} ---
  describe('GET /program/{id}', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test program for individual GET tests
      const res = await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      createdProgramId = res.body.id;
    });

    it('should allow an admin to retrieve a single program by its ID (200)', async () => {
      const res = await request(adminApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(200);

      expect(res.body.id).toBe(createdProgramId);
      expect(res.body.programCode).toBe(validProgramPayload.programCode);
      expect(res.body.name).toBe(validProgramPayload.name);
      expect(res.body.description).toBe(validProgramPayload.description);
      expect(res.body.yearDuration).toBe(validProgramPayload.yearDuration);
    });

    it('should return 404 (Not Found) for a non-existent program ID', async () => {
      await request(adminApp.getHttpServer())
        .get(`/program/${v4()}`)
        .expect(404);
    });

    it('should return 400 (Bad Request) for invalid ID format', async () => {
      await request(adminApp.getHttpServer())
        .get('/program/invalid-id')
        .expect(400);
    });

    it('should return 403 (Forbidden) when student tries to get a program by ID', async () => {
      await request(studentApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to get a program by ID', async () => {
      await request(mentorApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(401);
    });
  });

  // --- PATCH /program/{id} ---
  describe('PATCH /program/{id}', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test program for PATCH tests
      const res = await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      createdProgramId = res.body.id;
    });

    it('should allow an admin to update an existing program (200)', async () => {
      const res = await request(adminApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(200);

      expect(res.body.programCode).toBe(updatePayload.programCode);
      expect(res.body.name).toBe(updatePayload.name);
      expect(res.body.description).toBe(updatePayload.description);
      expect(res.body.yearDuration).toBe(updatePayload.yearDuration);
    });

    it('should return 404 (Not Found) when trying to update a non-existent program', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/program/${v4()}`)
        .send(updatePayload)
        .expect(404);
    });

    it('should return 400 (Bad Request) with invalid update data', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(createInvalidProgram.updateEmptyFields())
        .expect(400);
    });

    it('should return 403 (Forbidden) when student tries to update program', async () => {
      await request(studentApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to update program', async () => {
      await request(mentorApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .patch(`/program/${createdProgramId}`)
        .send(updatePayload)
        .expect(401);
    });
  });

  // --- DELETE /program/{id} ---
  describe('DELETE /program/{id}', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test program for DELETE tests
      const res = await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);
      createdProgramId = res.body.id;
    });

    it('should allow an admin to delete a program (200) and then return 404 on fetch', async () => {
      const delRes = await request(adminApp.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(200);

      expect(delRes.body).toHaveProperty('message');
      expect(typeof delRes.body.message).toBe('string');

      // Verify deletion by attempting to fetch
      await request(adminApp.getHttpServer())
        .get(`/program/${createdProgramId}`)
        .expect(404);
    });

    it('should return 404 (Not Found) when trying to delete a non-existent program', async () => {
      await request(adminApp.getHttpServer())
        .delete(`/program/${v4()}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete program', async () => {
      await request(studentApp.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to delete program', async () => {
      await request(mentorApp.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .delete(`/program/${createdProgramId}`)
        .expect(401);
    });
  });

  // --- Edge cases and error handling ---
  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent program creation with same code (one 201, one 400/409)', async () => {
      await testService.resetDatabase();

      const promises = [
        request(adminApp.getHttpServer())
          .post('/program')
          .send(validProgramPayload),
        request(adminApp.getHttpServer())
          .post('/program')
          .send(validProgramPayload),
      ];

      const results = await Promise.allSettled(promises);
      const statuses = results.map((r) =>
        r.status === 'fulfilled' ? r.value.status : 500,
      );

      expect(statuses).toContain(201);
      expect(statuses.some((s) => s === 400 || s === 409)).toBe(true);
    });

    it('should validate program code uniqueness case-insensitively (400 or 409)', async () => {
      await testService.resetDatabase();

      await request(adminApp.getHttpServer())
        .post('/program')
        .send(validProgramPayload)
        .expect(201);

      const duplicatePayload = createProgram({
        programCode: validProgramPayload.programCode.toLowerCase(),
        name: 'Duplicate Program',
        description: 'Test duplicate program code',
        yearDuration: 4,
      });

      const res = await request(adminApp.getHttpServer())
        .post('/program')
        .send(duplicatePayload);

      expect([400, 409]).toContain(res.status);
    });

    it('should handle malformed JSON in request body (400)', async () => {
      await request(adminApp.getHttpServer())
        .post('/program')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should return 400 for invalid yearDuration (zero)', async () => {
      await request(adminApp.getHttpServer())
        .post('/program')
        .send(createInvalidProgram.invalidYearDurationZero())
        .expect(400);
    });

    it('should return 400 for invalid yearDuration (negative)', async () => {
      await request(adminApp.getHttpServer())
        .post('/program')
        .send(createInvalidProgram.invalidYearDuration())
        .expect(400);
    });
  });
});
