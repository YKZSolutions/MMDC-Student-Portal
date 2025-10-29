import { FunctionDeclaration, Tool, Type } from '@google/genai';
import {
  BillStatus,
  FilterBillSort,
  SortOrder,
} from '@/modules/billing/dto/filter-bill.dto';
import {
  AppointmentStatus,
  BillType,
  ContentType,
  CourseEnrollmentStatus,
  Days,
  EnrollmentStatus,
  PaymentScheme,
  ProgressStatus,
  Role,
} from '@prisma/client';
import { RelativeDateRange } from '@/common/utils/date-range.util';
import { NotificationType } from '@/modules/notifications/dto/filter-notification.dto';

// Common enums/refs
const RoleEnum = Object.values(Role) as string[];
const EnrollmentStatusEnum = Object.values(EnrollmentStatus) as string[];
const CourseEnrollmentStatusEnum = Object.values(
  CourseEnrollmentStatus,
) as string[];
const DaysEnum = Object.values(Days) as string[];
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
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description:
          'Search query strings. Be descriptive and specific, expound more on what the user might be looking for.',
      },
      limit: {
        type: Type.INTEGER,
        description: 'Maximum number of results to return',
      },
    },
    required: ['query'],
  },
};

export const dateUtilityFn: FunctionDeclaration = {
  name: 'date_utility',
  description:
    'Perform date and time related operations. Also returns the day of the week.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      dateTime: {
        type: Type.STRING,
        format: 'date-time',
        description: 'Date and time to perform operations on',
      },
      useCurrentDateTime: {
        type: Type.BOOLEAN,
        description: 'Use or get current date and time',
      },
      daysToAdd: {
        type: Type.OBJECT,
        properties: {
          days: {
            type: Type.INTEGER,
            description: 'Number of days to add to the current date',
          },
          hours: {
            type: Type.INTEGER,
            description: 'Number of hours to add to the current date',
          },
          minutes: {
            type: Type.INTEGER,
            description: 'Number of minutes to add to the current date',
          },
          seconds: {
            type: Type.INTEGER,
            description: 'Number of seconds to add to the current date',
          },
        },
      },
      daysToSubtract: {
        type: Type.OBJECT,
        properties: {
          days: {
            type: Type.INTEGER,
            description: 'Number of days to subtract from the current date',
          },
          hours: {
            type: Type.INTEGER,
            description: 'Number of hours to subtract from the current date',
          },
          minutes: {
            type: Type.INTEGER,
            description: 'Number of minutes to subtract from the current date',
          },
          seconds: {
            type: Type.INTEGER,
            description: 'Number of seconds to subtract from the current date',
          },
        },
      },
      monthsToAdd: {
        type: Type.INTEGER,
        description: 'Number of months to add to the current date',
      },
      monthsToSubtract: {
        type: Type.INTEGER,
        description: 'Number of months to subtract from the current date',
      },
    },
  },
  response: {
    type: Type.OBJECT,
    properties: {
      dateTime: {
        type: Type.STRING,
        format: 'date-time',
        description: 'Date and time after performing operations',
      },
      day: {
        type: Type.STRING,
        description: 'Day of the week',
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
    'Count all users registered in the system based on filters which include role and search term.',
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

// export const usersMentorDetailsFn: FunctionDeclaration = {
//   name: 'users_mentor_details',
//   description:
//     'Get details of a mentor based on the mentor ID. This includes mentor details, courses, and appointments.',
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       mentorId: {
//         type: Type.STRING,
//         description: 'ID of the mentor to fetch details for.',
//       },
//     },
//   },
// };

export const usersAllMentorsListFn: FunctionDeclaration = {
  name: 'users_all_mentor_list',
  description: 'Get details of all the mentors of the student',
  parameters: {
    type: Type.OBJECT,
    properties: {
      search: {
        type: Type.STRING,
        description: 'Search term for filtering mentors by name.',
      },
    },
  },
  response: {
    type: Type.OBJECT,
    properties: {
      users: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            firstName: {
              type: Type.STRING,
              description: 'User first name.',
            },
            middleName: {
              type: Type.STRING,
              description: 'User middle name.',
            },
            lastName: {
              type: Type.STRING,
              description: 'User last name.',
            },
            userAccount: {
              type: Type.OBJECT,
              properties: {
                email: {
                  type: Type.STRING,
                  description: 'User email address.',
                },
              },
            },
          },
        },
      },
    },
  },
};

// -------------------------
// Courses function declarations
// -------------------------

// Useful when the AI lacks some context from the questions,
// therefore, it can use these schemas as a guide
// on what tools to use to get more context to generate the response
export const courseFullDtoSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'Course identifier.' },
    name: { type: Type.STRING, description: 'Course name.' },
    code: { type: Type.STRING, description: 'Course code.' },
    description: {
      type: Type.STRING,
      description: 'Course description.',
    },
    units: { type: Type.INTEGER, description: 'Number of units.' },
    type: { type: Type.STRING, description: 'Course type.' },
    isActive: { type: Type.BOOLEAN, description: 'Course status.' },
    prereqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'Prerequisite course identifier.',
          },
          name: {
            type: Type.STRING,
            description: 'Prerequisite course name.',
          },
          code: {
            type: Type.STRING,
            description: 'Prerequisite course code.',
          },
        },
      },
    },
    coreqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'Corequisite course identifier.',
          },
          name: {
            type: Type.STRING,
            description: 'Corequisite course name.',
          },
          code: {
            type: Type.STRING,
            description: 'Corequisite course code.',
          },
        },
      },
    },
  },
};

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
  response: {
    type: Type.OBJECT,
    properties: {
      courses: {
        type: Type.ARRAY,
        items: courseFullDtoSchema,
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
  response: courseFullDtoSchema,
};

// -------------------------
// Enrollment function declarations
// -------------------------

export const enrollmentPeriodDtoSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'Enrollment period identifier.' },
    startYear: { type: Type.INTEGER, description: 'Start year of the period.' },
    endYear: { type: Type.INTEGER, description: 'End year of the period.' },
    term: { type: Type.INTEGER, description: 'Term number of the period.' },
    startDate: {
      type: Type.STRING,
      format: 'date-time',
      description: 'Start date of the enrollment period.',
    },
    endDate: {
      type: Type.STRING,
      format: 'date-time',
      description: 'End date of the enrollment period.',
    },
    isActive: { type: Type.BOOLEAN, description: 'Enrollment period status.' },
    status: {
      type: Type.STRING,
      enum: EnrollmentStatusEnum,
      description: 'Enrollment period status.',
    },
  },
};

