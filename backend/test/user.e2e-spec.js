"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mock_users_1 = require("./utils/mock-users");
const test_app_service_1 = require("./utils/test-app.service");
describe('UsersController (Integration)', () => {
    const testService = new test_app_service_1.TestAppService();
    let app;
    let prisma;
    let createdUserId;
    let createdStudentId;
    let createdStaffId;
    const validUserPayload = {
        role: 'student',
        user: {
            firstName: 'Dog',
            lastName: 'Junior',
        },
        credentials: {
            email: 'dog.junior@example.com',
            password: 'SecurePass123!',
        },
        userDetails: {
            dateJoined: new Date().toISOString(),
            dob: '2000-01-15T00:00:00.000Z',
            gender: 'male',
        },
    };
    const validStudentPayload = {
        specificDetails: {
            studentNumber: 12345,
            studentType: 'new',
            admissionDate: new Date().toISOString(),
            otherDetails: {},
        },
        user: {
            firstName: 'Jane',
            lastName: 'Doe',
        },
        credentials: {
            email: 'jane.doe@example.com',
            password: 'SecurePass123!',
        },
        userDetails: {
            dateJoined: new Date().toISOString(),
            dob: '2000-01-15T00:00:00.000Z',
            gender: 'female',
        },
    };
    const validStaffPayload = {
        role: 'mentor',
        specificDetails: {
            employeeNumber: 54321,
            department: 'IT',
            position: 'Head Mentor',
            otherDetails: {},
        },
        user: {
            firstName: 'John',
            lastName: 'Smith',
        },
        credentials: {
            email: 'john.smith@example.com',
            password: 'SecurePass123!',
        },
        userDetails: {
            dateJoined: new Date().toISOString(),
            dob: '1985-05-20T00:00:00.000Z',
            gender: 'male',
        },
    };
    beforeAll(async () => {
        const { prisma: p } = await testService.start();
        prisma = p;
    }, 800000);
    afterAll(async () => {
        await testService.close();
    });
    describe('POST /users', () => {
        it('should create a new user with valid data when authenticated as admin (201)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(validUserPayload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.firstName).toBe(validUserPayload.user.firstName);
            expect(response.body.role).toBe(validUserPayload.role);
            createdUserId = response.body.id;
        });
        it('should return 400 when required fields are missing', async () => {
            const invalidPayload = {
                ...validUserPayload,
                user: { firstName: 'John' },
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 400 when an invalid role is provided', async () => {
            const invalidPayload = {
                ...validUserPayload,
                role: 'invalid_role',
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .post('/users')
                .send(validUserPayload)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .post('/users')
                .send(validUserPayload)
                .expect(403);
        });
    });
    describe('GET /users', () => {
        it('should retrieve a paginated list of users when authenticated as admin (200)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users')
                .expect(200);
            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('users');
            expect(Array.isArray(response.body.users)).toBe(true);
        });
        it('should filter users by role query parameter', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users?role=student')
                .expect(200);
            expect(response.body.users.every((user) => user.role === 'student')).toBe(true);
        });
        it('should filter users by search query parameter', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users?search=Dog')
                .expect(200);
            expect(response.body.users.every((user) => user.firstName.includes('Dog'))).toBe(true);
        });
        it('should paginate results correctly with page query parameter', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users?page=1')
                .expect(200);
            expect(response.body.meta.currentPage).toBe(1);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer()).get('/users').expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer()).get('/users').expect(403);
        });
    });
    describe('GET /users/me', () => {
        it('should retrieve the full profile of the authenticated admin (200)', async () => {
            const { app: adminApp } = await testService.createTestApp(mock_users_1.mockUsers.admin);
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users/me')
                .expect(200);
            expect(response.body.role).toBe('admin');
            expect(response.body).toHaveProperty('staffDetails');
        });
        it('should retrieve the full profile of the authenticated mentor (200)', async () => {
            const { app: mentorApp } = await testService.createTestApp(mock_users_1.mockUsers.mentor);
            app = mentorApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users/me')
                .expect(200);
            expect(response.body.role).toBe('mentor');
            expect(response.body).toHaveProperty('staffDetails');
        });
        it('should retrieve the full profile of the authenticated student (200)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            app = studentApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users/me')
                .expect(200);
            expect(response.body.role).toBe('student');
            expect(response.body).toHaveProperty('studentDetails');
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer()).get('/users/me').expect(401);
        });
    });
    describe('PUT /users/me', () => {
        const updatedUserPayload = {
            user: {
                firstName: 'Updated',
            },
        };
        it('should update the personal details of the authenticated user (200)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .put('/users/me')
                .send(updatedUserPayload)
                .expect(200);
            expect(response.body.firstName).toBe(updatedUserPayload.user.firstName);
        });
        it('should return 400 when invalid data is provided', async () => {
            const invalidPayload = {
                user: {
                    firstName: 123,
                },
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .put('/users/me')
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .put('/users/me')
                .send(updatedUserPayload)
                .expect(401);
        });
    });
    describe('GET /users/{id}', () => {
        it('should retrieve a specific user by ID when authenticated as admin (200)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/users/${createdUserId}`)
                .expect(200);
            expect(response.body.id).toBe(createdUserId);
        });
        it('should return 400 for an invalid ID format', async () => {
            await (0, supertest_1.default)(app.getHttpServer()).get('/users/invalid-id').expect(400);
        });
        it('should return 404 for a non-existent user ID', async () => {
            const nonExistentId = '11111111-1111-1111-1111-111111111111';
            await (0, supertest_1.default)(app.getHttpServer())
                .get(`/users/${nonExistentId}`)
                .expect(404);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .get(`/users/${createdUserId}`)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .get(`/users/${createdUserId}`)
                .expect(403);
        });
    });
    describe('PATCH /users/{id}/status', () => {
        it('should successfully disable a user when authenticated as admin (200)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .patch(`/users/${createdUserId}/status`)
                .send({ status: 'disabled' })
                .expect(200);
            expect(response.body).toHaveProperty('message', 'User disabled successfully.');
        });
        it('should successfully enable a user when authenticated as admin (200)', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .patch(`/users/${createdUserId}/status`)
                .send({ status: 'active' })
                .expect(200);
            expect(response.body).toHaveProperty('message', 'User enabled successfully.');
        });
        it('should return 404 for a non-existent user ID', async () => {
            const nonExistentId = '11111111-1111-1111-1111-111111111111';
            await (0, supertest_1.default)(app.getHttpServer())
                .patch(`/users/${nonExistentId}/status`)
                .send({ status: 'disabled' })
                .expect(404);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .patch(`/users/${createdUserId}/status`)
                .send({ status: 'disabled' })
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .patch(`/users/${createdUserId}/status`)
                .send({ status: 'disabled' })
                .expect(403);
        });
    });
    describe('DELETE /users/{id}', () => {
        it('should soft-delete a user by default when authenticated as admin (200)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/users/${createdUserId}`)
                .expect(200);
            expect(response.body).toHaveProperty('message', 'User has been soft deleted');
            const user = await prisma.user.findUnique({
                where: { id: createdUserId },
            });
            expect(user.deletedAt).not.toBeNull();
        });
        it('should permanently delete a user with directDelete=true query parameter when authenticated as admin (200)', async () => {
            // Re-create user for this test
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const createUserResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(validUserPayload)
                .expect(201);
            const tempUserId = createUserResponse.body.id;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/users/${tempUserId}?directDelete=true`)
                .expect(200);
            expect(response.body).toHaveProperty('message', 'User has been permanently deleted');
            const user = await prisma.user.findUnique({ where: { id: tempUserId } });
            expect(user).toBeNull();
        });
        it('should return 404 for a non-existent user ID', async () => {
            const nonExistentId = '11111111-1111-1111-1111-111111111111';
            await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/users/${nonExistentId}`)
                .expect(404);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .delete(`/users/${createdUserId}`)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .delete(`/users/${createdUserId}`)
                .expect(403);
        });
    });
    describe('POST /users/student', () => {
        it('should create a new student user when authenticated as admin (201)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/users/student')
                .send(validStudentPayload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.role).toBe('student');
            createdStudentId = response.body.id;
        });
        it('should return 400 when required fields are missing', async () => {
            const invalidPayload = {
                ...validStudentPayload,
                user: { firstName: 'Jane' },
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/users/student')
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .post('/users/student')
                .send(validStudentPayload)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .post('/users/student')
                .send(validStudentPayload)
                .expect(403);
        });
    });
    describe('POST /users/staff', () => {
        it('should create a new staff user (mentor or admin) when authenticated as admin (201)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/users/staff')
                .send(validStaffPayload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(['mentor', 'admin']).toContain(response.body.role);
            createdStaffId = response.body.id;
        });
        it('should return 400 when required fields are missing', async () => {
            const invalidPayload = {
                ...validStaffPayload,
                user: { firstName: 'John' },
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/users/staff')
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .post('/users/staff')
                .send(validStaffPayload)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .post('/users/staff')
                .send(validStaffPayload)
                .expect(403);
        });
    });
    describe('POST /users/invite', () => {
        const invitePayload = {
            firstName: 'Guest',
            lastName: 'User',
            role: 'student',
            email: 'guest.user@example.com',
        };
        it('should invite a new user with a valid email and role when authenticated as admin (201)', async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/users/invite')
                .send(invitePayload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.firstName).toBe(invitePayload.firstName);
        });
        it('should return 400 when required fields are missing', async () => {
            const invalidPayload = {
                ...invitePayload,
                firstName: undefined,
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/users/invite')
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .post('/users/invite')
                .send(invitePayload)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .post('/users/invite')
                .send(invitePayload)
                .expect(403);
        });
    });
    describe('PUT /users/{id}/student', () => {
        const updateStudentPayload = {
            specificDetails: {
                studentType: 'regular',
            },
        };
        it("should update a student's specific details when authenticated as admin (200)", async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .put(`/users/${createdStudentId}/student`)
                .send(updateStudentPayload)
                .expect(200);
            expect(response.body).toHaveProperty('id', createdStudentId);
        });
        it('should return 400 when invalid data is provided', async () => {
            const invalidPayload = {
                specificDetails: {
                    studentType: 'invalid_type',
                },
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .put(`/users/${createdStudentId}/student`)
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 404 for a non-existent student ID', async () => {
            const nonExistentId = '11111111-1111-1111-1111-111111111111';
            await (0, supertest_1.default)(app.getHttpServer())
                .put(`/users/${nonExistentId}/student`)
                .send(updateStudentPayload)
                .expect(404);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .put(`/users/${createdStudentId}/student`)
                .send(updateStudentPayload)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .put(`/users/${createdStudentId}/student`)
                .send(updateStudentPayload)
                .expect(403);
        });
    });
    describe('PUT /users/{id}/staff', () => {
        const updateStaffPayload = {
            specificDetails: {
                position: 'Senior Mentor',
            },
        };
        it("should update a staff member's specific details when authenticated as admin (200)", async () => {
            const { app: adminApp } = await testService.createTestApp();
            app = adminApp;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .put(`/users/${createdStaffId}/staff`)
                .send(updateStaffPayload)
                .expect(200);
            expect(response.body).toHaveProperty('id', createdStaffId);
        });
        it('should return 400 when invalid data is provided', async () => {
            const invalidPayload = {
                specificDetails: {
                    employeeNumber: 'invalid_number',
                },
            };
            await (0, supertest_1.default)(app.getHttpServer())
                .put(`/users/${createdStaffId}/staff`)
                .send(invalidPayload)
                .expect(400);
        });
        it('should return 404 for a non-existent staff ID', async () => {
            const nonExistentId = '11111111-1111-1111-1111-111111111111';
            await (0, supertest_1.default)(app.getHttpServer())
                .put(`/users/${nonExistentId}/staff`)
                .send(updateStaffPayload)
                .expect(404);
        });
        it('should return 401 when not authenticated', async () => {
            const { app: unauthApp } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(unauthApp.getHttpServer())
                .put(`/users/${createdStaffId}/staff`)
                .send(updateStaffPayload)
                .expect(401);
        });
        it('should return 403 when authenticated as a student (insufficient permissions)', async () => {
            const { app: studentApp } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(studentApp.getHttpServer())
                .put(`/users/${createdStaffId}/staff`)
                .send(updateStaffPayload)
                .expect(403);
        });
    });
});
