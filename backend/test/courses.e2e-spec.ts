import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestAppService } from './utils/test-app.service';
import { mockUsers } from './utils/mock-users';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';

describe('CoursesController (Integration)', () => {
  const testService = new TestAppService();
  let app: INestApplication;
  let prisma: ExtendedPrismaClient;
  let createdCourseId: string;

  const validCoursePayload = {
    courseCode: 'CS101',
    name: 'Introduction to Computer Science',
    description: 'A foundational course on programming and algorithms.',
    units: 3,
  };

  const anotherValidCoursePayload = {
    courseCode: 'CS102',
    name: 'Data Structures',
    description: 'Advanced data structures and algorithms.',
    units: 4,
  };

  beforeAll(async () => {
    const { prisma: p } = await testService.start();
    prisma = p;
  }, 800000);

  afterAll(async () => {
    await testService.close();
  });

  // --- POST /courses ---
  describe('POST /courses', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should allow an admin to create a new course with valid data (201)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.courseCode).toBe(validCoursePayload.courseCode);
      expect(body.name).toBe(validCoursePayload.name);
      expect(body.units).toBe(validCoursePayload.units);
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');

      createdCourseId = body.id;
    });

    it('should return 409 (Conflict) if a course with the same courseCode already exists', async () => {
      await request(app.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(409);
    });

    it('should return 403 (Forbidden) if a student tries to create a course', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );

      await request(studentApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(403);

      await studentApp.close();
    });

    it('should return 403 (Forbidden) if a mentor tries to create a course', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );

      await request(mentorApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(403);

      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );

      await request(unauthApp.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(401);

      await unauthApp.close();
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      const invalidPayload = {
        courseCode: 'CSX01',
        // Missing name, description, units
      };

      await request(app.getHttpServer())
        .post('/courses')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is negative', async () => {
      await request(app.getHttpServer())
        .post('/courses')
        .send({ ...validCoursePayload, units: -1 })
        .expect(400);
    });

    it('should return 400 (Bad Request) when units is not an integer', async () => {
      await request(app.getHttpServer())
        .post('/courses')
        .send({ ...validCoursePayload, units: 3.5 })
        .expect(400);
    });

    it('should return 400 (Bad Request) when relation IDs are invalid UUIDs', async () => {
      const payload = {
        ...validCoursePayload,
        prereqIds: ['not-a-uuid'],
        coreqIds: ['also-not-uuid'],
      };
      await request(app.getHttpServer())
        .post('/courses')
        .send(payload)
        .expect(400);
    });
  });

  // --- GET /courses ---
  describe('GET /courses', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      await request(app.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/courses')
        .send(anotherValidCoursePayload)
        .expect(201);
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should return paginated list with full meta (200)', async () => {
      const { body } = await request(app.getHttpServer())
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
      const { body } = await request(app.getHttpServer())
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
      await request(app.getHttpServer()).get('/courses?page=0').expect(400);
    });

    it('should return 403 (Forbidden) when student tries to get courses', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer()).get('/courses').expect(403);
      await studentApp.close();
    });

    it('should return 403 (Forbidden) when mentor tries to get courses', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer()).get('/courses').expect(403);
      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer()).get('/courses').expect(401);
      await unauthApp.close();
    });
  });

  // --- GET /courses/:id ---
  describe('GET /courses/:id', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      const { body } = await request(app.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      createdCourseId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should return specific course by ID for admin (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(200);

      expect(body.id).toBe(createdCourseId);
      expect(body.courseCode).toBe(validCoursePayload.courseCode);
      expect(body).toHaveProperty('prereqs');
      expect(body).toHaveProperty('coreqs');
      expect(body).toHaveProperty('prereqFor');
      expect(body).toHaveProperty('coreqFor');
    });

    it('should return 404 (Not Found) for non-existent course ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(app.getHttpServer())
        .get(`/courses/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to get a course by ID', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(403);
      await studentApp.close();
    });

    it('should return 403 (Forbidden) when mentor tries to get a course by ID', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(403);
      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- PATCH /courses/:id ---
  describe('PATCH /courses/:id', () => {
    const updateCoursePayload = {
      name: 'Updated Course Name',
      description: 'Updated description',
      units: 4,
    };

    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      const { body } = await request(app.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      createdCourseId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should allow admin to update course (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(200);

      expect(body.name).toBe(updateCoursePayload.name);
      expect(body.units).toBe(updateCoursePayload.units);
    });

    it('should return 409 when updating courseCode to an existing code (409)', async () => {
      // Create another course with a different courseCode
      const { body: other } = await request(app.getHttpServer())
        .post('/courses')
        .send({ ...validCoursePayload, courseCode: 'CS202', name: 'Other' })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/courses/${other.id}`)
        .send({ courseCode: 'CS101' }) // duplicate of the first course
        .expect(409);
    });

    it('should attach prereq/coreq relations and reflect in GET (200)', async () => {
      // Base course to use as relation
      const { body: base } = await request(app.getHttpServer())
        .post('/courses')
        .send({ ...validCoursePayload, courseCode: 'CS300', name: 'Base' })
        .expect(201);

      const { body: updated } = await request(app.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send({ prereqIds: [base.id], coreqIds: [base.id] })
        .expect(200);

      expect(updated.prereqs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: base.id })]),
      );
      expect(updated.coreqs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: base.id })]),
      );

      const { body: fetched } = await request(app.getHttpServer())
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
      await request(app.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send({ units: -1 })
        .expect(400);
    });

    it('should return 400 when relation IDs are invalid UUIDs on update', async () => {
      await request(app.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send({ prereqIds: ['not-uuid'] })
        .expect(400);
    });

    it('should return 404 (Not Found) for non-existent course ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(app.getHttpServer())
        .patch(`/courses/${nonExistentId}`)
        .send(updateCoursePayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when mentor tries to update course', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(403);
      await mentorApp.close();
    });

    it('should return 403 (Forbidden) when student tries to update course', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(403);
      await studentApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .patch(`/courses/${createdCourseId}`)
        .send(updateCoursePayload)
        .expect(401);
      await unauthApp.close();
    });
  });

  // --- DELETE /courses/:id ---
  describe('DELETE /courses/:id', () => {
    beforeEach(async () => {
      const { app: adminApp } = await testService.createTestApp(
        mockUsers.admin,
      );
      app = adminApp;

      const { body } = await request(app.getHttpServer())
        .post('/courses')
        .send(validCoursePayload)
        .expect(201);
      createdCourseId = body.id;
    });

    afterEach(async () => {
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should soft delete first, then permanently delete on second call (idempotent flow)', async () => {
      const soft = await request(app.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(200);
      expect(soft.body.message).toBe('Course marked for deletion');

      const second = await request(app.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(200);
      expect(second.body.message).toBe('Course permanently deleted');

      await request(app.getHttpServer())
        .get(`/courses/${createdCourseId}`)
        .expect(404);
    });

    it('should permanently delete immediately when directDelete=true', async () => {
      // Create another course for hard-delete test
      const { body: created } = await request(app.getHttpServer())
        .post('/courses')
        .send(anotherValidCoursePayload)
        .expect(201);

      const hard = await request(app.getHttpServer())
        .delete(`/courses/${created.id}?directDelete=true`)
        .expect(200);

      expect(hard.body.message).toBe('Course permanently deleted');

      await request(app.getHttpServer())
        .get(`/courses/${created.id}`)
        .expect(404);
    });

    it('should return 404 (Not Found) for non-existent course ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(app.getHttpServer())
        .delete(`/courses/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete course', async () => {
      const { app: studentApp } = await testService.createTestApp(
        mockUsers.student,
      );
      await request(studentApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(403);
      await studentApp.close();
    });

    it('should return 403 (Forbidden) when mentor tries to delete course', async () => {
      const { app: mentorApp } = await testService.createTestApp(
        mockUsers.mentor,
      );
      await request(mentorApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
        .expect(403);
      await mentorApp.close();
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const { app: unauthApp } = await testService.createTestApp(
        mockUsers.unauth,
      );
      await request(unauthApp.getHttpServer())
        .delete(`/courses/${createdCourseId}`)
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
      if (app) await app.close();
      await testService.resetDatabase(prisma);
    });

    it('should handle concurrent course creation with the same courseCode (one 201, one 409)', async () => {
      const results = await Promise.allSettled([
        request(app.getHttpServer()).post('/courses').send(validCoursePayload),
        request(app.getHttpServer()).post('/courses').send(validCoursePayload),
      ]);

      const statuses = results.map((r) =>
        r.status === 'fulfilled' ? (r.value as any).status : 500,
      );
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);
    });

    it('should handle malformed JSON in request body (400)', async () => {
      await request(app.getHttpServer())
        .post('/courses')
        .set('Content-Type', 'application/json')
        // Intentionally malformed JSON string body
        .send('{"invalid": json}')
        .expect(400);
    });
  });
});
