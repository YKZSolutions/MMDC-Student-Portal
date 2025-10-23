import request from 'supertest';
import { TestAppService } from './utils/test-app.service';
import { INestApplication } from '@nestjs/common';
import { v4 } from 'uuid';
import {
  createCurriculum,
  createCurriculumUpdate,
  createInvalidCurriculum,
} from './factories/curriculum.factory';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('CurriculumsController (Integration)', () => {
  let testService: TestAppService;

  // Cache for frequently used app instances
  let adminApp: INestApplication;
  let studentApp: INestApplication;
  let mentorApp: INestApplication;
  let unauthApp: INestApplication;

  // Test data using factory functions with a proper API structure
  const validCurriculumPayload = createCurriculum({
    majorId: v4(),
    description: 'CS Curriculum for 2025',
  });
  const anotherValidCurriculumPayload = createCurriculum({
    majorId: v4(),
    description: 'CS Curriculum for 2026',
  });
  const updatePayload = createCurriculumUpdate();

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
  }, 30000);

  beforeEach(async () => {
    // Reset the database before each test group or use for specific tests
    await testService.resetDatabase();
  }, 10000); // Timeout for reset operation

  afterAll(async () => {
    await testService.close();
    await TestAppService.closeAll(); // Clean up static resources
  }, 15000); // Timeout for cleanup

  // --- POST /curriculums ---
  describe('POST /curriculums', () => {
    it('should allow admin to create a curriculum (201)', async () => {
      await testService.resetDatabase();

      const { body } = await request(adminApp.getHttpServer())
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
      await testService.resetDatabase();

      await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(409);
    });

    it('should return 400 for missing required fields', async () => {
      await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(createInvalidCurriculum.missingMajorId())
        .expect(400);
    });

    it('should return 403 when student tries to create', async () => {
      await request(studentApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(403);
    });

    it('should return 403 when mentor tries to create', async () => {
      await request(mentorApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(403);
    });

    it('should return 401 when unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(401);
    });
  });

  // --- GET /curriculums ---
  describe('GET /curriculums', () => {
    beforeAll(async () => {
      await testService.resetDatabase();

      // Create test data once for all GET tests
      await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(anotherValidCurriculumPayload)
        .expect(201);
    });

    it('should return a paginated list with meta (200)', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .get('/curriculums?page=1')
        .expect(200);

      expect(body).toHaveProperty('curriculums');
      expect(Array.isArray(body.curriculums)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should support search by description', async () => {
      const { body } = await request(adminApp.getHttpServer())
        .get('/curriculums?search=2025')
        .expect(200);
      expect(
        body.curriculums.some((c: any) =>
          c.curriculum.description.includes('2025'),
        ),
      ).toBe(true);
    });

    it('should return 400 when page < 1', async () => {
      await request(adminApp.getHttpServer())
        .get('/curriculums?page=0')
        .expect(400);
    });

    it('should return 403 for student', async () => {
      await request(studentApp.getHttpServer()).get('/curriculums').expect(403);
    });

    it('should return 403 for mentor', async () => {
      await request(mentorApp.getHttpServer()).get('/curriculums').expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer()).get('/curriculums').expect(401);
    });
  });

  // --- GET /curriculums/:id ---
  describe('GET /curriculums/:id', () => {
    it('should return a curriculum by ID (200)', async () => {
      const { body: newCurriculum } = await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);

      const createdCurriculumId = newCurriculum.id;

      const { body } = await request(adminApp.getHttpServer())
        .get(`/curriculums/${createdCurriculumId}`)
        .expect(200);
      expect(body.id).toBe(createdCurriculumId);
      expect(body.majorId).toBe(validCurriculumPayload.majorId);
      expect(body.curriculum.name).toBe(validCurriculumPayload.curriculum.name);
      expect(body.curriculum.description).toBe(
        validCurriculumPayload.curriculum.description,
      );
    });

    it('should return 404 for non-existent ID', async () => {
      await request(adminApp.getHttpServer())
        .get(`/curriculums/${v4()}`)
        .expect(404);
    });

    it('should return 403 for student', async () => {
      await request(studentApp.getHttpServer())
        .get(`/curriculums/${v4()}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .get(`/curriculums/${v4()}`)
        .expect(401);
    });
  });

  // --- PATCH /curriculums/:id ---
  describe('PATCH /curriculums/:id', () => {
    it('should allow admin to update (200)', async () => {
      await testService.resetDatabase();

      const { body: newCurriculum } = await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);

      const createdCurriculumId = newCurriculum.id;

      const { body } = await request(adminApp.getHttpServer())
        .patch(`/curriculums/${createdCurriculumId}`)
        .send(updatePayload)
        .expect(200);
      expect(body.curriculum.description).toBe(
        updatePayload.curriculum.description,
      );
      expect(body.curriculum.name).toBe(updatePayload.curriculum.name);
    });

    it('should return 400 for invalid update data', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/curriculums/${v4()}`)
        .send(createInvalidCurriculum.updateMissingCurriculum())
        .expect(400);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(adminApp.getHttpServer())
        .patch(`/curriculums/${v4()}`)
        .send(updatePayload)
        .expect(404);
    });

    it('should return 403 for mentor', async () => {
      await request(mentorApp.getHttpServer())
        .patch(`/curriculums/${v4()}`)
        .send(updatePayload)
        .expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .patch(`/curriculums/${v4()}`)
        .send(updatePayload)
        .expect(401);
    });
  });

  // --- DELETE /curriculums/:id ---
  describe('DELETE /curriculums/:id', () => {
    it('should soft delete then permanently delete', async () => {
      await testService.resetDatabase();

      const { body: newCurriculum } = await request(adminApp.getHttpServer())
        .post('/curriculums')
        .send(validCurriculumPayload)
        .expect(201);

      const createdCurriculumId = newCurriculum.id;

      const soft = await request(adminApp.getHttpServer())
        .delete(`/curriculums/${createdCurriculumId}`)
        .expect(200);
      expect(soft.body.message).toBe('Curriculum marked for deletion');

      const hard = await request(adminApp.getHttpServer())
        .delete(`/curriculums/${createdCurriculumId}`)
        .expect(200);
      expect(hard.body.message).toBe('Curriculum permanently deleted');
    });

    it('should return 404 for non-existent ID', async () => {
      await request(adminApp.getHttpServer())
        .delete(`/curriculums/${v4()}`)
        .expect(404);
    });

    it('should return 403 for student', async () => {
      await request(studentApp.getHttpServer())
        .delete(`/curriculums/${v4()}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated', async () => {
      await request(unauthApp.getHttpServer())
        .delete(`/curriculums/${v4()}`)
        .expect(401);
    });
  });
});
