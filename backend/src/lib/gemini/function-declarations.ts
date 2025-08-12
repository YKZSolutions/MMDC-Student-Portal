/**
 * Gemini Function Declarations for function calling.
 *
 * These declarations describe the app's operations and their parameters in JSON Schema format.
 * They can be provided to the Gemini SDK as tools to enable function calling:
 *
 * Example:
 *   import { tools } from '@/lib/gemini/function-declarations';
 *   const response = await client.models.generate_content(modelId, contents, { tools });
 */

/* Lightweight local types to avoid tight SDK coupling.
   If you prefer SDK types, you can replace with:
   import type { types } from '@google/genai';
   type FunctionDeclaration = types.FunctionDeclaration;
   type Tool = types.Tool;
*/
export type FunctionDeclaration = {
  name: string;
  description?: string;
  parameters?: unknown; // JSON Schema
};
export type Tool = {
  functionDeclarations: FunctionDeclaration[];
};

// Common enums/refs
const RoleEnum = ['student', 'mentor', 'admin'] as const;

// -------------------------
// Users function declarations
// -------------------------
export const usersFindAllFn: FunctionDeclaration = {
  name: 'users_find_all',
  description:
    'Search and paginate users filtered by role and/or search term. Returns list and pagination metadata.',
  parameters: {
    type: 'OBJECT',
    properties: {
      role: {
        type: 'STRING',
        enum: RoleEnum,
        description: 'Optional role filter.',
      },
      search: {
        type: 'STRING',
        description:
          'Optional search string; matched against first name, last name, or email.',
      },
      page: {
        type: 'INTEGER',
        description: 'Page number (1-based).',
        minimum: 1,
      },
    },
  },
};

export const usersFindOneFn: FunctionDeclaration = {
  name: 'users_find_one',
  description: 'Find a user by their UUID, including related records.',
  parameters: {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING', description: 'User UUID.' },
    },
    required: ['id'],
  },
};

export const usersGetMeFn: FunctionDeclaration = {
  name: 'users_get_me',
  description:
    'Get the current authenticated user profile by auth UID in context. No parameters required.',
  parameters: {
    type: 'OBJECT',
    properties: {},
  },
};

// -------------------------
// Billing function declarations
// -------------------------
export const billingCreateFn: FunctionDeclaration = {
  name: 'billing_create_intent',
  description:
    'Create a payment intent via the billing provider with optional description/statement.',
  parameters: {
    type: 'OBJECT',
    properties: {
      amount: {
        type: 'INTEGER',
        description:
          'Amount in the smallest currency unit (e.g., centavos for PHP).',
        minimum: 1,
      },
      description: {
        type: 'STRING',
        description: 'Optional payment description.',
      },
      statement: {
        type: 'STRING',
        description: 'Optional statement descriptor.',
      },
      billingId: {
        type: 'STRING',
        description: 'Associated internal billing ID.',
      },
    },
    required: ['amount', 'billingId'],
  },
};

// -------------------------
// Courses function declarations
// -------------------------

export const coursesFindAllFn: FunctionDeclaration = {
  name: 'courses_find_all',
  description: 'List all courses.',
  parameters: {
    type: 'OBJECT',
    properties: {},
  },
};

export const coursesFindOneFn: FunctionDeclaration = {
  name: 'courses_find_one',
  description: 'Fetch a single course by numeric identifier.',
  parameters: {
    type: 'OBJECT',
    properties: {
      id: {
        type: 'INTEGER',
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
  usersFindAllFn,
  usersFindOneFn,
  usersGetMeFn,
];

export const billingFunctions: FunctionDeclaration[] = [billingCreateFn];

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
      ...billingFunctions,
      ...courseFunctions,
    ],
  },
];

/**
 * If you need finer control over which functions are enabled per request,
 * you can build Tool arrays per module like:
 *
 *   export const authTools: Tool[] = [{ functionDeclarations: authFunctions }];
 *   export const userTools: Tool[] = [{ functionDeclarations: userFunctions }];
 */
export const userTools: Tool[] = [{ functionDeclarations: userFunctions }];
export const billingTools: Tool[] = [
  { functionDeclarations: billingFunctions },
];
export const courseTools: Tool[] = [{ functionDeclarations: courseFunctions }];
