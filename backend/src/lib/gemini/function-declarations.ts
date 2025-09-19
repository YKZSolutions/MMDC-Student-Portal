import { FunctionDeclaration, Tool, Type } from '@google/genai';
import {
  BillStatus,
  FilterBillSort,
  SortOrder,
} from '@/modules/billing/dto/filter-bill.dto';
import { util } from 'zod/v3/helpers/util';
import {
  BillType,
  ContentType,
  EnrollmentStatus,
  PaymentScheme,
  ProgressStatus,
  Role,
} from '@prisma/client';

// Common enums/refs
const RoleEnum = Object.values(Role) as string[];
const EnrollmentStatusEnum = Object.values(EnrollmentStatus) as string[];
const ContentTypeEnum = Object.values(ContentType) as string[];
const ProgressStatusEnum = Object.values(ProgressStatus) as string[];
const SortOrderEnum = Object.values(SortOrder) as string[];
const FilterBillSortEnum = Object.values(FilterBillSort) as string[];
const BillStatusEnum = Object.values(BillStatus) as string[];
const PaymentSchemeEnum = Object.values(PaymentScheme) as string[];
const BillTypeEnum = Object.values(BillType) as string[];

// -------------------------
// General knowledge search
// -------------------------
export const vectorSearchFn: FunctionDeclaration = {
  name: 'search_vector',
  description:
    'Search for documents using vector search. It answers general questions. Such as about school information, policies, procedures:\n' +
    '- "When is the enrollment?"\n' +
    '- "What are the school hours?"\n' +
    '- "How do I book a mentoring session?"',
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
        description: 'The number of results to return (default 10).',
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
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of users per page (default 10).',
      },
    },
  },
};

export const usersFindOneFn: FunctionDeclaration = {
  name: 'users_find_one',
  description: 'Find a specific user by their ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'User identifier.',
      },
    },
    required: ['id'],
  },
};

// -------------------------
// Courses function declarations
// -------------------------
export const coursesFindAllFn: FunctionDeclaration = {
  name: 'courses_find_all',
  description: 'List all available courses with optional filters.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      search: {
        type: Type.STRING,
        description: 'Search term for filtering courses by name/code.',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of courses per page (default 10).',
      },
    },
  },
};

export const coursesFindOneFn: FunctionDeclaration = {
  name: 'courses_find_one',
  description: 'Fetch a single course by identifier.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'Course identifier.',
      },
    },
    required: ['id'],
  },
};

// -------------------------
// Enrollment function declarations
// -------------------------
export const enrollmentFindActiveFn: FunctionDeclaration = {
  name: 'enrollment_find_active',
  description: 'Get the current active enrollment period.',
  parameters: { type: Type.OBJECT, properties: {} },
};

export const enrollmentFindAllFn: FunctionDeclaration = {
  name: 'enrollment_find_all',
  description: 'List all enrollment periods (past and upcoming).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      search: {
        type: Type.STRING,
        description:
          'Search term for filtering enrollment period by name/code.',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of enrollment periods per page (default 10).',
      },
    },
  },
};

export const enrollmentMyCoursesFn: FunctionDeclaration = {
  name: 'enrollment_my_courses',
  description:
    'Get all courses a student is enrolled in, with optional status filtering.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// -------------------------
// LMS function declarations
// -------------------------
export const lmsMyModulesFn: FunctionDeclaration = {
  name: 'lms_my_modules',
  description: 'List all modules for the current user with optional filtering.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      startYear: {
        type: Type.INTEGER,
        description: 'Filter modules by start year.',
      },
      endYear: {
        type: Type.INTEGER,
        description: 'Filter modules by end year.',
      },
      term: {
        type: Type.INTEGER,
        description: 'Filter modules by term number.',
      },
      search: {
        type: Type.STRING,
        description:
          'Search term for filtering modules by name or description.',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of modules per page (default 10).',
      },
    },
  },
};

