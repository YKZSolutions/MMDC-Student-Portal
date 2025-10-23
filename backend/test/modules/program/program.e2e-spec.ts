import request from 'supertest';
import { v4 } from 'uuid';
import {
  createProgram,
  createProgramUpdate,
  createInvalidProgram,
} from '../../factories/program.factory';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TestContext,
} from '../../test-setup';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-return,
*/
describe('ProgramController (Integration)', () => {
  let context: TestContext;

  // Test data using factory functions with a proper API structure
  const validProgramPayload = createProgram({
    programCode: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    description:
      'A comprehensive program covering the fundamentals of computing.',
    yearDuration: 4,
  });
  const updatePayload = createProgramUpdate();

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // --- All tests use a shared database state (no more describe blocks or resets) ---

  // POST /programs tests
  it('should allow an admin to create a new program with valid data (201)', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(validProgramPayload)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.programCode).toBe(validProgramPayload.programCode);
    expect(res.body.name).toBe(validProgramPayload.name);
    expect(res.body.description).toBe(validProgramPayload.description);
    expect(res.body.yearDuration).toBe(validProgramPayload.yearDuration);
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('should reject creating a duplicate program code (400 or 409)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(validProgramPayload)
      .expect(201);

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

  // GET /programs tests
  it('should allow an admin to retrieve a paginated list of all programs (200)', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .get('/programs')
      .expect(200);

    expect(res.body).toHaveProperty('meta');
    expect(res.body).toHaveProperty('programs');
    expect(Array.isArray(res.body.programs)).toBe(true);
    expect(res.body.programs.length).toBeGreaterThan(0);
  });

  it('should correctly filter programs by the search query parameter', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .get('/programs?search=Computer')
      .expect(200);

    expect(
      res.body.programs.some((program) => program.name.includes('Computer')),
    ).toBe(true);
  });

  it('should support pagination with page query parameter', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .get('/programs?page=1')
      .expect(200);

    expect(res.body.meta.currentPage).toBe(1);
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

  // GET /programs/{id} tests
  it('should allow an admin to retrieve a single program by its ID (200)', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .get('/programs/1') // Using shared program from setup
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body.programCode).toBe(validProgramPayload.programCode);
    expect(res.body.name).toBe(validProgramPayload.name);
    expect(res.body.description).toBe(validProgramPayload.description);
    expect(res.body.yearDuration).toBe(validProgramPayload.yearDuration);
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

  it('should return 403 (Forbidden) when student tries to get a program by ID', async () => {
    await request(context.studentApp.getHttpServer())
      .get('/programs/1')
      .expect(403);
  });

  it('should return 403 (Forbidden) when mentor tries to get a program by ID', async () => {
    await request(context.mentorApp.getHttpServer())
      .get('/programs/1')
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .get('/programs/1')
      .expect(401);
  });

  // PATCH /programs/{id} tests
  it('should allow an admin to update an existing program (200)', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .patch('/programs/1')
      .send(updatePayload)
      .expect(200);

    expect(res.body.programCode).toBe(updatePayload.programCode);
    expect(res.body.name).toBe(updatePayload.name);
    expect(res.body.description).toBe(updatePayload.description);
    expect(res.body.yearDuration).toBe(updatePayload.yearDuration);
  });

  it('should return 404 (Not Found) when trying to update a non-existent program', async () => {
    await request(context.adminApp.getHttpServer())
      .patch(`/programs/${v4()}`)
      .send(updatePayload)
      .expect(404);
  });

  it('should return 400 (Bad Request) with invalid update data', async () => {
    await request(context.adminApp.getHttpServer())
      .patch('/programs/1')
      .send(createInvalidProgram.updateEmptyFields())
      .expect(400);
  });

  it('should return 403 (Forbidden) when student tries to update program', async () => {
    await request(context.studentApp.getHttpServer())
      .patch('/programs/1')
      .send(updatePayload)
      .expect(403);
  });

  it('should return 403 (Forbidden) when mentor tries to update program', async () => {
    await request(context.mentorApp.getHttpServer())
      .patch('/programs/1')
      .send(updatePayload)
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .patch('/programs/1')
      .send(updatePayload)
      .expect(401);
  });

  // DELETE /programs/{id} tests
  it('should allow an admin to delete a program (200) and then return 404 on fetch', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(validProgramPayload)
      .expect(201);

    const delRes = await request(context.adminApp.getHttpServer())
      .delete(`/programs/${res.body.id}`)
      .expect(200);

    expect(delRes.body).toHaveProperty('message');
    expect(typeof delRes.body.message).toBe('string');

    // Verify deletion by attempting to fetch
    await request(context.adminApp.getHttpServer())
      .get(`/programs/${res.body.id}`)
      .expect(404);
  });

  it('should return 404 (Not Found) when trying to delete a non-existent program', async () => {
    await request(context.adminApp.getHttpServer())
      .delete(`/programs/${v4()}`)
      .expect(404);
  });

  it('should return 403 (Forbidden) when student tries to delete program', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(validProgramPayload)
      .expect(201);

    await request(context.studentApp.getHttpServer())
      .delete(`/programs/${res.body.id}`)
      .expect(403);
  });

  it('should return 403 (Forbidden) when mentor tries to delete program', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(validProgramPayload)
      .expect(201);

    await request(context.mentorApp.getHttpServer())
      .delete(`/programs/${res.body.id}`)
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    const res = await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(validProgramPayload)
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .delete(`/programs/${res.body.id}`)
      .expect(401);
  });

  // Edge cases and error handling
  it('should handle concurrent program creation with same code (one 201, one 400/409)', async () => {
    const promises = [
      request(context.adminApp.getHttpServer())
        .post('/programs')
        .send(validProgramPayload),
      request(context.adminApp.getHttpServer())
        .post('/programs')
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

    const res = await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(duplicatePayload);

    expect([400, 409]).toContain(res.status);
  });

  it('should handle malformed JSON in request body (400)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/programs')
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}')
      .expect(400);
  });

  it('should return 400 for invalid yearDuration (zero)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(createInvalidProgram.invalidYearDurationZero())
      .expect(400);
  });

  it('should return 400 for invalid yearDuration (negative)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(createInvalidProgram.invalidYearDuration())
      .expect(400);
  });
});
