import request from 'supertest';
import { TestAppService } from './utils/test-app.service';
import { INestApplication } from '@nestjs/common';
import {
  createCourse,
  createCourseUpdate,
  createInvalidCourse,
} from './factories/course.factory';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('CoursesController (Integration)', () => {
  let testService: TestAppService;

  // Cache for frequently used app instances
  let adminApp: INestApplication;
  let studentApp: INestApplication;
  let mentorApp: INestApplication;
  let unauthApp: INestApplication;

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

  beforeEach(async () => {
    // Reset the database before each test group or use for specific tests
    await testService.resetDatabase();
  }, 10000); // Timeout for reset operation

  afterAll(async () => {
    await testService.close();
    await TestAppService.closeAll(); // Clean up static resources
  }, 15000); // Timeout for cleanup

  // --- POST /courses ---
  describe('POST /courses', () => {
    it('should allow an admin to create a new course with valid data (201)', async () => {
      await testService.resetDatabase();

      const { body } = await request(adminApp.getHttpServer())
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
      await testService.resetDatabase();

      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(409);
    });

    it('should return 403 (Forbidden) if a student tries to create a course', async () => {
      await request(studentApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if a mentor tries to create a course', async () => {
      await request(mentorApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(unauthApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.missingFields())
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is negative', async () => {
      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.invalidUnits())
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is not an integer', async () => {
      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.invalidUnitsType())
        .expect(400);
    });

    it('should return 400 (Bad Request) when relation IDs are invalid UUIDs', async () => {
      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(createInvalidCourse.invalidRelationIds())
        .expect(400);
    });
  });

  // --- GET /courses ---
  describe('GET /courses', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create test data once for all GET tests
      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/courses')
        .send(anotherValidCoursePayload)
        .expect(201);
    });

    it('should return paginated list with full meta (200)', async () => {
      const { body } = await request(adminApp.getHttpServer())
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
      const { body } = await request(adminApp.getHttpServer())
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
      await request(adminApp.getHttpServer())
        .get('/courses?page=0')
        .expect(400);
    });

    it('should return 403 (Forbidden) when student tries to get courses', async () => {
      await request(studentApp.getHttpServer()).get('/courses').expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to get courses', async () => {
      await request(mentorApp.getHttpServer()).get('/courses').expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer()).get('/courses').expect(401);
    });
  });

  // --- GET /courses/:id ---
  describe('GET /courses/:id', () => {
    let createdCourseId: string;

    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test course for individual GET tests
      const { body } = await request(adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);

      createdCourseId = body.id;
    });

    it('should return specific course by ID for admin (200)', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(200);

      expect(body.id).toBe(createdCourseId);
      expect(body.courseCode).toBe(validCoursePayload.courseCode);
      expect(body.type).toBe(validCoursePayload.type);
      expect(body).toHaveProperty('prereqs');
      expect(body).toHaveProperty('coreqs');
      expect(body).toHaveProperty('prereqFor');
      expect(body).toHaveProperty('coreqFor');
    });

    it('should return 404 (Not Found) for non-existent course ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(adminApp.getHttpServer())
        .get(`/courses/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to get a course by ID', async () => {
      await request(studentApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to get a course by ID', async () => {
      await request(mentorApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(401);
    });
  });

  // --- PATCH /courses/:id ---
  describe('PATCH /courses/:id', () => {
    let createdCourseId: string;

    beforeAll(async () => {
      await testService.resetDatabase();

      // Create a test course for PATCH tests
      const { body } = await request(adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      createdCourseId = body.id;
    });

    it('should allow admin to update course (200)', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(200);

      expect(body.name).toBe(updateCoursePayload.name);
      expect(body.units).toBe(updateCoursePayload.units);
      expect(body.type).toBe(updateCoursePayload.type);
    });

    it('should return 409 when updating courseCode to an existing code (409)', async () => {
      // Create another course with a different courseCode
      const { body: other } = await request(adminApp.getHttpServer())
        .post('/courses')
        .send({
          ...anotherValidCoursePayload,
          courseCode: 'CS202',
          name: 'Other Course',
        })
        .expect(201);

      await request(adminApp.getHttpServer())
        .patch(`/courses/${other.id}`)
        .send({ courseCode: 'CS101' }) // duplicate of the first course
        .expect(409);
    });

    it('should attach prereq/coreq relations and reflect in GET (200)', async () => {
      // Base course to use as a relation
      const { body: base } = await request(adminApp.getHttpServer())
        .post('/courses')
        .send({
          ...anotherValidCoursePayload,
          courseCode: 'CS300',
          name: 'Base Course',
        })
        .expect(201);

      const { body: updated } = await request(adminApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send({ prereqIds: [base.id], coreqIds: [base.id] })
        .expect(200);

      expect(updated.prereqs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: base.id })]),
      );
      expect(updated.coreqs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: base.id })]),
      );

      const { body: fetched } = await request(adminApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(200);
      expect(fetched.prereqs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: base.id })]),
      );
      expect(fetched.coreqs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: base.id })]),
      );
    });

    it('should return 400 with invalid update data (e.g., negative units)', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(createInvalidCourse.updateInvalidUnits())
        .expect(400);
    });

    it('should return 400 when relation IDs are invalid UUIDs on update', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(createInvalidCourse.updateInvalidRelationIds())
        .expect(400);
    });

    it('should return 404 (Not Found) for non-existent course ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(adminApp.getHttpServer())
        .patch(`/courses/${nonExistentId}`)
        .send(updateCoursePayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to update course', async () => {
      await request(mentorApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) when student tries to update course', async () => {
      await request(studentApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(401);
    });
  });

  // --- DELETE /courses/:id ---
  describe('DELETE /courses/:id', () => {
    let createdCourseId: string;
    let secondCourseId: string;

    beforeAll(async () => {
      await testService.resetDatabase();

      // Create test courses for DELETE tests
      const { body: course1 } = await request(adminApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      createdCourseId = course1.id;

      const { body: course2 } = await request(adminApp.getHttpServer())
        .post('/courses')
        .send(anotherValidCoursePayload)
        .expect(201);
      secondCourseId = course2.id;
    });

    it('should soft delete first, then permanently delete on second call (idempotent flow)', async () => {
      const soft = await request(adminApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(200);
      expect(soft.body.message).toBe('Course marked for deletion');

      const second = await request(adminApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(200);
      expect(second.body.message).toBe('Course permanently deleted');

      await request(adminApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(404);
    });

    it('should permanently delete immediately when directDelete=true', async () => {
      const hard = await request(adminApp.getHttpServer())
        .delete(`/courses/${secondCourseId}?directDelete=true`)
        .expect(200);

      expect(hard.body.message).toBe('Course permanently deleted');

      await request(adminApp.getHttpServer())
        .get(`/courses/${secondCourseId}`)
        .expect(404);
    });

    it('should return 404 (Not Found) for non-existent course ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(adminApp.getHttpServer())
        .delete(`/courses/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete course', async () => {
      await request(studentApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to delete course', async () => {
      await request(mentorApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(unauthApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(401);
    });
  });

  // --- Edge cases and error handling ---
  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent course creation with the same courseCode (one 201, one 409)', async () => {
      await testService.resetDatabase();

      const courseData = createCourse({
        courseCode: 'CS200',
        name: 'Concurrent Test',
      });
      const results = await Promise.allSettled([
        request(adminApp.getHttpServer()).post('/courses').send(courseData),
        request(adminApp.getHttpServer()).post('/courses').send(courseData),
      ]);

      const statuses = results.map((r) =>
        r.status === 'fulfilled' ? (r.value as any).status : 500,
      );
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);
    });

    it('should handle malformed JSON in request body (400)', async () => {
      await request(adminApp.getHttpServer())
        .post('/courses')
        .set('Content-Type', 'application/json')
        // Intentionally malformed JSON string body
        .send('{"invalid": json}')
        .expect(400);
    });
  });
});