export const lmsModuleContentsFn: FunctionDeclaration = {
  name: 'lms_module_contents',
  description:
    'Fetch all content (lessons, quizzes, assignments) for a module with optional filtering.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      enrollmentPeriod: {
        type: Type.OBJECT,
        properties: {
          startYear: {
            type: Type.INTEGER,
            description: 'Filter content by start year.',
          },
          endYear: {
            type: Type.INTEGER,
            description: 'Filter content by end year.',
          },
          status: {
            type: Type.STRING,
            enum: EnrollmentStatusEnum,
            description: 'Filter content by enrollment status.',
          },
          term: {
            type: Type.INTEGER,
            description: 'Filter content by term number.',
          },
          contentType: {
            type: Type.STRING,
            enum: ContentTypeEnum,
            description: 'Filter content by content type.',
          },
          progress: {
            type: Type.STRING,
            enum: ProgressStatusEnum,
            description: 'Filter content by progress status.',
          },
          search: {
            type: Type.STRING,
            description:
              'Search term for filtering content by student name or student number, content title and/or subtitle',
          },
          page: {
            type: Type.INTEGER,
            default: 1,
            description: 'Page number for pagination (default 1).',
          },
          limit: {
            type: Type.INTEGER,
            default: 10,
            description: 'Number of content items per page (default 10).',
          },
        },
      },
    },
  },
};

// -------------------------
// Billing function declarations
// -------------------------
export const billingMyInvoicesFn: FunctionDeclaration = {
  name: 'billing_my_invoices',
  description:
    'List all billing invoices for the current student with optional filtering.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      search: {
        type: Type.STRING,
        description:
          'Search term for filtering invoices by invoice number or status.',
      },
      status: {
        type: Type.STRING,
        enum: BillStatusEnum,
        description: 'Filter invoices by status.',
      },
      scheme: {
        type: Type.STRING,
        enum: PaymentSchemeEnum,
        description: 'Filter invoices by payment scheme.',
      },
      type: {
        type: Type.STRING,
        enum: BillTypeEnum,
        description: 'Filter invoices by type.',
      },
      sort: {
        type: Type.STRING,
        enum: FilterBillSortEnum,
        description: 'Sort invoices by a specific field.',
      },
      sortOrder: {
        type: Type.STRING,
        enum: SortOrderEnum,
        description: 'Sort order for invoices.',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of invoices per page (default 10).',
      },
    },
  },
};

export const billingInvoiceDetailsFn: FunctionDeclaration = {
  name: 'billing_invoice_details',
  description: 'Fetch details of a specific invoice.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: 'Invoice identifier.' },
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

export const courseFunctions: FunctionDeclaration[] = [
  coursesFindAllFn,
  coursesFindOneFn,
];

export const enrollmentFunctions: FunctionDeclaration[] = [
  enrollmentFindActiveFn,
  enrollmentFindAllFn,
  enrollmentMyCoursesFn,
];

export const lmsFunctions: FunctionDeclaration[] = [
  lmsMyModulesFn,
  lmsModuleContentsFn,
];

export const billingFunctions: FunctionDeclaration[] = [
  billingMyInvoicesFn,
  billingInvoiceDetailsFn,
];

export const tools: Tool[] = [
  {
    functionDeclarations: [
      vectorSearchFn,
      ...userFunctions,
      ...courseFunctions,
      ...enrollmentFunctions,
      ...lmsFunctions,
      ...billingFunctions,
    ],
  },
];

export function getToolsForRole(role: string) {
  switch (role) {
    case 'admin':
      return tools;
    case 'mentor':
      return [
        {
          functionDeclarations: [
            ...courseFunctions,
            ...lmsFunctions,
            vectorSearchFn,
          ],
        },
      ];
    case 'student':
      return [
        {
          functionDeclarations: [
            ...courseFunctions,
            ...enrollmentFunctions,
            ...lmsFunctions,
            ...billingFunctions,
            vectorSearchFn,
          ],
        },
      ];
    default:
      return [];
  }
}
