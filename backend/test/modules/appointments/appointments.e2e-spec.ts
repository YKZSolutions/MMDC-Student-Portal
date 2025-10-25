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
describe('AppointmentsController (Integration)', () => {
  let context: TestContext;
  let testCourseOfferingId: string;
  let testStudentId: string;
  let testMentorId: string;

  beforeAll(async () => {
    context = await setupTestEnvironment();

    // Get student and mentor IDs from mock users
    const mockUsers = context.testService.getMockUsers();
    testStudentId = mockUsers.student?.user_metadata.user_id || '';
    testMentorId = mockUsers.mentor?.user_metadata.user_id || '';

    // Create test data for appointments
    const pricingGroup = await context.prismaClient.pricingGroup.create({
      data: {
        name: 'Test Pricing Group for Appointments',
        amount: '10000',
        prices: {
          create: [
            {
              name: 'Test Fee',
              amount: '10000',
              type: 'tuition',
            },
          ],
        },
      },
    });

    const enrollmentPeriod =
      await context.prismaClient.enrollmentPeriod.create({
        data: {
          startYear: 2024,
          endYear: 2025,
          term: 1,
          startDate: '2026-09-01T00:00:00Z',
          endDate: '2026-12-20T00:00:00Z',
          status: 'active',
          pricingGroupId: pricingGroup.id,
        },
      });

    const course = await context.prismaClient.course.create({
      data: {
        courseCode: 'APPT101',
        name: 'Test Course for Appointments',
        description: 'Test course description',
        units: 3,
        type: 'lecture',
      },
    });

    const courseOffering = await context.prismaClient.courseOffering.create({
      data: {
        enrollmentPeriod: {
          connect: { id: enrollmentPeriod.id },
        },
        course: {
          connect: { id: course.id },
        },
      },
    });

    testCourseOfferingId = courseOffering.id;

    // Create a course section with the mentor assigned
    const courseSection = await context.prismaClient.courseSection.create({
      data: {
        name: 'Test Section',
        courseOfferingId: courseOffering.id,
        mentorId: testMentorId,
        maxSlot: 30,
        startSched: '08:00',
        endSched: '10:00',
        days: ['monday', 'wednesday', 'friday'],
      },
    });

    // Enroll the student in the course section
    await context.prismaClient.courseEnrollment.create({
      data: {
        student: {
          connect: { id: testStudentId },
        },
        courseOffering: {
          connect: { id: courseOffering.id },
        },
        courseSection: {
          connect: { id: courseSection.id },
        },
        status: 'enrolled',
        startedAt: '2026-09-01T00:00:00Z',
      },
    });
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment(context);
  }, 30000);

  // --- POST /appointments ---
  describe('POST /appointments', () => {
    const createAppointmentPayload = {
      title: 'Test Appointment',
      description: 'This is a test appointment',
      startAt: '2026-10-01T10:00:00Z',
      endAt: '2026-10-01T11:00:00Z',
      courseOfferingId: '',
      studentId: '',
      mentorId: '',
    };

    beforeAll(() => {
      createAppointmentPayload.courseOfferingId = testCourseOfferingId;
      createAppointmentPayload.studentId = testStudentId;
      createAppointmentPayload.mentorId = testMentorId;
    });

    it('should allow a student to create a new appointment (201)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .post('/appointments')
        .send(createAppointmentPayload)
        .expect(201);

      expect(body).toHaveProperty('id');
      expect(body.title).toBe(createAppointmentPayload.title);
      expect(body.description).toBe(createAppointmentPayload.description);
    });

    it('should return 403 (Forbidden) if admin tries to create appointment', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/appointments')
        .send(createAppointmentPayload)
        .expect(403);
    });

    it('should return 403 (Forbidden) if mentor tries to create appointment', async () => {
      await request(context.mentorApp.getHttpServer())
        .post('/appointments')
        .send(createAppointmentPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .post('/appointments')
        .send(createAppointmentPayload)
        .expect(401);
    });

    it('should return 400 (Bad Request) when required fields are missing', async () => {
      await request(context.studentApp.getHttpServer())
        .post('/appointments')
        .send({ title: 'Test' })
        .expect(400);
    });
  });

  // --- GET /appointments/mentors ---
  describe('GET /appointments/mentors', () => {
    it('should return list of mentors (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/appointments/mentors')
        .expect(200);

      expect(body).toHaveProperty('users');
      expect(Array.isArray(body.users)).toBe(true);
    });

    it('should allow students to view mentors (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/appointments/mentors')
        .expect(200);

      expect(body).toHaveProperty('users');
      expect(Array.isArray(body.users)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/appointments/mentors')
        .expect(401);
    });
  });

  // --- GET /appointments/courses ---
  describe('GET /appointments/courses', () => {
    it('should allow student to view their courses (200 or 404)', async () => {
      const response = await request(context.studentApp.getHttpServer()).get(
        '/appointments/courses',
      );

      // May return 404 if student has no enrolled courses
      expect([200, 404]).toContain(response.status);
    });

    it('should return 403 (Forbidden) if admin tries to access', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/appointments/courses')
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/appointments/courses')
        .expect(401);
    });
  });

  // --- GET /appointments/booked ---
  describe('GET /appointments/booked', () => {
    it('should allow student to check booked appointments (200)', async () => {
      const query = {
        courseId: testCourseOfferingId,
        mentorId: testMentorId,
        from: '2026-10-01T00:00:00Z',
        to: '2026-10-31T23:59:59Z',
      };

      const { body } = await request(context.studentApp.getHttpServer())
        .get('/appointments/booked')
        .query(query)
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
    });

    it('should return 403 (Forbidden) if admin tries to access', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/appointments/booked')
        .query({
          courseId: testCourseOfferingId,
          mentorId: testMentorId,
          from: '2026-10-01T00:00:00Z',
          to: '2026-10-31T23:59:59Z',
        })
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/appointments/booked')
        .expect(401);
    });
  });

  // --- GET /appointments ---
  describe('GET /appointments', () => {
    it('should return list of appointments for admin (200 or 404)', async () => {
      const response = await request(context.adminApp.getHttpServer()).get(
        '/appointments',
      );

      // May return 404 if no appointments exist
      expect([200, 404]).toContain(response.status);
    });

    it('should allow students to view their appointments (200 or 404)', async () => {
      const response = await request(context.studentApp.getHttpServer()).get(
        '/appointments',
      );

      expect([200, 404]).toContain(response.status);
    });

    it('should allow mentors to view appointments (200 or 404)', async () => {
      const response = await request(context.mentorApp.getHttpServer()).get(
        '/appointments',
      );

      expect([200, 404]).toContain(response.status);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/appointments')
        .expect(401);
    });
  });

  // --- GET /appointments/:mentorId/mentor ---
  describe('GET /appointments/:mentorId/mentor', () => {
    it('should return booked appointments for a mentor (200)', async () => {
      const startAt = '2026-10-01T00:00:00Z';
      const endAt = '2026-10-31T23:59:59Z';

      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/appointments/${testMentorId}/mentor`)
        .query({ startAt, endAt })
        .expect(200);

      expect(Array.isArray(body)).toBe(true);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/appointments/${testMentorId}/mentor`)
        .query({ startAt: '2026-10-01T00:00:00Z', endAt: '2026-10-31T23:59:59Z' })
        .expect(401);
    });
  });

  // --- GET /appointments/:id ---
  describe('GET /appointments/:id', () => {
    let createdAppointmentId: string;

    beforeAll(async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .post('/appointments')
        .send({
          title: 'Test Appointment for GET',
          description: 'This is a test appointment',
          startAt: '2026-10-02T10:00:00Z',
          endAt: '2026-10-02T11:00:00Z',
          courseOfferingId: testCourseOfferingId,
          studentId: testStudentId,
          mentorId: testMentorId,
        })
        .expect(201);
      createdAppointmentId = body.id;
    });

    it('should return specific appointment by ID (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get(`/appointments/${createdAppointmentId}`)
        .expect(200);

      expect(body).toHaveProperty('id', createdAppointmentId);
      expect(body.title).toBe('Test Appointment for GET');
    });

    it('should return 404 (Not Found) for non-existent appointment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .get(`/appointments/${nonExistentId}`)
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/appointments/${createdAppointmentId}`)
        .expect(401);
    });
  });

  // --- PATCH /appointments/:id ---
  describe('PATCH /appointments/:id', () => {
    let createdAppointmentId: string;

    beforeAll(async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .post('/appointments')
        .send({
          title: 'Test Appointment for PATCH',
          description: 'This is a test appointment',
          startAt: '2026-10-03T10:00:00Z',
          endAt: '2026-10-03T11:00:00Z',
          courseOfferingId: testCourseOfferingId,
          studentId: testStudentId,
          mentorId: testMentorId,
        })
        .expect(201);
      createdAppointmentId = body.id;
    });

    const updateAppointmentPayload = {
      title: 'Updated Appointment Title',
      gmeetLink: 'https://meet.google.com/abc-defg-hij',
    };

    it('should allow mentor to update appointment details (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .patch(`/appointments/${createdAppointmentId}`)
        .send(updateAppointmentPayload)
        .expect(200);

      expect(body.title).toBe(updateAppointmentPayload.title);
      expect(body.gmeetLink).toBe(updateAppointmentPayload.gmeetLink);
    });

    it('should return 404 (Not Found) for non-existent appointment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .patch(`/appointments/${nonExistentId}`)
        .send(updateAppointmentPayload)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to update', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/appointments/${createdAppointmentId}`)
        .send(updateAppointmentPayload)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/appointments/${createdAppointmentId}`)
        .send(updateAppointmentPayload)
        .expect(401);
    });
  });

  // --- PATCH /appointments/:id/status ---
  describe('PATCH /appointments/:id/status', () => {
    let createdAppointmentId: string;

    beforeAll(async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .post('/appointments')
        .send({
          title: 'Test Appointment for Status Update',
          description: 'This is a test appointment',
          startAt: '2026-10-04T10:00:00Z',
          endAt: '2026-10-04T11:00:00Z',
          courseOfferingId: testCourseOfferingId,
          studentId: testStudentId,
          mentorId: testMentorId,
        })
        .expect(201);
      createdAppointmentId = body.id;
    });

    it('should allow updating appointment status (200)', async () => {
      const updateStatusPayload = {
        status: 'approved',
      };

      const { body } = await request(context.mentorApp.getHttpServer())
        .patch(`/appointments/${createdAppointmentId}/status`)
        .send(updateStatusPayload)
        .expect(200);

      expect(body.status).toBe('approved');
    });

    it('should return 404 (Not Found) for non-existent appointment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.mentorApp.getHttpServer())
        .patch(`/appointments/${nonExistentId}/status`)
        .send({ status: 'approved' })
        .expect(404);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/appointments/${createdAppointmentId}/status`)
        .send({ status: 'approved' })
        .expect(401);
    });
  });

  // --- DELETE /appointments/:id ---
  describe('DELETE /appointments/:id', () => {
    it('should allow admin to soft delete appointment (200)', async () => {
      const { body: appointment } = await request(
        context.studentApp.getHttpServer(),
      )
        .post('/appointments')
        .send({
          title: 'Test Appointment for Delete',
          description: 'This is a test appointment',
          startAt: '2026-10-05T10:00:00Z',
          endAt: '2026-10-05T11:00:00Z',
          courseOfferingId: testCourseOfferingId,
          studentId: testStudentId,
          mentorId: testMentorId,
        })
        .expect(201);

      const { body } = await request(context.adminApp.getHttpServer())
        .delete(`/appointments/${appointment.id}`)
        .expect(200);

      expect(body).toHaveProperty('message');
    });

    it('should return 404 (Not Found) for non-existent appointment ID', async () => {
      const nonExistentId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.adminApp.getHttpServer())
        .delete(`/appointments/${nonExistentId}`)
        .expect(404);
    });

    it('should return 403 (Forbidden) when student tries to delete', async () => {
      const { body: appointment } = await request(
        context.studentApp.getHttpServer(),
      )
        .post('/appointments')
        .send({
          title: 'Test Appointment for Delete Forbidden',
          description: 'This is a test appointment',
          startAt: '2026-10-06T10:00:00Z',
          endAt: '2026-10-06T11:00:00Z',
          courseOfferingId: testCourseOfferingId,
          studentId: testStudentId,
          mentorId: testMentorId,
        })
        .expect(201);

      await request(context.studentApp.getHttpServer())
        .delete(`/appointments/${appointment.id}`)
        .expect(403);
    });

    it('should return 403 (Forbidden) when mentor tries to delete', async () => {
      const { body: appointment } = await request(
        context.studentApp.getHttpServer(),
      )
        .post('/appointments')
        .send({
          title: 'Test Appointment for Delete Forbidden Mentor',
          description: 'This is a test appointment',
          startAt: '2026-10-07T10:00:00Z',
          endAt: '2026-10-07T11:00:00Z',
          courseOfferingId: testCourseOfferingId,
          studentId: testStudentId,
          mentorId: testMentorId,
        })
        .expect(201);

      await request(context.mentorApp.getHttpServer())
        .delete(`/appointments/${appointment.id}`)
        .expect(403);
    });

    it('should return 401 (Unauthorized) when not authenticated', async () => {
      const testId = '1f7fcb6a-9b52-4f7a-b1f6-1cfb5d1d1a11';
      await request(context.unauthApp.getHttpServer())
        .delete(`/appointments/${testId}`)
        .expect(401);
    });
  });
});
