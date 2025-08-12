import { FunctionDeclaration, Tool, Type } from '@google/genai';

// Common enums/refs
const RoleEnum = ['student', 'mentor', 'admin'];

// -------------------------
// Users function declarations
// -------------------------
export const usersCountFn: FunctionDeclaration = {
  name: 'users_count_all',
  description: 'Count all users.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      role: {
        type: Type.STRING,
        enum: RoleEnum,
        description: 'Role of the user.',
      },
      search: {
        type: Type.STRING,
        description: 'Search term for filtering users.',
      },
    },
  },
};

export const usersFindOneFn: FunctionDeclaration = {
  name: 'users_find_one',
  description: 'Find a user by their UUID, including related records.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: 'User UUID.' },
    },
    required: ['id'],
  },
};

// -------------------------
// Billing function declarations
// -------------------------

// -------------------------
// Courses function declarations
// -------------------------

export const coursesFindAllFn: FunctionDeclaration = {
  name: 'courses_find_all',
  description: 'List all courses.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const coursesFindOneFn: FunctionDeclaration = {
  name: 'courses_find_one',
  description: 'Fetch a single course by numeric identifier.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'Course identifier.',
        minimum: 1,
      },
    },
    required: ['id'],
  },
};

// -------------------------
// Aggregations and exports
// -------------------------
export const userFunctions: FunctionDeclaration[] = [
  usersCountFn,
  usersFindOneFn,
];

// export const billingFunctions: FunctionDeclaration[] = [billingCreateFn];

export const courseFunctions: FunctionDeclaration[] = [
  coursesFindAllFn,
  coursesFindOneFn,
];

/**
 * Complete Tool array to pass to the Gemini SDK.
 * Example usage:
 *   const response = await client.models.generate_content(model, contents, { tools });
 */
export const tools: Tool[] = [
  {
    functionDeclarations: [
      ...userFunctions,

      // ...billingFunctions,

      ...courseFunctions,
    ],
  },
];

export function getToolsForRole(role: string) {
  switch (role) {
    case 'admin':
      return tools; // all tools
    case 'mentor':
      return [{ functionDeclarations: [...courseFunctions] }];
    case 'student':
      return [{ functionDeclarations: [...courseFunctions] }];
    default:
      return [];
  }
}

/**
 * If you need finer control over which functions are enabled per request,
 * you can build Tool arrays per module like:
 *
 *   export const authTools: Tool[] = [{ functionDeclarations: authFunctions }];
 *   export const userTools: Tool[] = [{ functionDeclarations: userFunctions }];
 */
export const userTools: Tool[] = [{ functionDeclarations: userFunctions }];
// export const billingTools: Tool[] = [
//   { functionDeclarations: billingFunctions },
// ];
export const courseTools: Tool[] = [{ functionDeclarations: courseFunctions }];