export const enrollmentFindActiveFn: FunctionDeclaration = {
  name: 'enrollment_find_active',
  description: 'Get the current active enrollment period.',
  parameters: { type: Type.OBJECT, properties: {} },
  response: enrollmentPeriodDtoSchema,
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
  response: {
    type: Type.OBJECT,
    properties: {
      enrollmentPeriods: {
        type: Type.ARRAY,
        items: enrollmentPeriodDtoSchema,
      },
    },
  },
};

export const detailedCouseSectionDtoSchema = {
  type: Type.OBJECT,
  properties: {
    id: {
      type: Type.STRING,
      description: 'Course section identifier.',
    },
    mentorId: {
      type: Type.STRING,
      description: 'Mentor identifier.',
    },
    mentor: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: 'Mentor identifier.',
        },
        firstName: {
          type: Type.STRING,
          description: 'Mentor first name.',
        },
        lastName: {
          type: Type.STRING,
          description: 'Mentor last name.',
        },
      },
    },
    availableSlots: {
      type: Type.INTEGER,
      description: 'Number of available slots for the course section.',
    },
  },
};

export const detailedCourseEnrollmentDtoSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'Course enrollment identifier.' },
    status: {
      type: Type.STRING,
      enum: CourseEnrollmentStatusEnum,
      description: 'Course enrollment status.',
    },
    startedAt: { type: Type.STRING, format: 'date-time' },
    completedAt: { type: Type.STRING, format: 'date-time' },
    studentId: { type: Type.STRING, description: 'Student identifier.' },
    courseOfferingId: {
      type: Type.STRING,
      description: 'Course offering identifier.',
    },
    courseSectionId: {
      type: Type.STRING,
      description: 'Course section identifier.',
    },
    courseSection: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: 'Course section identifier.',
        },
        mentorId: {
          type: Type.STRING,
          description: 'Mentor identifier.',
        },
        mentor: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: 'Mentor identifier.',
            },
            firstName: {
              type: Type.STRING,
              description: 'Mentor first name.',
            },
            lastName: {
              type: Type.STRING,
              description: 'Mentor last name.',
            },
          },
        },
        availableSlots: {
          type: Type.INTEGER,
          description: 'Number of available slots for the course section.',
        },
        name: {
          type: Type.STRING,
          description: 'Course section name.',
        },
        maxSlot: {
          type: Type.INTEGER,
          description: 'Maximum number of slots for the course section.',
        },
        startSched: {
          type: Type.STRING,
          format: 'date-time',
          description: 'Start schedule for the course section.',
        },
        endSched: {
          type: Type.STRING,
          format: 'date-time',
          description: 'End schedule for the course section.',
        },
        days: {
          type: Type.STRING,
          enum: DaysEnum,
          description: 'Days for the course section.',
        },
      },
    },
    courseOffering: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: 'Course offering identifier.',
        },
        course: courseFullDtoSchema,
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
  response: {
    type: Type.ARRAY,
    items: detailedCourseEnrollmentDtoSchema,
  },
};

export const detailedCourseOfferingDtoSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'Course offering identifier.' },
    course: courseFullDtoSchema,
    courseSection: {
      type: Type.ARRAY,
      items: detailedCouseSectionDtoSchema,
    },
    courseEnrollments: {
      type: Type.ARRAY,
      items: detailedCourseEnrollmentDtoSchema,
    },
    periodId: {
      type: Type.STRING,
      description: 'Enrollment period identifier.',
    },
  },
};

export const courseOfferingForActiveEnrollment: FunctionDeclaration = {
  name: 'course_offering_for_active_enrollment',
  description:
    'Get the course offering for the current active enrollment period.',
  parameters: {},
  response: {
    type: Type.OBJECT,
    properties: {
      courseOfferings: {
        type: Type.ARRAY,
        items: detailedCourseOfferingDtoSchema,
      },
    },
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
  response: {
    type: Type.OBJECT,
    properties: {
      todos: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: 'Assignment identifier.',
            },
            title: {
              type: Type.STRING,
              description: 'Assignment title.',
            },
            dueDate: {
              type: Type.STRING,
              format: 'date-time',
              description: 'Due date of the assignment.',
            },
            moduleName: {
              type: Type.STRING,
              description: 'Module name for the assignment.',
            },
          },
        },
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
  response: {
    type: Type.OBJECT,
    properties: {
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: 'Module identifier.',
            },
            title: {
              type: Type.STRING,
              description: 'Module title.',
            },
            publishedAt: {
              type: Type.STRING,
              format: 'date-time',
              description: 'Date and time when the module was published.',
            },
            unpublishedAt: {
              type: Type.STRING,
              format: 'date-time',
              description: 'Date and time when the module was unpublished.',
            },
            courseOffering: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: 'Course offering identifier.',
                },
                courseSections: {
                  type: Type.ARRAY,
                  items: detailedCouseSectionDtoSchema,
                },
                enrollmentPeriod: enrollmentPeriodDtoSchema,
              },
            },
          },
        },
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
    'Get all appointments or mentoring sessions for the current user (student or mentor) with optional filtering by status, course, date range, or search filters.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: {
        type: Type.STRING,
        enum: AppointmentStatusEnum,
        description: 'Filter appointments by status.',
      },
      relativeDate: {
        type: Type.STRING,
        enum: RelativeDateRangeEnum,
        description: 'Filter appointments by relative date.',
      },
      search: {
        type: Type.STRING,
        description:
          'Search term for filtering appointments by mentor, course, title, or description.',
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
  response: {
    type: Type.OBJECT,
    properties: {
      appointments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: 'Appointment identifier.',
            },
            title: {
              type: Type.STRING,
              description: 'Appointment title.',
            },
            description: {
              type: Type.STRING,
              description: 'Appointment description.',
            },
            startAt: {
              type: Type.STRING,
              format: 'date-time',
              description: 'Start time of the appointment.',
            },
            endAt: {
              type: Type.STRING,
              format: 'date-time',
              description: 'End time of the appointment.',
            },
            status: {
              type: Type.STRING,
              enum: AppointmentStatusEnum,
              description: 'Appointment status.',
            },
            gmeetLink: {
              type: Type.STRING,
              description: 'Google Meet link for the appointment.',
            },
            cancelReason: {
              type: Type.STRING,
              description: 'Reason for canceling the appointment.',
            },
            course: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: 'Course identifier.',
                },
                code: {
                  type: Type.STRING,
                  description: 'Course code.',
                },
                name: {
                  type: Type.STRING,
                  description: 'Course name.',
                },
              },
            },
            student: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: 'Student identifier.',
                },
                firstName: {
                  type: Type.STRING,
                  description: 'Student first name.',
                },
                lastName: {
                  type: Type.STRING,
                  description: 'Student last name.',
                },
              },
            },
            mentor: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: 'Mentor identifier.',
                },
                firstName: {
                  type: Type.STRING,
                  description: 'Mentor first name.',
                },
                lastName: {
                  type: Type.STRING,
                  description: 'Mentor last name.',
                },
              },
            },
          },
        },
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
      relativeDate: {
        type: Type.STRING,
        enum: RelativeDateRangeEnum,
        description: 'Filter appointments by relative date.',
      },
    },
  },
  response: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: 'Appointment identifier.',
        },
        startAt: {
          type: Type.STRING,
          format: 'date-time',
          description: 'Start time of the appointment.',
        },
        endAt: {
          type: Type.STRING,
          format: 'date-time',
          description: 'End time of the appointment.',
        },
      },
    },
  },
};

