import { FunctionDeclaration, Tool, Type } from '@google/genai';
import {
  BillStatus,
  FilterBillSort,
  SortOrder,
} from '@/modules/billing/dto/filter-bill.dto';
import {
  BillType,
  ContentType,
  EnrollmentStatus,
  PaymentScheme,
  ProgressStatus,
  Role,
  AppointmentStatus,
} from '@prisma/client';
import { RelativeDateRange } from '@/common/utils/date-range.util';
import { NotificationType } from '@/modules/notifications/dto/filter-notification.dto';

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
const AppointmentStatusEnum = Object.values(AppointmentStatus) as string[];
const NotificationTypeEnum = Object.values(NotificationType);
const RelativeDateRangeEnum = Object.values(RelativeDateRange) as string[];

// -------------------------
// General knowledge search
// -------------------------
export const vectorSearchFn: FunctionDeclaration = {
  name: 'search_vector',
  description:
    'Search for documents using vector search. It answers general questions (non user specific).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Search query string',
      },
      limit: {
        type: Type.INTEGER,
        description: 'Maximum number of results to return',
      },
    },
    required: ['query'],
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
        description:
          'Role of the user to filter by. Default is all roles when not provided.',
      },
      search: {
        type: Type.STRING,
        description: 'Search term for filtering users.',
      },
    },
  },
};

export const usersFindSelf: FunctionDeclaration = {
  name: 'users_find_self',
  description:
    'Find the registered details of the current authenticated user. Includes extra details such as student details or staff details',
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
export const lmsMyTodosFn: FunctionDeclaration = {
  name: 'lms_my_todos',
  description:
    'Get all pending todos (assignments and quizzes with due dates) for the current student.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      relativeDate: {
        type: Type.STRING,
        enum: RelativeDateRangeEnum,
        description: 'Filter todos by relative date.',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of todos per page (default 10).',
      },
    },
  },
};

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

// -------------------------
// Appointments function declarations
// -------------------------
export const appointmentsMyAppointmentsFn: FunctionDeclaration = {
  name: 'appointments_my_appointments',
  description:
    'Get all appointments or mentoring sessions for the current user (student or mentor) with optional filtering by status, course, or date range.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: {
        type: Type.STRING,
        enum: AppointmentStatusEnum,
        description: 'Filter appointments by status.',
      },
      courseId: {
        type: Type.STRING,
        description: 'Filter appointments by course ID.',
      },
      startDate: {
        type: Type.STRING,
        description:
          'Filter appointments starting from this date (ISO string).',
      },
      endDate: {
        type: Type.STRING,
        description: 'Filter appointments ending by this date (ISO string).',
      },
      search: {
        type: Type.STRING,
        description:
          'Search term for filtering appointments by title or description.',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of appointments per page (default 10).',
      },
    },
  },
};

export const appointmentsMentorBookedFn: FunctionDeclaration = {
  name: 'appointments_mentor_booked',
  description:
    'Get all booked appointments for the current mentor within a date range. Only available to mentors.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      startDate: {
        type: Type.STRING,
        description: 'Start date for filtering appointments (ISO string).',
      },
      endDate: {
        type: Type.STRING,
        description: 'End date for filtering appointments (ISO string).',
      },
    },
  },
};

// -------------------------
// Notifications function declarations
// -------------------------
export const notificationsMyNotificationsFn: FunctionDeclaration = {
  name: 'notifications_my_notifications',
  description:
    'Get all notifications for the current user with optional filtering by read status and type.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: NotificationTypeEnum,
        description: 'Filter notifications by read status (READ or UNREAD).',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of notifications per page (default 10).',
      },
    },
  },
};

export const notificationsMyCountsFn: FunctionDeclaration = {
  name: 'notifications_my_counts',
  description:
    'Get notification counts for the current user (total, read, unread).',
  parameters: { type: Type.OBJECT, properties: {} },
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
      id: { type: Type.NUMBER, description: 'Invoice identifier.' },
    },
    required: ['id'],
  },
};

// -------------------------
// Aggregations and exports
// -------------------------
export const userFunctions: FunctionDeclaration[] = [
  usersCountFn,
  usersFindSelf,
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
  // lmsModuleContentsFn,
  // lmsModuleContentsWithProgressFn,
  // lmsMyContentProgressFn,
  lmsMyTodosFn,
];

export const appointmentsFunctions: FunctionDeclaration[] = [
  appointmentsMyAppointmentsFn,
  appointmentsMentorBookedFn,
];

export const notificationsFunctions: FunctionDeclaration[] = [
  notificationsMyNotificationsFn,
  notificationsMyCountsFn,
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
      ...appointmentsFunctions,
      ...notificationsFunctions,
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
            ...appointmentsFunctions,
            ...notificationsFunctions,
            usersFindSelf,
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
            ...appointmentsFunctions,
            ...notificationsFunctions,
            ...billingFunctions,
            usersFindSelf,
            vectorSearchFn,
          ],
        },
      ];
    default:
      return [];
  }
}
