import { UserMetadata } from '../../src/common/interfaces/auth.user-metadata';

type MockUserType = 'admin' | 'mentor' | 'student' | 'unauth';

/**
 * Represents a mock user object for testing authentication flows.
 *
 * @property {string} id - UUID of the mock user. Used to identify the user in tests.
 * @property {UserMetadata} user_metadata - Metadata describing the user's role, status, and user_id.
 *
 * @example
 * {
 *   id: "6803b564-2b6f-4f02-9dbe-0546663c17fe",
 *   user_metadata: {
 *     role: "student",
 *     status: "active",
 *     user_id: "f510d882-a1ec-4c0a-a010-cfff02b1e5be"
 *   }
 * }
 */
export type MockUser = {
  id: string;
  user_metadata: UserMetadata;
} | null;

type MockUsers = Record<MockUserType, MockUser>;

/**
 * Mapping of mock user types to their corresponding user objects.
 *
 * This is primarily used in integration tests to simulate authentication
 * scenarios for different user roles without relying on a real auth provider.
 *
 * Keys:
 * - "admin"   → Active admin user
 * - "mentor"  → Active mentor user
 * - "student" → Active student user
 * - "unauth"  → Represents an unauthenticated user (null)
 *
 * @example
 * mockUsers.admin?.user_metadata.role // "admin"
 * mockUsers.unauth // null
 */
export const mockUsers: MockUsers = {
  admin: {
    id: '0ad18824-442c-4175-a01c-b6edafabc3af',
    user_metadata: {
      role: 'admin',
      status: 'active',
      user_id: ' d4e026e5-8455-470f-a846-a89455b2fa38 ',
    },
  },
  mentor: {
    id: '9af54937-2830-4e6e-9ed3-dbca7a3a097e',
    user_metadata: {
      role: 'mentor',
      status: 'active',
      user_id: '87125245-9637-4dab-997d-c9eaa9e72d51',
    },
  },
  student: {
    id: '6803b564-2b6f-4f02-9dbe-0546663c17fe',
    user_metadata: {
      role: 'student',
      status: 'active',
      user_id: 'f510d882-a1ec-4c0a-a010-cfff02b1e5be',
    },
  },
  unauth: null,
};
