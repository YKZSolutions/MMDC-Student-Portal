import request from 'supertest';
import {
  createCourse,
  createCourseUpdate,
  createInvalidCourse,
} from '../../factories/course.factory';
import {
  cleanupTestEnvironment,
  setupTestEnvironment,
  TestContext,
} from '../../test-setup';
import { v4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('CoursesController (Integration)', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  }, 15000);

  // --- POST /courses ---
  describe('POST /courses', () => {
    it('should allow an admin to create a new course with valid data (201)', async () => {
      const validCoursePayload = createCourse();
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.courseCode).toBe(validCoursePayload.courseCode);
      expect(body.name).toBe(validCoursePayload.name);
      expect(body.units).toBe(validCoursePayload.units);
      expect(body.type).toBe(validCoursePayload.type);
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
    });

    it('should return 409 (Conflict) if a course with the same courseCode already exists', async () => {
      // Create a unique course payload for this test
      const duplicateTestPayload = createCourse({
        courseCode: 'CS_DUPLICATE_TEST',
        name: 'Duplicate Test Course',
      });

      // First, create a course
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(duplicateTestPayload)
        .expect(201);

      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(duplicateTestPayload)
        .expect(409);
    });

    it('should return 403 (Forbidden) if a student tries to create a course', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/courses')
        .send(createCourse())
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a course', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/courses')
        .send(createCourse())
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/courses')
        .send(createCourse())
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.missingFields())
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is negative', async () => {
      const payload = createInvalidCourse.invalidUnits();
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(payload)
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is not an integer', async () => {
      // @IsInt() should catch this
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.invalidUnitsType())
        .expect(400);
    });

    it('should return 400 (Bad Request) when relation IDs are invalid UUIDs', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.invalidRelationIds())
        .expect(400);
    });
  });

  // --- All tests use a shared database state (no more describe blocks or resets) ---

  // GET /courses tests
  it('should return paginated list with full meta (200)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .get('/courses?page=1')
      .expect(200);

    expect(body).toHaveProperty('courses');
    expect(Array.isArray(body.courses)).toBe(true);
    expect(body).toHaveProperty('meta');
    const m = body.meta;
    expect(m).toHaveProperty('isFirstPage');
    expect(m).toHaveProperty('isLastPage');
    expect(m).toHaveProperty('currentPage', 1);
    expect(m).toHaveProperty('previousPage');
    expect(m).toHaveProperty('nextPage');
    expect(m).toHaveProperty('pageCount');
    expect(m).toHaveProperty('totalCount');
  });

  it('should support search by course name', async () => {
    // Create a course with "Introduction" in the name for search testing
    await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send(
        createCourse({
          name: 'Introduction to Programming',
          courseCode: 'CS_SEARCH_TEST',
        }),
      )
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .get('/courses?search=Introduction')
      .expect(200);

    expect(
      body.courses.some(
        (c: any) =>
          typeof c.name === 'string' && c.name.includes('Introduction'),
      ),
    ).toBe(true);
  });

  it('should return 400 when page < 1', async () => {
    await request(context.adminApp.getHttpServer())
      .get('/courses?page=0')
      .expect(400);
  });

  it('should return 403 (Forbidden) when student tries to get courses', async () => {
    await request(context.studentApp.getHttpServer())
      .get('/courses')
      .expect(403);
  });

  it('should return 403 (Forbidden) when mentor tries to get courses', async () => {
    await request(context.mentorApp.getHttpServer())
      .get('/courses')
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .get('/courses')
      .expect(401);
  });

  // GET /courses/:id tests (using shared data)
  it('should return specific course by ID for admin (200)', async () => {
    // Create a course first to get a valid UUID
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    const { body } = await request(context.adminApp.getHttpServer())
      .get(`/courses/${createdCourse.id}`)
      .expect(200);

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('prereqs');
    expect(body).toHaveProperty('coreqs');
  });

  it('should return 404 (Not Found) for non-existent course ID', async () => {
    await request(context.adminApp.getHttpServer())
      .get(`/courses/${v4()}`)
      .expect(404);
  });

  it('should return 403 (Forbidden) when student tries to get a course by ID', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    await request(context.studentApp.getHttpServer())
      .get(`/courses/${createdCourse.id}`)
      .expect(403);
  });

  it('should return 403 (Forbidden) when mentor tries to get a course by ID', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    await request(context.mentorApp.getHttpServer())
      .get(`/courses/${createdCourse.id}`)
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .get(`/courses/${createdCourse.id}`)
      .expect(401);
  });

  // PATCH /courses/:id tests (create additional test data as needed)
  it('should allow admin to update course (200)', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    const updateCoursePayload = createCourseUpdate();

    const { body } = await request(context.adminApp.getHttpServer())
      .patch(`/courses/${createdCourse.id}`)
      .send(updateCoursePayload)
      .expect(200);

    expect(body.name).toBe(updateCoursePayload.name);
    expect(body.units).toBe(updateCoursePayload.units);
    expect(body.type).toBe(updateCoursePayload.type);
  });

  it('should return 409 when updating courseCode to an existing code (409)', async () => {
    // Create the first course with a specific code
    const { body: firstCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse({ courseCode: 'CS_CONFLICT_1', name: 'First Course' }))
      .expect(201);

    // Create another course with a different courseCode
    const { body: secondCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(
        createCourse({ courseCode: 'CS_CONFLICT_2', name: 'Second Course' }),
      )
      .expect(201);

    await request(context.adminApp.getHttpServer())
      .patch(`/courses/${secondCourse.id}`)
      .send({ courseCode: firstCourse.courseCode })
      .expect(409);
  });

  it('should return 400 with invalid update data (e.g., negative units)', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    await request(context.adminApp.getHttpServer())
      .patch(`/courses/${createdCourse.id}`)
      .send(createInvalidCourse.updateInvalidUnits())
      .expect(400);
  });

  it('should return 404 (Not Found) for non-existent course ID', async () => {
    const uniqueUpdatePayload = createCourseUpdate({
      name: 'Non-existent Course Update',
      courseCode: 'CS_NONEXISTENT_UPDATE',
    });

    await request(context.adminApp.getHttpServer())
      .patch(`/courses/${v4()}`)
      .send(uniqueUpdatePayload)
      .expect(404);
  });

  it('should return 403 (Forbidden) when mentor tries to update course', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    const updateCoursePayload = createCourseUpdate();

    await request(context.mentorApp.getHttpServer())
      .patch(`/courses/${createdCourse.id}`)
      .send(updateCoursePayload)
      .expect(403);
  });

  it('should return 403 (Forbidden) when student tries to update course', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    const updateCoursePayload = createCourseUpdate();

    await request(context.studentApp.getHttpServer())
      .patch(`/courses/${createdCourse.id}`)
      .send(updateCoursePayload)
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    // Create a course first
    const { body: createdCourse } = await request(
      context.adminApp.getHttpServer(),
    )
      .post('/courses')
      .send(createCourse())
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .patch(`/courses/${createdCourse.id}`)
      .send(createCourseUpdate())
      .expect(401);
  });

  // DELETE /courses/:id tests (create additional test data as needed)
  it('should soft delete first, then permanently delete on second call (idempotent flow)', async () => {
    const { body: course1 } = await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send(createCourse())
      .expect(201);

    const soft = await request(context.adminApp.getHttpServer())
      .delete(`/courses/${course1.id}`)
      .expect(200);
    expect(soft.body.message).toBe('Course marked for deletion');

    const second = await request(context.adminApp.getHttpServer())
      .delete(`/courses/${course1.id}`)
      .expect(200);
    expect(second.body.message).toBe('Course permanently deleted');

    await request(context.adminApp.getHttpServer())
      .get(`/courses/${course1.id}`)
      .expect(404);
  });

  it('should return 404 (Not Found) for non-existent course ID', async () => {
    await request(context.adminApp.getHttpServer())
      .delete(`/courses/${v4()}`)
      .expect(404);
  });

  it('should return 403 (Forbidden) when student tries to delete course', async () => {
    const { body: course1 } = await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send(createCourse())
      .expect(201);

    await request(context.studentApp.getHttpServer())
      .delete(`/courses/${course1.id}`)
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    // Create a unique course payload for this specific test
    const uniqueCoursePayload = createCourse({
      courseCode: 'CS_DELETE_AUTH_TEST',
      name: 'Delete Auth Test Course',
    });

    const { body: course1 } = await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send(uniqueCoursePayload)
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .delete(`/courses/${course1.id}`)
      .expect(401);
  });

  // Edge cases and error handling
  it('should handle malformed JSON in request body (400)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/courses')
      .set('Content-Type', 'application/json')
      // Intentionally malformed JSON string body
      .send('{"invalid": json}')
      .expect(400);
  });
});
