/**
 * Simple User Factory Functions
 *
 * Provides readable, easy-to-use functions for creating test data in user integration tests.
 * Focuses on simplicity and immediate clarity over complex abstractions.
 *
 * Usage:
 *   const user = createUser() // Creates a valid user with unique data
 *   const student = createStudent() // Creates a valid student with unique data
 *   const invalid = createUserWithMissingFields() // Creates invalid user for validation testing
 */

import { Role, StudentType } from '@prisma/client';

/**
 * Generate unique test data to avoid conflicts between tests
 */
const generateUniqueData = () => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);

  return {
    email: `test-${timestamp}-${randomId}@example.com`,
    firstName: `Test${randomId}`,
    lastName: `User${timestamp}`,
    studentNumber: `STU${timestamp}${randomId}`,
    employeeNumber: Math.floor(Math.random() * 90000) + 10000,
  };
};

/**
 * Create a valid user payload with unique data
 * Default role is 'student', override if needed
 */
export const createUser = (overrides: {
  role?: Role;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  gender?: string;
} = {}) => {
  const unique = generateUniqueData();

  return {
    role: overrides.role || 'student',
    user: {
      firstName: overrides.firstName || unique.firstName,
      lastName: overrides.lastName || unique.lastName,
    },
    credentials: {
      email: overrides.email || unique.email,
      password: overrides.password || 'SecurePass123!',
    },
    userDetails: {
      dateJoined: new Date(),
      dob: new Date('2000-01-15T00:00:00.000Z'),
      gender: overrides.gender || 'male',
    },
  };
};

/**
 * Create a valid student payload with unique data
 */
export const createStudent = (overrides: {
  studentType?: StudentType;
  firstName?: string;
  lastName?: string;
  email?: string;
  studentNumber?: string;
} = {}) => {
  const unique = generateUniqueData();

  return {
    specificDetails: {
      studentNumber: overrides.studentNumber || unique.studentNumber,
      studentType: overrides.studentType || 'new',
      admissionDate: new Date(),
      otherDetails: {},
    },
    user: {
      firstName: overrides.firstName || unique.firstName,
      lastName: overrides.lastName || unique.lastName,
    },
    credentials: {
      email: overrides.email || unique.email,
      password: 'SecurePass123!',
    },
    userDetails: {
      dateJoined: new Date(),
      dob: new Date('2000-01-15T00:00:00.000Z'),
      gender: 'female',
    },
  };
};

/**
 * Create a valid staff payload (mentor or admin) with unique data
 */
export const createStaff = (overrides: {
  role?: 'mentor' | 'admin';
  department?: string;
  position?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
} = {}) => {
  const unique = generateUniqueData();

  return {
    role: overrides.role || 'mentor',
    specificDetails: {
      employeeNumber: unique.employeeNumber,
      department: overrides.department || 'IT',
      position: overrides.position || 'Head Mentor',
      otherDetails: {},
    },
    user: {
      firstName: overrides.firstName || unique.firstName,
      lastName: overrides.lastName || unique.lastName,
    },
    credentials: {
      email: overrides.email || unique.email,
      password: 'SecurePass123!',
    },
    userDetails: {
      dateJoined: new Date(),
      dob: new Date('1985-05-20T00:00:00.000Z'),
      gender: 'male',
    },
  };
};

/**
 * Create an invite payload with unique data
 */
export const createInvite = (overrides: {
  role?: Role;
  firstName?: string;
  lastName?: string;
  email?: string;
} = {}) => {
  const unique = generateUniqueData();

  return {
    firstName: overrides.firstName || unique.firstName,
    lastName: overrides.lastName || unique.lastName,
    role: overrides.role || 'student',
    email: overrides.email || unique.email,
  };
};

/**
 * Create update payloads for different scenarios
 */