export const appointmentsMentorAvailabilityFn: FunctionDeclaration = {
  name: 'appointments_mentor_available',
  description:
    'Get all available schedule a mentor is available for appointments within a date range. The mentor can be booked on the times from this list.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      relativeDate: {
        type: Type.STRING,
        enum: RelativeDateRangeEnum,
        default: 'this_week',
        description:
          'Filter mentor availability by relative date. Default is this week.',
      },
      mentorId: {
        type: Type.STRING,
        description: 'Filter mentor availability by mentor ID.',
      },
      search: {
        type: Type.STRING,
        description:
          'Search term for filtering availability by mentor and course.',
      },
      page: {
        type: Type.INTEGER,
        default: 1,
        description: 'Page number for pagination (default 1).',
      },
      limit: {
        type: Type.INTEGER,
        default: 10,
        description: 'Number of mentor availability per page (default 10).',
      },
    },
  },
  response: {
    type: Type.OBJECT,
    properties: {
      mentorId: {
        type: Type.STRING,
        description: 'Mentor identifier.',
      },
      mentors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: 'Mentor identifier.',
            },
            firstName: {
              type: Type.STRING,
              description: 'Mentor first name.',
            },
            lastName: {
              type: Type.STRING,
              description: 'Mentor last name.',
            },
            courseName: {
              type: Type.STRING,
              description: 'Course name of the mentor.',
            },
            courseCode: {
              type: Type.STRING,
              description: 'Course code of the mentor.',
            },
          },
        },
      },
      selectedMentor: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'Mentor identifier.',
          },
          name: {
            type: Type.STRING,
            description: 'Mentor full name.',
          },
        },
      },
      dateRange: {
        type: Type.OBJECT,
        properties: {
          startDate: {
            type: Type.STRING,
            format: 'date-time',
            description: 'Start date of the date range.',
          },
          endDate: {
            type: Type.STRING,
            format: 'date-time',
          },
        },
      },
      freeSlots: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            start: {
              type: Type.STRING,
              format: 'date-time',
              description: 'Start time of the slot.',
            },
            end: {
              type: Type.STRING,
              format: 'date-time',
              description: 'End time of the slot.',
            },
          },
        },
      },
      meta: {
        type: Type.OBJECT,
        properties: {
          totalFreeSlots: {
            type: Type.INTEGER,
            description: 'Total number of free slots.',
          },
          slotDuration: {
            type: Type.INTEGER,
            description: 'Duration of each slot in minutes.',
          },
          generatedAt: {
            type: Type.STRING,
            format: 'date-time',
            description: 'Date and time when the availability was generated.',
          },
          totalMentorsFound: {
            type: Type.INTEGER,
            description: 'Total number of mentors found.',
          },
        },
      },
    },
  },
};

