import request from 'supertest';
import { v4 } from 'uuid';
import {
  createInvalidMajor,
  createMajor,
  createMajorUpdate,
} from '../../factories/major.factory';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
  TestContext,
} from '../../test-setup';
import { testPrograms } from '../../factories/program.factory';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
*/
describe('MajorsController (Integration)', () => {
  let context: TestContext;
  let programId: string;

  beforeAll(async () => {
    context = await setupTestEnvironment();
    const { body: program } = await request(context.adminApp.getHttpServer())
      .post('/programs')
      .send(testPrograms.default)
      .expect(201);

    programId = program.id;
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  }, 15000);

  describe('POST /majors', () => {
    // POST /majors tests
    it('should allow admin to create a major (201)', async () => {
      const validMajorPayload = createMajor({ programId });
      const { body } = await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.majorCode).toBe(validMajorPayload.major.majorCode);
      expect(body.name).toBe(validMajorPayload.major.name);
      expect(body.description).toBe(validMajorPayload.major.description);
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
    });

    it('should return 409 when creating duplicate code (409)', async () => {
      const validMajorPayload = createMajor({ programId });
      await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(
          createMajor({
            programId: validMajorPayload.programId,
            majorCode: 'DupeCode',
          }),
        )
        .expect(201);

      await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(
          createMajor({
            programId: validMajorPayload.programId,
            majorCode: 'DupeCode',
          }),
        )
        .expect(409);
    });

    it('should return 400 for missing required fields', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(createInvalidMajor.missingMajor())
        .expect(400);
    });

    it('should return 403 when student tries to create', async () => {
      const validMajorPayload = createMajor({ programId });
      await request(context.studentApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(403);
    });

    it('should return 403 when mentor tries to create', async () => {
      const validMajorPayload = createMajor({ programId });
      await request(context.mentorApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(403);
    });
  });

  describe('GET /majors', () => {
    it('should return a list of majors with meta (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/majors?page=1')
        .expect(200);

      expect(body).toHaveProperty('majors');
      expect(Array.isArray(body.majors)).toBe(true);
      expect(body).toHaveProperty('meta');
    });

    it('should support search by name', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(
          createMajor({
            programId: programId,
            name: 'Major in Computer Program',
          }),
        )
        .expect(201);

      const { body } = await request(context.adminApp.getHttpServer())
        .get('/majors?search=Computer')
        .expect(200);
      expect(body.majors.some((m: any) => m.name.includes('Computer'))).toBe(
        true,
      );
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
      await request(context.mentorApp.getHttpServer())
        .get('/majors')
        .expect(403);
    });
  });

  describe('GET /majors/:id', () => {
    it('should return a major by ID (200)', async () => {
      const validMajorPayload = createMajor({ programId });
      const { body: created } = await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);

      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/majors/${created.id}`)
        .expect(200);
      expect(body.id).toBe(created.id);
      expect(body.majorCode).toBe(validMajorPayload.major.majorCode);
      expect(body.name).toBe(validMajorPayload.major.name);
      expect(body.description).toBe(validMajorPayload.major.description);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(context.adminApp.getHttpServer())
        .get(`/majors/${v4()}`)
        .expect(404);
    });

    it('should return 403 for student', async () => {
      const validMajorPayload = createMajor({ programId });
      const { body: created } = await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);

      await request(context.studentApp.getHttpServer())
        .get(`/majors/${created.id}`)
        .expect(403);
    });
  });

  describe('PATCH /majors/:id', () => {
    it('should allow admin to update (200)', async () => {
      const validMajorPayload = createMajor({ programId });
      const { body: created } = await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);

      const updatePayload = createMajorUpdate();

      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/majors/${created.id}`)
        .send(updatePayload)
        .expect(200);

      expect(body.majorCode).toBe(updatePayload.majorCode);
      expect(body.name).toBe(updatePayload.name);
      expect(body.description).toBe(updatePayload.description);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(context.adminApp.getHttpServer())
        .patch(`/majors/${v4()}`)
        .send(
          createMajorUpdate({
            majorCode: 'NonConflictingCode',
            name: 'NonConflictingName',
          }),
        )
        .expect(404);
    });

    it('should return 403 for student', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/majors/${v4()}`)
        .expect(403);
    });
  });

  describe('DELETE /majors/:id', () => {
    it('should soft delete then permanently delete', async () => {
      const validMajorPayload = createMajor({ programId });
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
      const validMajorPayload = createMajor({ programId });
      const { body: created } = await request(context.adminApp.getHttpServer())
        .post('/majors')
        .send(validMajorPayload)
        .expect(201);

      await request(context.studentApp.getHttpServer())
        .delete(`/majors/${created.id}`)
        .expect(403);
    });
  });
});