export const createUpdate = {
  user: (overrides: { firstName?: string; lastName?: string } = {}) => ({
    user: {
      firstName: overrides.firstName || 'Updated',
      lastName: overrides.lastName || 'Name',
    },
  }),

  student: (overrides: { studentType?: StudentType } = {}) => ({
    specificDetails: {
      studentType: overrides.studentType || 'regular',
    },
  }),

  staff: (overrides: { position?: string; department?: string } = {}) => ({
    specificDetails: {
      position: overrides.position || 'Senior Mentor',
      department: overrides.department || 'Engineering',
    },
  }),
};

/**
 * Create invalid payloads for validation testing
 * Simple, readable functions for common validation scenarios
 */
export const createInvalid = {
  user: {
    missingFields: () => {
      const base = createUser();
      return { ...base, user: { firstName: 'John' } }; // Missing lastName
    },

    invalidRole: () => {
      const base = createUser();
      return { ...base, role: 'invalid_role' };
    },

    invalidType: () => {
      const base = createUser();
      return {
        ...base,
        user: { firstName: 123, lastName: 'Valid' }, // Wrong type
      };
    },

    invalidEmail: () => {
      const base = createUser();
      return {
        ...base,
        credentials: { ...base.credentials, email: 'invalid-email' },
      };
    },

    emptyFields: () => {
      const base = createUser();
      return {
        ...base,
        user: { firstName: '', lastName: '' },
        credentials: { ...base.credentials, email: '', password: '' },
      };
    },
  },

  student: {
    missingFields: () => {
      const base = createStudent();
      return { ...base, user: { firstName: 'Jane' } }; // Missing lastName
    },

    invalidType: () => {
      const base = createStudent();
      return {
        ...base,
        specificDetails: { ...base.specificDetails, studentType: 'invalid_type' },
      };
    },

    invalidNumber: () => {
      const base = createStudent();
      return {
        ...base,
        specificDetails: { ...base.specificDetails, studentNumber: 'invalid' },
      };
    },
  },

  staff: {
    missingFields: () => {
      const base = createStaff();
      return { ...base, user: { firstName: 'John' } }; // Missing lastName
    },

    invalidRole: () => {
      const base = createStaff();
      return { ...base, role: 'student' }; // Invalid for staff endpoint
    },

    invalidNumber: () => {
      const base = createStaff();
      return {
        ...base,
        specificDetails: { ...base.specificDetails, employeeNumber: 'invalid' },
      };
    },
  },

  invite: {
    missingFields: () => {
      const base = createInvite();
      return { ...base, firstName: undefined };
    },

    invalidEmail: () => {
      const base = createInvite();
      return { ...base, email: 'invalid-email' };
    },
  },
};

/**
 * Pre-configured test data for common scenarios
 * Easy to use and understand
 */
export const testUsers = {
  // Valid users
  student: createUser({ role: 'student' }),
  mentor: createStaff({ role: 'mentor' }),
  admin: createStaff({ role: 'admin' }),

  // For update operations
  update: {
    user: createUpdate.user(),
    student: createUpdate.student(),
    staff: createUpdate.staff(),
  },

  // For invite operations
  invite: {
    student: createInvite({ role: 'student' }),
    staff: createInvite({ role: 'mentor' }),
  },

  // Invalid users for validation
  invalid: {
    user: {
      missingFields: createInvalid.user.missingFields(),
      invalidRole: createInvalid.user.invalidRole(),
      invalidType: createInvalid.user.invalidType(),
      invalidEmail: createInvalid.user.invalidEmail(),
      emptyFields: createInvalid.user.emptyFields(),
    },

    student: {
      missingFields: createInvalid.student.missingFields(),
      invalidType: createInvalid.student.invalidType(),
      invalidNumber: createInvalid.student.invalidNumber(),
    },

    staff: {
      missingFields: createInvalid.staff.missingFields(),
      invalidRole: createInvalid.staff.invalidRole(),
      invalidNumber: createInvalid.staff.invalidNumber(),
    },

    invite: {
      missingFields: createInvalid.invite.missingFields(),
      invalidEmail: createInvalid.invite.invalidEmail(),
    },
  },
};
