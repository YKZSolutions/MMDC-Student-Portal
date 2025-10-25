import request from 'supertest';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TestContext,
} from '../../test-setup';
import { createModule, createModuleSetup } from '../../factories/lms.factory';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-argument,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment,
*/
describe('LmsController (Integration)', () => {
  let context: TestContext;
  let module: { id: string };
  let existingModule: { id: string; title: string };
  let moduleToSoftDelete: { id: string; title: string };
  let moduleToHardDelete: { id: string; title: string };
  let publishedModule: { id: string; title: string; publishedAt: Date };
  let todoModule: { id: string };

  beforeAll(async () => {
    context = await setupTestEnvironment();

    existingModule = await context.prismaClient.module.create({
      data: createModule(),
    });

    moduleToSoftDelete = await context.prismaClient.module.create({
      data: createModule(),
    });

    moduleToHardDelete = await context.prismaClient.module.create({
      data: createModule(),
    });

    publishedModule = await context.prismaClient.module.create({
      data: createModule({ publishedAt: new Date() }),
    });

    const treeData = createModuleSetup({ type: 'tree' });
    const student = context.testService.getMockUser('student');

    const period = await context.prismaClient.enrollmentPeriod.create({
      data: treeData.enrollmentPeriod,
    });
    const course = await context.prismaClient.course.create({
      data: treeData.course,
    });
    const offering = await context.prismaClient.courseOffering.create({
      data: treeData.courseOffering(course.id, period.id),
    });
    const section = await context.prismaClient.courseSection.create({
      data: treeData.courseSection(offering.id),
    });

    await context.prismaClient.courseEnrollment.create({
      data: treeData.courseEnrollment(
        offering.id,
        section.id,
        student.user_metadata.user_id,
      ),
    });

    module = await context.prismaClient.module.create({
      data: treeData.module(offering.id),
    });

    const { rootSection, subSection } = treeData.moduleSections(module.id);
    const createdRoot = await context.prismaClient.moduleSection.create({
      data: rootSection,
    });
    const createdSub = await context.prismaClient.moduleSection.create({
      data: { ...subSection, parentSectionId: createdRoot.id },
    });

    await context.prismaClient.moduleContent.createMany({
      data: treeData.moduleContents(createdRoot.id, createdSub.id),
    });

    // 🔹 Create a full TODO-type module
    const todoData = createModuleSetup({ type: 'todo' });

    const todoPeriod = await context.prismaClient.enrollmentPeriod.create({
      data: todoData.enrollmentPeriod,
    });
    const todoCourse = await context.prismaClient.course.create({
      data: todoData.course,
    });
    const todoOffering = await context.prismaClient.courseOffering.create({
      data: todoData.courseOffering(todoCourse.id, todoPeriod.id),
    });
    const todoSection = await context.prismaClient.courseSection.create({
      data: todoData.courseSection(todoOffering.id),
    });

    await context.prismaClient.courseEnrollment.create({
      data: todoData.courseEnrollment(
        todoOffering.id,
        todoSection.id,
        student.user_metadata.user_id,
      ),
    });

    todoModule = await context.prismaClient.module.create({
      data: todoData.module(todoOffering.id),
    });

    const { rootSection: todoSectionRoot } = todoData.moduleSections(
      todoModule.id,
    );
    const createdTodoSection = await context.prismaClient.moduleSection.create({
      data: todoSectionRoot,
    });

    const [todoContent] = todoData.moduleContents(createdTodoSection.id);
    const createdTodoContent = await context.prismaClient.moduleContent.create({
      data: todoContent,
    });

    await context.prismaClient.assignment.create({
      data: todoData.assignment(createdTodoContent.id),
    });
  });

  afterAll(async () => {
    await teardownTestEnvironment(context);
  });

  // ------------------------------------------------------
  // GET /modules/student
  // ------------------------------------------------------
  describe('GET /modules/student', () => {
    it('should return a list of modules the student is enrolled in (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/modules/student')
        .expect(200);

      expect(body).toHaveProperty('modules');
      expect(body.meta).toHaveProperty('pageCount');
      expect(body.meta).toHaveProperty('totalCount');
      expect(Array.isArray(body.modules)).toBe(true);
    });

    it('should return 400 (Bad Request) for invalid query params', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/modules/student?page=abc')
        .expect(400);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/modules/student')
        .expect(401);
    });

    it('should return 403 (Forbidden) if admin tries to access', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/modules/student')
        .expect(403);
    });

    it('should return 403 (Forbidden) if mentor tries to access', async () => {
      await request(context.mentorApp.getHttpServer())
        .get('/modules/student')
        .expect(403);
    });
  });

  // ------------------------------------------------------
  // GET /modules/mentor
  // ------------------------------------------------------
  describe('GET /modules/mentor', () => {
    it('should return a list of modules for a mentor (200)', async () => {
      const { body } = await request(context.mentorApp.getHttpServer())
        .get('/modules/mentor')
        .expect(200);

      expect(body).toHaveProperty('modules');
      expect(body.meta).toHaveProperty('pageCount');
      expect(body.meta).toHaveProperty('totalCount');
    });

    it('should return 400 (Bad Request) for invalid query params', async () => {
      await request(context.mentorApp.getHttpServer())
        .get('/modules/mentor?page=-1')
        .expect(400);
    });

    it('should return 401 (Unauthorized) if no token is provided', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/modules/mentor')
        .expect(401);
    });

    it('should return 403 (Forbidden) if student tries to access', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/modules/mentor')
        .expect(403);
    });
  });

  // ------------------------------------------------------
  // GET /modules/admin
  // ------------------------------------------------------
  describe('GET /modules/admin', () => {
    it('should return a list of modules for an admin (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get('/modules/admin')
        .expect(200);

      expect(body).toHaveProperty('modules');
      expect(body.meta).toHaveProperty('totalCount');
    });

    it('should return 400 for invalid query params', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/modules/admin?page=a')
        .expect(400);
    });

    it('should return 403 if student or mentor tries to access', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/modules/admin')
        .expect(403);

      await request(context.mentorApp.getHttpServer())
        .get('/modules/admin')
        .expect(403);
    });
  });

  // ------------------------------------------------------
  // GET /modules/:id
  // ------------------------------------------------------
  describe('GET /modules/:id', () => {
    it('should return module details (200) for authorized user', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/modules/${existingModule.id}`)
        .expect(200);

      expect(body).toHaveProperty('id', existingModule.id);
      expect(body).toHaveProperty('title', 'Test Module');
    });

    it('should return 404 if module not found', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/modules/ffffffff-ffff-ffff-ffff-ffffffffffff')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/modules/123')
        .expect(400);
    });

    it('should return 401 when unauthenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/modules/${existingModule.id}`)
        .expect(401);
    });
  });

  // ------------------------------------------------------
  // PATCH /modules/:id
  // ------------------------------------------------------
  describe('PATCH /modules/:id', () => {
    const updateDto = { title: 'Updated Module Title' };

    it('should update a module (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .patch(`/modules/${existingModule.id}`)
        .send(updateDto)
        .expect(200);

      expect(body).toHaveProperty('id', existingModule.id);
      expect(body).toHaveProperty('title', updateDto.title);

      // Double-check in DB
      const updated = await context.prismaClient.module.findUnique({
        where: { id: existingModule.id },
      });
      expect(updated?.title).toBe(updateDto.title);
    });

    it('should return 400 if invalid body provided', async () => {
      await request(context.adminApp.getHttpServer())
        .patch(`/modules/${existingModule.id}`)
        .send({ invalidField: true })
        .expect(400);
    });

    it('should return 403 if non-admin tries to update', async () => {
      await request(context.studentApp.getHttpServer())
        .patch(`/modules/${existingModule.id}`)
        .send(updateDto)
        .expect(403);
    });

    it('should return 401 if unauthenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .patch(`/modules/${existingModule.id}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 404 if module does not exist', async () => {
      await request(context.adminApp.getHttpServer())
        .patch('/modules/ffffffff-ffff-ffff-ffff-ffffffffffff')
        .send(updateDto)
        .expect(404);
    });
  });

  // ------------------------------------------------------
  // DELETE /modules/:id
  // ------------------------------------------------------
  describe('DELETE /modules/:id', () => {
    it('should perform a soft delete (200) when no directDelete param is provided', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .delete(`/modules/${moduleToSoftDelete.id}`)
        .expect(200);

      expect(body).toHaveProperty('message');
      expect(body.message).toContain('marked as deleted');

      // Verify softly delete: record still exists, but deletedAt is set
      const deleted = await context.prismaClient.module.findUnique({
        where: { id: moduleToSoftDelete.id },
      });
      expect(deleted).not.toBeNull();
      expect(deleted?.deletedAt).not.toBeNull();
    });

    it('should perform a hard delete (200) when directDelete=true', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .delete(`/modules/${moduleToHardDelete.id}`)
        .query({ directDelete: true })
        .expect(200);

      expect(body).toHaveProperty('message');
      expect(body.message).toContain('permanently deleted');

      // Verify hard delete: record should be gone from DB
      const deleted = await context.prismaClient.module.findUnique({
        where: { id: moduleToHardDelete.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 when module not found', async () => {
      await request(context.adminApp.getHttpServer())
        .delete('/modules/ffffffff-ffff-ffff-ffff-ffffffffffff')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(context.adminApp.getHttpServer())
        .delete('/modules/invalid-id')
        .expect(400);
    });

    it('should return 403 if non-admin tries', async () => {
      const module = await context.prismaClient.module.create({
        data: { title: 'Forbidden Delete Module' },
      });

      await request(context.studentApp.getHttpServer())
        .delete(`/modules/${module.id}`)
        .expect(403);
    });

    it('should return 401 if unauthenticated', async () => {
      const module = await context.prismaClient.module.create({
        data: { title: 'Unauthenticated Delete Module' },
      });

      await request(context.unauthApp.getHttpServer())
        .delete(`/modules/${module.id}`)
        .expect(401);
    });
  });

  // ------------------------------------------------------
  // POST /modules/:id/publish
  // ------------------------------------------------------
  describe('POST /modules/:id/publish', () => {
    it('should publish a module (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post(`/modules/${existingModule.id}/publish`)
        .expect(201);

      expect(body).toHaveProperty('message');
      expect(typeof body.message).toBe('string');
      expect(body.message).toContain('published');

      // Verify in DB — publishedAt should be set
      const published = await context.prismaClient.module.findUnique({
        where: { id: existingModule.id },
      });

      expect(published).not.toBeNull();
      expect(published?.publishedAt).not.toBeNull();
      expect(published?.unpublishedAt).toBeNull();
    });

    it('should return 404 if module not found', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/modules/ffffffff-ffff-ffff-ffff-ffffffffffff/publish')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/modules/not-a-uuid/publish')
        .expect(400);
    });

    it('should return 403 for non-admin users', async () => {
      await request(context.studentApp.getHttpServer())
        .post(`/modules/${existingModule.id}/publish`)
        .expect(403);
    });

    it('should return 401 for unauthenticated users', async () => {
      await request(context.unauthApp.getHttpServer())
        .post(`/modules/${existingModule.id}/publish`)
        .expect(401);
    });
  });

  // ------------------------------------------------------
  // POST /modules/:id/unpublish
  // ------------------------------------------------------
  describe('POST /modules/:id/unpublish', () => {
    it('should unpublish a module (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .post(`/modules/${publishedModule.id}/unpublish`)
        .expect(201);

      expect(body).toHaveProperty('message');
      expect(typeof body.message).toBe('string');
      expect(body.message).toContain('unpublish');

      // Verify DB state — publishedAt cleared, unpublishedAt set
      const updated = await context.prismaClient.module.findUnique({
        where: { id: publishedModule.id },
      });
      expect(updated).not.toBeNull();
      expect(updated?.publishedAt).toBeNull();
      expect(updated?.unpublishedAt).not.toBeNull();
    });

    it('should return 404 if module not found', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/modules/ffffffff-ffff-ffff-ffff-ffffffffffff/unpublish')
        .expect(404);
    });

    it('should return 400 if invalid UUID', async () => {
      await request(context.adminApp.getHttpServer())
        .post('/modules/not-a-uuid/unpublish')
        .expect(400);
    });

    it('should return 403 if non-admin tries', async () => {
      await request(context.mentorApp.getHttpServer())
        .post(`/modules/${publishedModule.id}/unpublish`)
        .expect(403);
    });

    it('should return 401 if unauthenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .post(`/modules/${publishedModule.id}/unpublish`)
        .expect(401);
    });
  });

  // ------------------------------------------------------
  // GET /modules/:id/tree
  // ------------------------------------------------------
  describe('GET /modules/:id/tree', () => {
    it('should return a full module tree (200)', async () => {
      const { body } = await request(context.adminApp.getHttpServer())
        .get(`/modules/${module.id}/tree`)
        .expect(200);

      expect(body).toHaveProperty('id', module.id);
      expect(body).toHaveProperty('title', 'Module Tree Test');
      expect(Array.isArray(body.moduleSections)).toBe(true);

      const rootSection = body.moduleSections.find(
        (s: any) => s.title === 'Root Section',
      );
      expect(rootSection).toBeDefined();
      expect(Array.isArray(rootSection.moduleContents)).toBe(true);
      expect(rootSection.moduleContents.length).toBeGreaterThan(0);

      const subSection = rootSection.subsections?.[0];
      expect(subSection).toHaveProperty('title', 'Subsection A');
      expect(Array.isArray(subSection.moduleContents)).toBe(true);
    });

    it('should return 404 if not found', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/modules/ffffffff-ffff-ffff-ffff-ffffffffffff/tree')
        .expect(404);
    });

    it('should return 400 if invalid UUID', async () => {
      await request(context.adminApp.getHttpServer())
        .get('/modules/123/tree')
        .expect(400);
    });

    it('should return 401 if unauthenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/modules/${module.id}/tree`)
        .expect(401);
    });
  });

  // ------------------------------------------------------
  // GET /modules/todo
  // ------------------------------------------------------
  describe('GET /modules/todo', () => {
    it('should return todos for a student (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/modules/todo')
        .query({
          dueDateFrom: new Date().toISOString(),
          dueDateTo: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .expect(200);

      expect(body).toHaveProperty('todos');
      expect(Array.isArray(body.todos)).toBe(true);
    });

    it('should return 403 if mentor or admin tries', async () => {
      await request(context.mentorApp.getHttpServer())
        .get('/modules/todo')
        .query({
          dueDateFrom: new Date().toISOString(),
          dueDateTo: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .expect(403);

      await request(context.adminApp.getHttpServer())
        .get('/modules/todo')
        .query({
          dueDateFrom: new Date().toISOString(),
          dueDateTo: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .expect(403);
    });
  });

  // ------------------------------------------------------
  // GET /modules/:id/progress/overview
  // ------------------------------------------------------
  describe('GET /modules/:id/progress/overview', () => {
    it('should return module progress overview (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get(`/modules/${module.id}/progress/overview`)
        .expect(200);

      expect(body).toHaveProperty('moduleId', module.id);
      expect(body).toHaveProperty('moduleTitle');
      expect(body).toHaveProperty('progressPercentage');
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('totalContentItems');
    });

    it('should return 400 for invalid query params', async () => {
      await request(context.studentApp.getHttpServer())
        .get(`/modules/${module.id}/progress/overview`)
        .query({
          moduleId: 'invalid id',
        })
        .expect(400);
    });
  });

  // ------------------------------------------------------
  // GET /modules/:id/progress/detail
  // ------------------------------------------------------
  describe('GET /modules/:id/progress/detail', () => {
    it('should return module progress detail (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get(`/modules/${module.id}/progress/detail`)
        .expect(200);

      // The returned structure should contain module progress data
      expect(body).toHaveProperty('moduleId', module.id);
      expect(body).toHaveProperty('sections');
      expect(Array.isArray(body.sections)).toBe(true);
      expect(body.overallProgress).toHaveProperty('progressPercentage');
      expect(body.overallProgress).toHaveProperty('completedContentItems');
      expect(body.overallProgress).toHaveProperty('totalContentItems');
    });

    it('should return 404 if module not found', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/modules/ffffffff-ffff-ffff-ffff-ffffffffffff/progress/detail')
        .expect(404);
    });

    it('should return 400 if invalid UUID', async () => {
      await request(context.studentApp.getHttpServer())
        .get('/modules/invalid-id/progress/detail')
        .expect(400);
    });

    it('should return 401 if unauthenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get(`/modules/${module.id}/progress/detail`)
        .expect(401);
    });

    it('should return 403 if unauthorized role', async () => {
      await request(context.adminApp.getHttpServer())
        .get(`/modules/${module.id}/progress/detail`)
        .expect(403);
    });
  });

  // ------------------------------------------------------
  // GET /modules/dashboard
  // ------------------------------------------------------
  describe('GET /modules/dashboard', () => {
    it('should return dashboard progress summary (200)', async () => {
      const { body } = await request(context.studentApp.getHttpServer())
        .get('/modules/dashboard')
        .expect(200);

      expect(body).toHaveProperty('overallCompletion');
    });

    it('should return 401 if unauthenticated', async () => {
      await request(context.unauthApp.getHttpServer())
        .get('/modules/dashboard')
        .expect(401);
    });
  });
});
