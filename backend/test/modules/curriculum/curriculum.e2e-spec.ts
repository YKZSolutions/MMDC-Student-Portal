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
import { generateUniqueMajor } from '../../factories/major.factory';
import { createProgram } from '../../factories/program.factory';
import { createMultipleCourses } from '../../factories/course.factory';
import { CreateCurriculumCourseItemDto } from '@/modules/curriculum/dto/create-curriculum.dto';

/* eslint-disable @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
*/
describe('CurriculumController (Integration)', () => {
  let context: TestContext;
  let majorId: string;
  let courses: CreateCurriculumCourseItemDto[];

  // Test data using factory functions with a proper API structure
  const validCurriculumPayload = createCurriculum();
  const updatePayload = createCurriculumUpdate();

  beforeAll(async () => {
    context = await setupTestEnvironment();
    const program = await context.prismaClient.program.create({
      data: createProgram(),
    });

    const major = await context.prismaClient.major.create({
      data: {
        ...generateUniqueMajor(),
        programId: program.id,
      },
    });

    majorId = major.id;

    const newCourses = await context.prismaClient.course.createManyAndReturn({
      data: createMultipleCourses(3),
    });

    courses = newCourses.map((course, order) => {
      return {
        courseId: course.id,
        semester: 1,
        year: 2025,
        order,
      };
    });

    validCurriculumPayload.majorId = majorId;
    validCurriculumPayload.courses = courses;
    updatePayload.majorId = majorId;
    updatePayload.courses = courses.map((course, order) => {
      return {
        courseId: course.courseId,
        semester: course.semester + order,
        year: course.year + order,
        order: order % 2 === 0 ? order++ : order--,
      };
    });
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // --- All tests use a shared database state (no more describe blocks or resets) ---

  // POST /curriculum tests
  it('should allow admin to create a curriculum (201)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(201);

    expect(body).toHaveProperty('id');
    expect(body.name).toBe(validCurriculumPayload.curriculum.name);
    expect(body.description).toBe(
      validCurriculumPayload.curriculum.description,
    );
    expect(body).toHaveProperty('createdAt');
    expect(body).toHaveProperty('updatedAt');
  });

  it('should return 400 for missing required fields', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/curriculum')
      .send(createInvalidCurriculum.missingMajorId())
      .expect(400);
  });

  it('should return 403 when student tries to create', async () => {
    await request(context.studentApp.getHttpServer())
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(403);
  });

  it('should return 403 when mentor tries to create', async () => {
    await request(context.mentorApp.getHttpServer())
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(403);
  });

  it('should return 401 when unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(401);
  });

  // GET /curriculum tests
  it('should return a list (200)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .get('/curriculum')
      .expect(200);

    expect(body[0]).toHaveProperty('id');
    expect(Array.isArray(body)).toBe(true);
  });

  it('should return 403 for student', async () => {
    await request(context.studentApp.getHttpServer())
      .get('/curriculum')
      .expect(403);
  });

  it('should return 403 for mentor', async () => {
    await request(context.mentorApp.getHttpServer())
      .get('/curriculum')
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .get('/curriculum')
      .expect(401);
  });

  // GET /curriculum/:id tests
  it('should return a curriculum by ID (200)', async () => {
    const { body: newCurriculum } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .get(`/curriculum/${newCurriculum.id}`)
      .expect(200);

    expect(body.curriculum.id).toBe(newCurriculum.id);
    expect(body.curriculum.name).toBe(validCurriculumPayload.curriculum.name);
    expect(body.curriculum.description).toBe(
      validCurriculumPayload.curriculum.description,
    );
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .get(`/curriculum/${v4()}`)
      .expect(404);
  });

  it('should return 403 for student', async () => {
    await request(context.studentApp.getHttpServer())
      .get(`/curriculum/${v4()}`)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .get(`/curriculum/${v4()}`)
      .expect(401);
  });

  // PATCH /curriculum/:id tests
  it('should allow admin to update (200)', async () => {
    const { body: newCurriculum } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .patch(`/curriculum/${newCurriculum.id}`)
      .send(updatePayload)
      .expect(200);
    expect(body.description).toBe(updatePayload.curriculum.description);
    expect(body.name).toBe(updatePayload.curriculum.name);
  });

  it('should return 400 for invalid update data', async () => {
    const { body: newCurriculum } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(201);

    await request(context.adminApp.getHttpServer())
      .patch(`/curriculum/${newCurriculum.id}`)
      .send(createInvalidCurriculum.updateMissingCurriculum())
      .expect(400);
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .patch(`/curriculum/${v4()}`)
      .send(updatePayload)
      .expect(404);
  });

  it('should return 403 for mentor', async () => {
    await request(context.mentorApp.getHttpServer())
      .patch(`/curriculum/${v4()}`)
      .send(updatePayload)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .patch(`/curriculum/${v4()}`)
      .send(updatePayload)
      .expect(401);
  });

  // DELETE /curriculum/:id tests
  it('should soft delete then permanently delete', async () => {
    const { body: newCurriculum } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/curriculum')
      .send(validCurriculumPayload)
      .expect(201);

    const soft = await request(context.adminApp.getHttpServer())
      .delete(`/curriculum/${newCurriculum.id}`)
      .expect(200);
    expect(soft.body.message).toBe('Curriculum marked for deletion');

    const hard = await request(context.adminApp.getHttpServer())
      .delete(`/curriculum/${newCurriculum.id}`)
      .expect(200);
    expect(hard.body.message).toBe('Curriculum permanently deleted');
  });

  it('should return 404 for non-existent ID', async () => {
    await request(context.adminApp.getHttpServer())
      .delete(`/curriculum/${v4()}`)
      .expect(404);
  });

  it('should return 403 for student', async () => {
    await request(context.studentApp.getHttpServer())
      .delete(`/curriculum/${v4()}`)
      .expect(403);
  });

  it('should return 401 for unauthenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .delete(`/curriculum/${v4()}`)
      .expect(401);
  });
});
