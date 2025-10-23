import request from 'supertest';
import { v4 } from 'uuid';
import {
  createMajor,
  createMajorUpdate,
  createInvalidMajor,
} from '../../factories/major.factory';
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
describe('MajorsController (Integration)', () => {
  let context: TestContext;

  // Test data using factory functions with a proper API structure
  const validMajorPayload = createMajor({
    programId: v4(),
    majorCode: 'CS',
    name: 'Computer Science',
    description: 'Bachelor of Science in Computer Science',
  });
  const updatePayload = createMajorUpdate();

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // --- All tests use a shared database state (no more describe blocks or resets) ---

  // POST /majors tests
  it('should allow admin to create a major (201)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
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
  });

  it('should return 409 when creating duplicate code (409)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);
    await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(409);
  });

  it('should return 400 for missing required fields', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(createInvalidMajor.missingMajor())
      .expect(400);
  });

  it('should return 403 when student tries to create', async () => {
    await request(context.studentApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(403);
  });

  it('should return 403 when mentor tries to create', async () => {
    await request(context.mentorApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(403);
  });

  it('should return 401 when unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(401);
  });

  // GET /majors tests
  it('should return a list of majors with meta (200)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .get('/majors?page=1')
      .expect(200);

    expect(body).toHaveProperty('majors');
    expect(Array.isArray(body.majors)).toBe(true);
    expect(body).toHaveProperty('meta');
  });

  it('should support search by name', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .get('/majors?search=Computer')
      .expect(200);
    expect(
      body.majors.some((m: any) => m.major.name.includes('Computer')),
    ).toBe(true);
  });

  it('should return 400 for invalid page param', async () => {
    await request(context.adminApp.getHttpServer())
      .get('/majors?page=0')
      .expect(400);
  });

  it('should return 403 for student', async () => {
    await request(context.studentApp.getHttpServer())
      .get('/majors')
      .expect(403);
  });

  it('should return 403 for mentor', async () => {
    await request(context.mentorApp.getHttpServer()).get('/majors').expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer()).get('/majors').expect(401);
  });

  // GET /majors/:id tests
  it('should return a major by ID (200)', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .get(`/majors/${created.id}`)
      .expect(200);
    expect(body.id).toBe(created.id);
    expect(body.major.majorCode).toBe(validMajorPayload.major.majorCode);
    expect(body.major.name).toBe(validMajorPayload.major.name);
    expect(body.major.description).toBe(validMajorPayload.major.description);
    expect(body.programId).toBe(validMajorPayload.programId);
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .get(`/majors/${v4()}`)
      .expect(404);
  });

  it('should return 403 for student', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    await request(context.studentApp.getHttpServer())
      .get(`/majors/${created.id}`)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .get(`/majors/${created.id}`)
      .expect(401);
  });

  // PATCH /majors/:id tests
  it('should allow admin to update (200)', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .patch(`/majors/${created.id}`)
      .send(updatePayload)
      .expect(200);
    expect(body.major.majorCode).toBe(updatePayload.majorCode);
    expect(body.major.name).toBe(updatePayload.name);
    expect(body.major.description).toBe(updatePayload.description);
  });

  it('should return 400 for invalid update data', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    await request(context.adminApp.getHttpServer())
      .patch(`/majors/${created.id}`)
      .send(createInvalidMajor.updateMissingCode())
      .expect(400);
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .patch(`/majors/${v4()}`)
      .send(updatePayload)
      .expect(404);
  });

  it('should return 403 for student', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    await request(context.studentApp.getHttpServer())
      .patch(`/majors/${created.id}`)
      .send(updatePayload)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .patch(`/majors/${created.id}`)
      .send(updatePayload)
      .expect(401);
  });

  // DELETE /majors/:id tests
  it('should soft delete then permanently delete', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    const soft = await request(context.adminApp.getHttpServer())
      .delete(`/majors/${created.id}`)
      .expect(200);
    expect(soft.body.message).toBe('Major marked for deletion');

    const hard = await request(context.adminApp.getHttpServer())
      .delete(`/majors/${created.id}`)
      .expect(200);
    expect(hard.body.message).toBe('Major permanently deleted');
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .delete(`/majors/${v4()}`)
      .expect(404);
  });

  it('should return 403 for student', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    await request(context.studentApp.getHttpServer())
      .delete(`/majors/${created.id}`)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    const { body: created } = await request(context.adminApp.getHttpServer())
      .post('/majors')
      .send(validMajorPayload)
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .delete(`/majors/${created.id}`)
      .expect(401);
  });
});
