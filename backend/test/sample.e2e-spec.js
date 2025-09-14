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
    let createdUserId;
    beforeAll(async () => {
        await testService.start();
    }, 800000);
    afterAll(async () => {
        await testService.close();
    });
    describe('POST /users', () => {
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
        it('should create a new user when authenticated as admin', async () => {
            const { app } = await testService.createTestApp();
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(validUserPayload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.firstName).toBe(validUserPayload.user.firstName);
            expect(response.body.lastName).toBe(validUserPayload.user.lastName);
            expect(response.body.role).toBe(validUserPayload.role);
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');
            // Store the created user ID for cleanup
            createdUserId = response.body.id;
        });
        it('should return 401 when not authenticated', async () => {
            const { app } = await testService.createTestApp(mock_users_1.mockUsers.unauth);
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(validUserPayload)
                .expect(401);
        });
        it('should return 403 when authenticated as student (insufficient permissions)', async () => {
            const { app } = await testService.createTestApp(mock_users_1.mockUsers.student);
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(validUserPayload)
                .expect(403);
        });
        it('should return 400 when required fields are missing', async () => {
            const { app } = await testService.createTestApp();
            const invalidPayload = {
                ...validUserPayload,
                user: {
                    firstName: 'John',
                    // Missing lastName
                },
            };
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/users')
                .send(invalidPayload)
                .expect(400);
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('error', 'Bad Request');
        });
    });
});