export const appointmentsBookAppointmentFn: FunctionDeclaration = {
  name: 'appointments_book_appointment',
  description: `Book or Schedule an appointment or mentoring session.

**IMPORTANT WORKFLOW:**
Before calling this function, you MUST:
1. Call 'enrollment_my_courses' to get available mentors and course offerings
2. Call 'appointments_mentor_available' to check available time slots
3. Only then call this function with the gathered information

If mentorId or courseOfferingId are not available, you CANNOT proceed with booking.`,
  parameters: {
    type: Type.OBJECT,
    properties: {
      mentorId: {
        type: Type.STRING,
        description:
          'REQUIRED: ID from enrollment_my_courses → courseSection.mentor.id',
      },
      courseOfferingId: {
        type: Type.STRING,
        description:
          'REQUIRED: ID from enrollment_my_courses → courseOffering.id',
      },
      title: {
        type: Type.STRING,
        description: 'Title of the appointment or mentoring session.',
      },
      description: {
        type: Type.STRING,
        description: 'Reason for the appointment from the student.',
      },
      startAt: {
        type: Type.STRING,
        format: 'date-time',
        description: 'Start time from appointments_mentor_available free slots',
      },
      endAt: {
        type: Type.STRING,
        format: 'date-time',
        description: 'End time from appointments_mentor_available free slots',
      },
    },
    required: [
      'mentorId',
      'courseOfferingId',
      'title',
      'description',
      'startAt',
      'endAt',
    ],
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
// Progress function declarations
// -------------------------

export const progressModuleOverviewFn: FunctionDeclaration = {
  name: 'progress_module_overview',
  description:
    'Get overall progress statistics for a specific module including completion percentage, overdue assignments, and student progress.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      moduleId: {
        type: Type.STRING,
        description: 'ID of the module to get progress overview for',
      },
      courseOfferingId: {
        type: Type.STRING,
        description: 'Optional: Filter by specific course offering ID',
      },
    },
    required: ['moduleId'],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      moduleId: { type: Type.STRING },
      moduleTitle: { type: Type.STRING },
      completedContentItems: { type: Type.INTEGER },
      totalContentItems: { type: Type.INTEGER },
      notStartedContentItems: { type: Type.INTEGER },
      overdueAssignmentsCount: { type: Type.INTEGER },
      progressPercentage: { type: Type.INTEGER },
      status: { type: Type.STRING },
      lastAccessedAt: { type: Type.STRING, format: 'date-time' },
      completedStudentsCount: { type: Type.INTEGER },
      totalStudentsCount: { type: Type.INTEGER },
      moduleCompletionPercentage: { type: Type.INTEGER },
    },
  },
};

export const progressModuleDetailFn: FunctionDeclaration = {
  name: 'progress_module_detail',
  description:
    'Get detailed progress breakdown for a module including sections and individual content items with completion status.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      moduleId: {
        type: Type.STRING,
        description: 'ID of the module to get detailed progress for',
      },
      courseOfferingId: {
        type: Type.STRING,
        description: 'Optional: Filter by specific course offering ID',
      },
    },
    required: ['moduleId'],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      moduleId: { type: Type.STRING },
      moduleTitle: { type: Type.STRING },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            order: { type: Type.INTEGER },
            completedContentItems: { type: Type.INTEGER },
            totalContentItems: { type: Type.INTEGER },
            progressPercentage: { type: Type.INTEGER },
            completedStudentsCount: { type: Type.INTEGER },
            totalStudentsCount: { type: Type.INTEGER },
            completionPercentage: { type: Type.INTEGER },
            contentItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  contentType: { type: Type.STRING },
                  order: { type: Type.INTEGER },
                  status: { type: Type.STRING },
                  completedAt: { type: Type.STRING, format: 'date-time' },
                  lastAccessedAt: { type: Type.STRING, format: 'date-time' },
                  completedStudentsCount: { type: Type.INTEGER },
                  totalStudentsCount: { type: Type.INTEGER },
                  completionPercentage: { type: Type.INTEGER },
                },
              },
            },
          },
        },
      },
      overallProgress: {
        type: Type.OBJECT,
        properties: {
          completedContentItems: { type: Type.INTEGER },
          totalContentItems: { type: Type.INTEGER },
          progressPercentage: { type: Type.INTEGER },
          status: { type: Type.STRING },
          completedStudentsCount: { type: Type.INTEGER },
          totalStudentsCount: { type: Type.INTEGER },
          moduleCompletionPercentage: { type: Type.INTEGER },
        },
      },
    },
  },
};

