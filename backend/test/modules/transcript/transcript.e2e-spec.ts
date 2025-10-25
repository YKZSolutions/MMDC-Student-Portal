import request from 'supertest';
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
describe('TranscriptController (Integration)', () => {
  let context: TestContext;

  const upsertTranscriptPayload = {
    studentId: 'student-id-placeholder',
    courseOfferingId: 'course-offering-id-placeholder',
    grade: 95.5,
    gradeLetter: 'A',
  };

  const updateTranscriptPayload = {
    grade: 90.0,
    gradeLetter: 'B+',
  };

  beforeAll(async () => {
    context = await setupTestEnvironment();
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- PUT /transcript ---
  describe('PUT /transcript', () => {
    it('should return 404 (Not Found) when student or course offering does not exist', async () => {
      await request(context.adminApp.getHttpServer())
        .put('/transcript')
        .send(upsertTranscriptPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) if a student tries to upsert transcript', async () => {
      await request(context.studentApp.getHttpServer())
        .put('/transcript')
        .send(upsertTranscriptPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .put('/transcript')
        .send(upsertTranscriptPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.adminApp.getHttpServer())
        .put('/transcript')
        .send({ grade: 95 })
        .expect(400);
    });
  });

  // --- GET /transcript ---
  describe('GET /transcript', () => {
    it('should return list of transcripts for admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/transcript')
        .expect(200);

      expect(body).toHaveProperty('transcripts');
      expect(Array.isArray(body.transcripts)).toBe(true);
    });

    it('should allow students to view their own transcripts (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/transcript')
        .expect(200);

      expect(body).toHaveProperty('transcripts');
      expect(Array.isArray(body.transcripts)).toBe(true);
    });

    it('should allow mentors to view transcripts (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .get('/transcript')
        .expect(200);

      expect(body).toHaveProperty('transcripts');
      expect(Array.isArray(body.transcripts)).toBe(true);
    });

    it('should support filtering by studentId', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/transcript?studentId=some-student-id')
        .expect(200);

      expect(body).toHaveProperty('transcripts');
      expect(Array.isArray(body.transcripts)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/transcript')
        .expect(401);
    });
  });

  // --- GET /transcript/:transcriptId ---
  describe('GET /transcript/:transcriptId', () => {
    it('should return 404 (Not Found) for non-existent transcript ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/transcript/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 (Bad Request) for invalid UUID format', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/transcript/invalid-uuid')
        .expect(400);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .get(`/transcript/${testId}`)
        .expect(401);
    });
  });

  // --- PATCH /transcript/:transcriptId ---
  describe('PATCH /transcript/:transcriptId', () => {
    it('should return 404 (Not Found) for non-existent transcript ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .patch(`/transcript/${nonExistentId}`)
        .send(updateTranscriptPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to update transcript', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .patch(`/transcript/${testId}`)
        .send(updateTranscriptPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .patch(`/transcript/${testId}`)
        .send(updateTranscriptPayload)
        .expect(401);
    });
  });

  // --- DELETE /transcript/:transcriptId ---
  describe('DELETE /transcript/:transcriptId', () => {
    it('should return 404 (Not Found) for non-existent transcript ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(`/transcript/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete transcript', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.studentApp.getHttpServer())
        .delete(`/transcript/${testId}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to delete transcript', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .delete(`/transcript/${testId}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .delete(`/transcript/${testId}`)
        .expect(401);
    });
  });
});
