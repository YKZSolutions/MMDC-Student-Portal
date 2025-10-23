import request from 'supertest';
import { v4 } from 'uuid';
import {
  createCurriculum,
  createCurriculumUpdate,
  createInvalidCurriculum,
} from '../../factories/curriculum.factory';
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
describe('CurriculumsController (Integration)', () => {
  let context: TestContext;

  // Test data using factory functions with a proper API structure
  const validCurriculumPayload = createCurriculum({
    majorId: v4(),
    description: 'CS Curriculum for 2025',
  });
  const updatePayload = createCurriculumUpdate();

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // --- All tests use a shared database state (no more describe blocks or resets) ---

  // POST /curriculums tests
  it('should allow admin to create a curriculum (201)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(201);

    expect(body).toHaveProperty('id');
    expect(body.majorId).toBe(validCurriculumPayload.majorId);
    expect(body.curriculum.name).toBe(validCurriculumPayload.curriculum.name);
    expect(body.curriculum.description).toBe(
      validCurriculumPayload.curriculum.description,
    );
    expect(body).toHaveProperty('createdAt');
    expect(body).toHaveProperty('updatedAt');
  });

  it('should return 409 when creating duplicate year+semester (409)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(201);
    await request(context.adminApp.getHttpServer())
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(409);
  });

  it('should return 400 for missing required fields', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/curriculums')
      .send(createInvalidCurriculum.missingMajorId())
      .expect(400);
  });

  it('should return 403 when student tries to create', async () => {
    await request(context.studentApp.getHttpServer())
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(403);
  });

  it('should return 403 when mentor tries to create', async () => {
    await request(context.mentorApp.getHttpServer())
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(403);
  });

  it('should return 401 when unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(401);
  });

  // GET /curriculums tests
  it('should return a paginated list with meta (200)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .get('/curriculums?page=1')
      .expect(200);

    expect(body).toHaveProperty('curriculums');
    expect(Array.isArray(body.curriculums)).toBe(true);
    expect(body).toHaveProperty('meta');
  });

  it('should support search by description', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .get('/curriculums?search=2025')
      .expect(200);
    expect(
      body.curriculums.some((c: any) =>
        c.curriculum.description.includes('2025'),
      ),
    ).toBe(true);
  });

  it('should return 400 when page < 1', async () => {
    await request(context.adminApp.getHttpServer())
      .get('/curriculums?page=0')
      .expect(400);
  });

  it('should return 403 for student', async () => {
    await request(context.studentApp.getHttpServer())
      .get('/curriculums')
      .expect(403);
  });

  it('should return 403 for mentor', async () => {
    await request(context.mentorApp.getHttpServer())
      .get('/curriculums')
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .get('/curriculums')
      .expect(401);
  });

  // GET /curriculums/:id tests
  it('should return a curriculum by ID (200)', async () => {
    const { body: newCurriculum } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .get(`/curriculums/${newCurriculum.id}`)
      .expect(200);
    expect(body.id).toBe(newCurriculum.id);
    expect(body.majorId).toBe(validCurriculumPayload.majorId);
    expect(body.curriculum.name).toBe(validCurriculumPayload.curriculum.name);
    expect(body.curriculum.description).toBe(
      validCurriculumPayload.curriculum.description,
    );
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .get(`/curriculums/${v4()}`)
      .expect(404);
  });

  it('should return 403 for student', async () => {
    await request(context.studentApp.getHttpServer())
      .get(`/curriculums/${v4()}`)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .get(`/curriculums/${v4()}`)
      .expect(401);
  });

  // PATCH /curriculums/:id tests
  it('should allow admin to update (200)', async () => {
    const { body: newCurriculum } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .patch(`/curriculums/${newCurriculum.id}`)
      .send(updatePayload)
      .expect(200);
    expect(body.curriculum.description).toBe(
      updatePayload.curriculum.description,
    );
    expect(body.curriculum.name).toBe(updatePayload.curriculum.name);
  });

  it('should return 400 for invalid update data', async () => {
    await request(context.adminApp.getHttpServer())
      .patch(`/curriculums/${v4()}`)
      .send(createInvalidCurriculum.updateMissingCurriculum())
      .expect(400);
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .patch(`/curriculums/${v4()}`)
      .send(updatePayload)
      .expect(404);
  });

  it('should return 403 for mentor', async () => {
    await request(context.mentorApp.getHttpServer())
      .patch(`/curriculums/${v4()}`)
      .send(updatePayload)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .patch(`/curriculums/${v4()}`)
      .send(updatePayload)
      .expect(401);
  });

  // DELETE /curriculums/:id tests
  it('should soft delete then permanently delete', async () => {
    const { body: newCurriculum } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/curriculums')
      .send(validCurriculumPayload)
      .expect(201);

    const soft = await request(context.adminApp.getHttpServer())
      .delete(`/curriculums/${newCurriculum.id}`)
      .expect(200);
    expect(soft.body.message).toBe('Curriculum marked for deletion');

    const hard = await request(context.adminApp.getHttpServer())
      .delete(`/curriculums/${newCurriculum.id}`)
      .expect(200);
    expect(hard.body.message).toBe('Curriculum permanently deleted');
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .delete(`/curriculums/${v4()}`)
      .expect(404);
  });

  it('should return 403 for student', async () => {
    await request(context.studentApp.getHttpServer())
      .delete(`/curriculums/${v4()}`)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .delete(`/curriculums/${v4()}`)
      .expect(401);
  });
});