export const progressDashboardFn: FunctionDeclaration = {
  name: 'progress_dashboard',
  description:
    'Get comprehensive progress dashboard with overview of all modules, completion statistics, and student progress (for mentors/admins).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      courseOfferingId: {
        type: Type.STRING,
        description: 'Optional: Filter by specific course offering ID',
      },
      search: {
        type: Type.STRING,
        description: 'Optional: Search term for filtering modules by title',
      },
    },
  },
  response: {
    type: Type.OBJECT,
    properties: {
      studentProgress: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            moduleId: { type: Type.STRING },
            moduleTitle: { type: Type.STRING },
            completedContentItems: { type: Type.INTEGER },
            totalContentItems: { type: Type.INTEGER },
            notStartedContentItems: { type: Type.INTEGER },
            overdueAssignmentsCount: { type: Type.INTEGER },
            progressPercentage: { type: Type.INTEGER },
            status: { type: Type.STRING },
            lastAccessedAt: { type: Type.STRING, format: 'date-time' },
            completedStudentsCount: { type: Type.INTEGER },
            totalStudentsCount: { type: Type.INTEGER },
            moduleCompletionPercentage: { type: Type.INTEGER },
          },
        },
      },
      overallStats: {
        type: Type.OBJECT,
        properties: {
          totalStudents: { type: Type.INTEGER },
          averageProgress: { type: Type.INTEGER },
          completedModules: { type: Type.INTEGER },
          inProgressModules: { type: Type.INTEGER },
          notStartedModules: { type: Type.INTEGER },
        },
      },
      studentStats: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            studentId: { type: Type.STRING },
            studentName: { type: Type.STRING },
            completedModules: { type: Type.INTEGER },
            totalModules: { type: Type.INTEGER },
            averageProgress: { type: Type.INTEGER },
            lastActivity: { type: Type.STRING, format: 'date-time' },
          },
        },
      },
    },
  },
};

export const progressMyModulesFn: FunctionDeclaration = {
  name: 'progress_my_modules',
  description:
    'Get progress overview for all modules the current user is enrolled in or responsible for.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: {
        type: Type.STRING,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
        description: 'Optional: Filter modules by progress status',
      },
      search: {
        type: Type.STRING,
        description: 'Optional: Search term for filtering modules by title',
      },
    },
  },
  response: {
    type: Type.OBJECT,
    properties: {
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            moduleId: { type: Type.STRING },
            moduleTitle: { type: Type.STRING },
            courseName: { type: Type.STRING },
            progressPercentage: { type: Type.INTEGER },
            status: { type: Type.STRING },
            completedContentItems: { type: Type.INTEGER },
            totalContentItems: { type: Type.INTEGER },
            overdueAssignmentsCount: { type: Type.INTEGER },
            lastAccessedAt: { type: Type.STRING, format: 'date-time' },
          },
        },
      },
      summary: {
        type: Type.OBJECT,
        properties: {
          totalModules: { type: Type.INTEGER },
          completedModules: { type: Type.INTEGER },
          inProgressModules: { type: Type.INTEGER },
          notStartedModules: { type: Type.INTEGER },
          overallProgress: { type: Type.INTEGER },
        },
      },
    },
  },
};

// -------------------------
// Aggregations and exports
// -------------------------
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
  appointmentsMentorAvailabilityFn,
];

export const notificationsFunctions: FunctionDeclaration[] = [
  notificationsMyNotificationsFn,
  notificationsMyCountsFn,
];

export const billingFunctions: FunctionDeclaration[] = [
  billingMyInvoicesFn,
  billingInvoiceDetailsFn,
];

export const progressFunctions: FunctionDeclaration[] = [
  progressModuleOverviewFn,
  progressModuleDetailFn,
  progressDashboardFn,
  progressMyModulesFn,
];

export const tools: Tool[] = [
  {
    functionDeclarations: [
      vectorSearchFn,
      dateUtilityFn,
      ...courseFunctions,
      ...enrollmentFunctions,
      ...lmsFunctions,
      ...appointmentsFunctions,
      ...notificationsFunctions,
      ...billingFunctions,
      ...progressFunctions,
      usersCountFn,
      usersAllMentorsListFn,
    ],
  },
];

// Update getToolsForRole to include progress functions for appropriate roles
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
            ...progressFunctions,
            vectorSearchFn,
            dateUtilityFn,
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
            ...progressFunctions,
            vectorSearchFn,
            dateUtilityFn,
            usersAllMentorsListFn,
          ],
        },
      ];
    default:
      return [];
  }
}
