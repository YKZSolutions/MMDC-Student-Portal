import { FunctionDeclaration, Tool, Type } from '@google/genai';

// Common enums/refs
const RoleEnum = ['student', 'mentor', 'admin'];

export const vectorSearchFn: FunctionDeclaration = {
  name: 'search_vector',
  description: 'Search for documents using vector search.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query.',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'The number of results to return.',
      },
    },
  },
};

// -------------------------
// Users function declarations
// -------------------------
export const usersCountFn: FunctionDeclaration = {
  name: 'users_count_all',
  description:
    'Count all users based on filters which include role and search term.',
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
      vectorSearchFn,
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
      return [{ functionDeclarations: [...courseFunctions, vectorSearchFn] }];
    case 'student':
      return [{ functionDeclarations: [...courseFunctions, vectorSearchFn] }];
    default:
      return [];
  }
}
