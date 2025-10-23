import request from 'supertest';
import {
  createCourse,
  createCourseUpdate,
  createInvalidCourse,
} from '../../factories/course.factory';
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
describe('CoursesController (Integration)', () => {
  let context: TestContext;

  // Test data using factory functions with unique data
  const validCoursePayload = createCourse({
    courseCode: 'CS101',
    name: 'Introduction to Computer Science',
  });
  const anotherValidCoursePayload = createCourse({
    courseCode: 'CS102',
    name: 'Data Structures',
  });
  const updateCoursePayload = createCourseUpdate();

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 30000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 15000);

  // --- POST /courses ---
  describe('POST /courses', () => {
    it('should allow an admin to create a new course with valid data (201)', async () => {
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
      // First, create a course
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);

      // Then try to create another with the same code
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(409);
    });

    it('should return 403 (Forbidden) if a student tries to create a course', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a course', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.missingFields())
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is negative', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.invalidUnits())
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is not an integer', async () => {
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
    const { body } = await request(context.adminApp.getHttpServer())
      .get('/courses/1') // Using shared course from setup
      .expect(200);

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('prereqs');
    expect(body).toHaveProperty('coreqs');
    expect(body).toHaveProperty('prereqFor');
    expect(body).toHaveProperty('coreqFor');
  });

  it('should return 404 (Not Found) for non-existent course ID', async () => {
    const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
    await request(context.adminApp.getHttpServer())
      .get(`/courses/${nonExistentId}`)
      .expect(404);
  });

  it('should return 403 (Forbidden) when student tries to get a course by ID', async () => {
    await request(context.studentApp.getHttpServer())
      .get('/courses/1')
      .expect(403);
  });

  it('should return 403 (Forbidden) when mentor tries to get a course by ID', async () => {
    await request(context.mentorApp.getHttpServer())
      .get('/courses/1')
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .get('/courses/1')
      .expect(401);
  });

  // PATCH /courses/:id tests (create additional test data as needed)
  it('should allow admin to update course (200)', async () => {
    const { body } = await request(context.adminApp.getHttpServer())
      .patch('/courses/1')
      .send(updateCoursePayload)
      .expect(200);

    expect(body.name).toBe(updateCoursePayload.name);
    expect(body.units).toBe(updateCoursePayload.units);
    expect(body.type).toBe(updateCoursePayload.type);
  });

  it('should return 409 when updating courseCode to an existing code (409)', async () => {
    // Create another course with a different courseCode
    const { body: other } = await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send({
        ...anotherValidCoursePayload,
        courseCode: 'CS202',
        name: 'Other Course',
      })
      .expect(201);

    await request(context.adminApp.getHttpServer())
      .patch(`/courses/${other.id}`)
      .send({ courseCode: 'CS101' }) // duplicate of the first course
      .expect(409);
  });

  it('should return 400 with invalid update data (e.g., negative units)', async () => {
    await request(context.adminApp.getHttpServer())
      .patch('/courses/1')
      .send(createInvalidCourse.updateInvalidUnits())
      .expect(400);
  });

  it('should return 404 (Not Found) for non-existent course ID', async () => {
    const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
    await request(context.adminApp.getHttpServer())
      .patch(`/courses/${nonExistentId}`)
      .send(updateCoursePayload)
      .expect(404);
  });

  it('should return 403 (Forbidden) when mentor tries to update course', async () => {
    await request(context.mentorApp.getHttpServer())
      .patch('/courses/1')
      .send(updateCoursePayload)
      .expect(403);
  });

  it('should return 403 (Forbidden) when student tries to update course', async () => {
    await request(context.studentApp.getHttpServer())
      .patch('/courses/1')
      .send(updateCoursePayload)
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    await request(context.unauthApp.getHttpServer())
      .patch('/courses/1')
      .send(updateCoursePayload)
      .expect(401);
  });

  // DELETE /courses/:id tests (create additional test data as needed)
  it('should soft delete first, then permanently delete on second call (idempotent flow)', async () => {
    const { body: course1 } = await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send(validCoursePayload)
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
    const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
    await request(context.adminApp.getHttpServer())
      .delete(`/courses/${nonExistentId}`)
      .expect(404);
  });

  it('should return 403 (Forbidden) when student tries to delete course', async () => {
    const { body: course1 } = await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send(validCoursePayload)
      .expect(201);

    await request(context.studentApp.getHttpServer())
      .delete(`/courses/${course1.id}`)
      .expect(403);
  });

  it('should return 401 (Unauthorized) when not authenticated', async () => {
    const { body: course1 } = await request(context.adminApp.getHttpServer())
      .post('/courses')
      .send(validCoursePayload)
      .expect(201);

    await request(context.unauthApp.getHttpServer())
      .delete(`/courses/${course1.id}`)
      .expect(401);
  });

  // Edge cases and error handling
  it('should handle concurrent course creation with the same courseCode (one 201, one 409)', async () => {
    const courseData = createCourse({
      courseCode: 'CS200',
      name: 'Concurrent Test',
    });
    const results = await Promise.allSettled([
      request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(courseData),
      request(context.adminApp.getHttpServer())
        .post('/courses')
        .send(courseData),
    ]);

    const statuses = results.map((r) =>
      r.status === 'fulfilled' ? (r.value as any).status : 500,
    );
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);
  });

  it('should handle malformed JSON in request body (400)', async () => {
    await request(context.adminApp.getHttpServer())
      .post('/courses')
      .set('Content-Type', 'application/json')
      // Intentionally malformed JSON string body
      .send('{"invalid": json}')
      .expect(400);
  });
});
