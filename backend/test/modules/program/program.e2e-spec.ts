import request from 'supertest';
import { v4 } from 'uuid';
import {
  createProgram,
  createInvalidProgram,
  testPrograms,
} from '../../factories/program.factory';
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
describe('ProgramController (Integration)', () => {
  let context: TestContext;
  let createdProgramId: string;

  // Test data using factory functions with a proper API structure
  const validProgramPayload = testPrograms.default;

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // POST /programs tests
  describe('POST /programs', () => {
    it('should allow an admin to create a new program with valid data (201)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.programCode).toBe(validProgramPayload.programCode);
      expect(body.name).toBe(validProgramPayload.name);
      expect(body.description).toBe(validProgramPayload.description);
      expect(body.yearDuration).toBe(validProgramPayload.yearDuration);
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');

      createdProgramId = body.id;
    });

    it('should reject creating a duplicate program code (400 or 409)', async () => {
      const res = await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload);

      expect([400, 409]).toContain(res.status);
    });

    it('should return 400 (Bad Request) if required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(createInvalidProgram.missingFields())
        .expect(400);
    });

    it('should return 400 (Bad Request) when programCode is empty', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(createInvalidProgram.emptyFields())
        .expect(400);
    });

    it('should return 400 (Bad Request) when yearDuration is invalid', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(createInvalidProgram.invalidYearDuration())
        .expect(400);
    });

    it('should return 403 (Forbidden) if a student tries to create a program', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a program', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload)
        .expect(401);
    });
  });

  // GET /programs tests
  describe('GET /programs', () => {
    it('should allow an admin to retrieve a paginated list of all programs (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/programs')
        .expect(200);

      expect(body).toHaveProperty('meta');
      expect(body).toHaveProperty('programs');
      expect(Array.isArray(body.programs)).toBe(true);
      expect(body.programs.length).toBeGreaterThan(0);
    });

    it('should correctly filter programs by the search query parameter', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(testPrograms.bs)
        .expect(201);

      const { body } = await request(context.adminApp.getHttpServer())
        .get('/programs?search=Science')
        .expect(200);

      expect(
        body.programs.some((program) => program.name.includes('Science')),
      ).toBe(true);
    });

    it('should support pagination with page query parameter', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/programs?page=1')
        .expect(200);

      expect(body.meta.currentPage).toBe(1);
    });

    it('should return 403 (Forbidden) if a student tries to get the program list', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/programs')
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to get the program list', async () => {
      await request(context.mentorApp.getHttpServer())
        .get('/programs')
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/programs')
        .expect(401);
    });
  });

  // GET /programs/{id} tests
  describe('GET /programs/{id}', () => {
    it('should allow an admin to retrieve a single program by its ID (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/programs/${createdProgramId}`)
        .expect(200);

      expect(body).toHaveProperty('id');
      expect(body.programCode).toBe(validProgramPayload.programCode);
      expect(body.name).toBe(validProgramPayload.name);
      expect(body.description).toBe(validProgramPayload.description);
      expect(body.yearDuration).toBe(validProgramPayload.yearDuration);
    });

    it('should return 404 (Not Found) for a non-existent program ID', async () => {
      await request(context.adminApp.getHttpServer())
        .get(`/programs/${v4()}`)
        .expect(404);
    });

    it('should return 400 (Bad Request) for invalid ID format', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/programs/invalid-id')
        .expect(400);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/programs/${createdProgramId}`)
        .expect(401);
    });
  });

  // PATCH /programs/{id} tests
  describe('PATCH /programs/{id}', () => {
    it('should allow an admin to update an existing program (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .send(testPrograms.ba)
        .expect(200);

      expect(body.programCode).toBe(testPrograms.ba.programCode);
      expect(body.name).toBe(testPrograms.ba.name);
      expect(body.description).toBe(testPrograms.ba.description);
      expect(body.yearDuration).toBe(testPrograms.ba.yearDuration);
    });

    it('should return 404 (Not Found) when trying to update a non-existent program', async () => {
      await request(context.adminApp.getHttpServer())
        .patch(`/programs/${v4()}`)
        .send(testPrograms.update.basic)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to update program', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .send(testPrograms.update.basic)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to update program', async () => {
      await request(context.mentorApp.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .send(testPrograms.update.basic)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/programs/${createdProgramId}`)
        .send(testPrograms.update.basic)
        .expect(401);
    });
  });

  // DELETE /programs/{id} tests
  describe('DELETE /programs/{id}', () => {
    it('should allow an admin to delete a program (200) and then return 404 on fetch', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload)
        .expect(201);

      const { body: delBody } = await request(context.adminApp.getHttpServer())
        .delete(`/programs/${body.id}`)
        .expect(200);

      expect(delBody).toHaveProperty('message');
      expect(typeof delBody.message).toBe('string');

      // Verify deletion by attempting to fetch
      await request(context.adminApp.getHttpServer())
        .get(`/programs/${body.id}`)
        .expect(404);
    });

    it('should return 404 (Not Found) when trying to delete a non-existent program', async () => {
      await request(context.adminApp.getHttpServer())
        .delete(`/programs/${v4()}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete program', async () => {
      await request(context.studentApp.getHttpServer())
        .delete(`/programs/${createdProgramId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to delete program', async () => {
      await request(context.mentorApp.getHttpServer())
        .delete(`/programs/${createdProgramId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .delete(`/programs/${createdProgramId}`)
        .expect(401);
    });
  });

  // Edge cases and error handling
  describe('Edge Cases', () => {
    it('should validate program code uniqueness case-insensitively (409)', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload)
        .expect(201);

      const duplicatePayload = createProgram({
        programCode: validProgramPayload.programCode.toLowerCase(),
        name: 'Duplicate Program',
        description: 'Test duplicate program code',
        yearDuration: 4,
      });

      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(duplicatePayload)
        .expect(409);
    });

    it('should handle malformed JSON in request body (400)', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should return 400 for invalid yearDuration (negative)', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(createInvalidProgram.invalidYearDuration())
        .expect(400);
    });
  });
});
