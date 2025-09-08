import type {
  AcademicProgram,
  AcademicTerm,
  Course,
  CourseBasicDetails,
  EnrolledCourse,
} from '@/features/courses/types.ts'
import type { Block } from '@blocknote/core'
import { getFutureDate, getPastDate } from '@/utils/helpers.ts'
import type {
  AssignmentBase,
  AssignmentSubmissionReport,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type { Module } from '@/features/courses/modules/types.ts'
import type { StudentModule } from '@/features/courses/modules/student/types.ts'
import type { MentorModule } from '@/features/courses/modules/mentor/types.ts'
import type { AdminModule } from '@/features/courses/modules/admin/types.ts'

export const mockCourseBasicDetails: CourseBasicDetails[] = [
  {
    courseCode: 'MO-IT200',
    courseName: 'Web Technology Applications',
  },
  {
    courseCode: 'MO-IT351',
    courseName: 'Data Structures & Algorithms',
  },
  {
    courseCode: 'MO-IT400',
    courseName: 'Capstone 1',
  },
  {
    courseCode: 'MO-IT500',
    courseName: 'Capstone 2',
  },
]

export const mockTerms: AcademicTerm[] = [
  {
    termId: 'termId1',
    schoolYear: 'SY 2024-2025',
    term: 'Term 1',
    isCurrent: false,
  },
  {
    termId: 'termId2',
    schoolYear: 'SY 2024-2025',
    term: 'Term 2',
    isCurrent: false,
  },
  {
    termId: 'termId3',
    schoolYear: 'SY 2024-2025',
    term: 'Term 3',
    isCurrent: false,
  },
  {
    termId: 'termId4',
    schoolYear: 'SY 2025-2026',
    term: 'Term 1',
    isCurrent: true,
  },
]

export const mockAcademicPrograms: AcademicProgram[] = [
  {
    program: 'Bachelor of Science in Information Technology',
    programCode: 'BSIT',
    major: 'Software Development',
    majorCode: 'SD',
  },
  {
    program: 'Bachelor of Science in Computer Science',
    programCode: 'BSCS',
    major: 'Software Engineering',
    majorCode: 'SE',
  },
  {
    program: 'Bachelor of Science in Information Systems',
    programCode: 'BSIS',
    major: 'Information Systems',
    majorCode: 'IS',
  },
]

// TODO: Consider adding program and/or department and major to the course data
// TODO: Course types might also be necessary such as 'General Education', 'Specialization', etc.
export const mockCourseData: Course[] = [
  {
    courseName: 'Web Technology Applications',
    courseCode: 'MO-IT200',
    programs: mockAcademicPrograms,
    academicTerms: [mockTerms[0]],
  },
  {
    courseName: 'Data Structures and Algorithms',
    courseCode: 'MO-IT351',
    programs: mockAcademicPrograms,
    academicTerms: [mockTerms[1]],
  },

  {
    courseName: 'Capstone 1',
    courseCode: 'MO-IT400',
    programs: mockAcademicPrograms,
    academicTerms: [mockTerms[2]],
  },
  {
    courseName: 'Capstone 2',
    courseCode: 'MO-IT500',
    programs: mockAcademicPrograms,
    academicTerms: [mockTerms[3]],
  },
]

export const mockEnrolledCourse: EnrolledCourse[] = [
  {
    courseName: 'Web Technology Applications',
    courseCode: 'MO-IT200',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'MWF',
        time: '10:00 - 11:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T10:00',
          endTimeStamp: '2023-08-20T11:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[0],
    academicTerm: mockTerms[0],
  },
  {
    courseName: 'Data Structures and Algorithms',
    courseCode: 'MO-IT351',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'TTHS',
        time: '10:00 - 11:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T10:00',
          endTimeStamp: '2023-08-20T11:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[1],
    academicTerm: mockTerms[0],
  },

  {
    courseName: 'Capstone 1',
    courseCode: 'MO-IT400',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'MWF',
        time: '8:00 - 9:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T15:45',
          endTimeStamp: '2023-08-20T22:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[2],
    academicTerm: mockTerms[1],
  },
  {
    courseName: 'Capstone 2',
    courseCode: 'MO-IT500',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'TTHS',
        time: '8:00 - 9:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2025-08-23T00:00',
          endTimeStamp: '2025-08-29T23:59',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [
      {
        activityName: 'Assignment 1',
        dueTimestamp: '2025-08-20T23:59:59',
      },
      {
        activityName: 'Assignment 2',
        dueTimestamp: '2025-08-20T23:59:59',
      },
    ],
    program: mockAcademicPrograms[0],
    academicTerm: mockTerms[2],
  },
]

export const mockAssignmentBase: AssignmentBase[] = [
  {
    id: 'assign-1',
    title: 'Introduction Quiz',
    type: 'quiz',
    dueDate: '2024-06-15T23:59:59Z',
    mode: 'individual',
    points: 10,
    status: 'open',
  },
  {
    id: 'assign-2',
    title: 'First Code Assignment',
    type: 'assignment',
    dueDate: '2024-06-20T23:59:59Z',
    mode: 'individual',
    points: 20,
    status: 'open',
    allowResubmission: true,
    maxAttempts: 3,
  },
  {
    id: 'assign-3',
    title: 'Final Project Draft',
    type: 'draft',
    dueDate: '2024-07-01T23:59:59Z',
    mode: 'group',
    points: 30,
    status: 'open',
    rubricId: 'rubric-1',
  },
  {
    id: 'assign-4',
    title: 'Project Milestone',
    type: 'milestone',
    dueDate: '2024-07-15T23:59:59Z',
    mode: 'group',
    points: 40,
    status: 'closed',
  },
  {
    id: 'assign-5',
    title: 'Additional Exercise',
    type: 'other',
    dueDate: '2024-07-20T23:59:59Z',
    mode: 'individual',
    status: 'open',
    allowLateSubmission: true,
  },
]

// Student assignments with submission data
export const mockStudentAssignments: StudentAssignment[] = [
  {
    ...mockAssignmentBase[0],
    submissionStatus: 'pending',
  },
  {
    ...mockAssignmentBase[1],
    submissionStatus: 'draft',
  },
  {
    ...mockAssignmentBase[2],
    submissionStatus: 'submitted',
    submittedAt: getPastDate(1),
  },
  {
    ...mockAssignmentBase[3],
    submissionStatus: 'ready-for-grading',
    submittedAt: getPastDate(1),
  },
  {
    ...mockAssignmentBase[4],
    submissionStatus: 'graded',
    submittedAt: getPastDate(1),
    grade: {
      id: 'grade-1',
      assignmentId: 'assign-5',
      studentId: 'stud1',
      score: 90,
      maxScore: 100,
      feedback: 'Great job!',
      gradedBy: 'teacher1',
      gradedAt: getPastDate(1),
    },
  },
  {
    id: 'assign-6',
    title: 'Graded Group Project',
    type: 'milestone',
    dueDate: getFutureDate(2),
    mode: 'group',
    status: 'open',
    submissionStatus: 'graded',
    submittedAt: getPastDate(1),
    grade: {
      id: 'grade-2',
      assignmentId: 'assign-6',
      groupId: 'grp1',
      groupMemberIds: ['stud1', 'stud2', 'stud3'],
      score: 90,
      maxScore: 100,
      feedback: 'Great job!',
      gradedBy: 'teacher1',
      gradedAt: getPastDate(1),
    },
  },
  {
    id: 'assign-7',
    title: 'Late',
    type: 'assignment',
    dueDate: getPastDate(1),
    mode: 'individual',
    status: 'open',
    submissionStatus: 'pending',
  },
  {
    id: 'assign-8',
    title: 'Missed',
    type: 'assignment',
    dueDate: getPastDate(1),
    mode: 'individual',
    status: 'closed',
    submissionStatus: 'pending',
  },
]

// Mock of AssignmentSubmissionReport
export const mockAssignmentSubmissionReports: AssignmentSubmissionReport[] = [
  {
    ...mockAssignmentBase[0],
    submissions: [],
  },
  {
    ...mockAssignmentBase[1],
    submissions: [
      {
        studentId: 'stud1',
        studentName: 'Student 1',
        submissionStatus: 'submitted',
        submittedAt: getPastDate(1),
        grade: 95,
      },
      {
        groupId: 'grp2',
        members: ['stud2', 'stud3', 'stud4'],
        submissionStatus: 'graded',
        submittedAt: getPastDate(1),
        grade: 85,
      },
    ],
  },
  {
    ...mockAssignmentBase[2],
    submissions: [
      {
        studentId: 'stud1',
        studentName: 'Student 1',
        submissionStatus: 'graded',
        submittedAt: getPastDate(1),
        grade: 90,
      },
      {
        groupId: 'grp3',
        members: ['stud2', 'stud3', 'stud4'],
        submissionStatus: 'graded',
        submittedAt: getPastDate(1),
        grade: 80,
      },
    ],
  },
  {
    ...mockAssignmentBase[3],
    submissions: [
      {
        studentId: 'stud1',
        studentName: 'Student 1',
        submissionStatus: 'ready-for-grading',
        submittedAt: getPastDate(1),
        grade: null,
      },
      {
        groupId: 'grp4',
        members: ['stud2', 'stud3', 'stud4'],
        submissionStatus: 'ready-for-grading',
        submittedAt: getPastDate(1),
        grade: null,
      },
    ],
  },
]

export const mockInitialContent: Block[] = [
  {
    id: 'block-1',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Hello! This is the initial content.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'link-1',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'link',
        href: 'https://www.blocknotejs.org/',
        content: [
          {
            type: 'text',
            text: 'Home Page',
            styles: {},
          },
        ],
      },
    ],
    children: [],
  },
]

export const mockModule: Module = {
  id: 'module-1',
  courseCode: 'MO-IT200',
  courseName: 'Web Technology Applications',
  courseSection: 'A',
  published: {
    isPublished: true,
    publishedAt: new Date().toISOString(),
  },
  sections: [
    // Section 1: Introduction to Course
    {
      id: 'section-1',
      parentId: 'module-1',
      title: 'Introduction to Course',
      order: 1,
      items: [],
      published: {
        isPublished: true,
        publishedAt: new Date().toISOString(),
      },
      subsections: [
        {
          id: 'subsection-1-1',
          parentId: 'section-1',
          title: 'Onboarding',
          order: 1,
          published: {
            isPublished: true,
            publishedAt: new Date().toISOString(),
          },
          items: [
            {
              id: 'lesson-1',
              parentId: 'subsection-1-1',
              type: 'lesson',
              title: 'Welcome Lesson',
              order: 1,
              content: mockInitialContent,
              published: {
                isPublished: true,
                publishedAt: new Date().toISOString(),
              },
            },
            {
              id: 'assignment-1',
              parentId: 'subsection-1-1',
              type: 'assignment',
              title: 'Introduction Quiz',
              order: 2,
              assignment: mockAssignmentBase[0],
              published: {
                isPublished: true,
                publishedAt: new Date().toISOString(),
              },
            },
          ],
          subsections: [],
        },
      ],
    },

    // Section 2: Core Concepts with a subsection
    {
      id: 'section-2',
      title: 'Core Concepts',
      order: 2,
      parentId: 'module-1',
      items: [],
      published: {
        isPublished: true,
        publishedAt: new Date().toISOString(),
      },
      subsections: [
        {
          id: 'subsection-2-1',
          title: 'Basic Principles',
          order: 1,
          parentId: 'section-2',
          published: {
            isPublished: true,
            publishedAt: new Date().toISOString(),
          },
          items: [
            {
              id: 'lesson-2',
              type: 'lesson',
              title: 'Programming Basics',
              order: 1,
              content: mockInitialContent,
              parentId: 'subsection-2-1',
              prerequisites: ['lesson-1'],
              published: {
                isPublished: true,
                publishedAt: new Date().toISOString(),
              },
            },
            {
              id: 'assignment-2',
              type: 'assignment',
              title: 'First Code Assignment',
              order: 2,
              parentId: 'subsection-2-1',
              assignment: mockAssignmentBase[1],
              published: {
                isPublished: true,
                publishedAt: new Date().toISOString(),
              },
            },
            {
              id: 'discussion-1',
              type: 'discussion',
              title: 'Q&A Forum',
              order: 3,
              parentId: 'subsection-2-1',
              content: mockInitialContent,
              published: {
                isPublished: true,
                publishedAt: new Date().toISOString(),
              },
            },
          ],
          subsections: [],
        },
      ],
    },

    // Section 3: Advanced Topics
    {
      id: 'section-3',
      title: 'Advanced Topics',
      order: 3,
      parentId: 'module-1',
      items: [],
      published: {
        isPublished: false,
      },
      subsections: [
        {
          id: 'subsection-4-1',
          title: 'Final Project',
          order: 1,
          parentId: 'section-3',
          published: {
            isPublished: false,
          },
          items: [
            {
              id: 'assignment-3',
              type: 'assignment',
              title: 'Final Project Draft',
              order: 1,
              parentId: 'subsection-4-1',
              assignment: mockAssignmentBase[2],
              published: {
                isPublished: false,
              },
            },
            {
              id: 'assignment-4',
              type: 'assignment',
              title: 'Project Milestone',
              order: 2,
              parentId: 'subsection-4-1',
              assignment: mockAssignmentBase[3],
              published: {
                isPublished: false,
              },
            },
            {
              id: 'url-1',
              type: 'url',
              title: 'External Resources',
              order: 3,
              parentId: 'subsection-4-1',
              url: 'https://example.com/resources',
              published: {
                isPublished: false,
              },
            },
            {
              id: 'file-1',
              type: 'file',
              title: 'Course Materials',
              order: 4,
              parentId: 'subsection-4-1',
              url: '/uploads/course-materials.pdf',
              published: {
                isPublished: false,
              },
            },
            {
              id: 'assignment-5',
              type: 'assignment',
              title: 'Additional Exercise',
              order: 5,
              parentId: 'subsection-4-1',
              content: mockInitialContent,
              assignment: mockAssignmentBase[4],
              published: {
                isPublished: false,
              },
            },
          ],
          subsections: [],
        },
      ],
    },
  ],
}

// Student module view with progress data
export const mockStudentModule: StudentModule = {
  ...mockModule,
  studentProgress: {
    overallProgress: 65,
    completedItems: 13,
    totalItems: 20,
    overdueItems: 1,
  },
  sections: mockModule.sections.map((section) => ({
    ...section,
    items: section.items?.map((item) => {
      if (item.type === 'lesson') {
        return {
          ...item,
          progress: {
            contentId: item.id,
            isCompleted: Math.random() > 0.3, // Random completion status for demo
            completedAt:
              Math.random() > 0.5 ? new Date().toISOString() : undefined,
          },
        }
      } else if (item.type === 'assignment') {
        const studentAssignment = mockStudentAssignments.find(
          (a) => a.id === item.assignment?.id,
        )
        return {
          ...item,
          assignment: studentAssignment || item.assignment,
        }
      }
      return item
    }),
    subsections: section.subsections?.map((subsection) => ({
      ...subsection,
      items: subsection.items.map((item) => {
        if (item.type === 'lesson') {
          return {
            ...item,
            progress: {
              contentId: item.id,
              isCompleted: Math.random() > 0.3, // Random completion status for demo
              completedAt:
                Math.random() > 0.5 ? new Date().toISOString() : undefined,
            },
          }
        } else if (item.type === 'assignment') {
          const studentAssignment = mockStudentAssignments.find(
            (a) => a.id === item.assignment?.id,
          )
          return {
            ...item,
            assignment: studentAssignment || item.assignment,
          }
        }
        return item
      }),
    })),
  })),
}

// Mentor module view with section statistics
export const mockMentorModule: MentorModule = {
  ...mockModule,
  sectionStats: [
    {
      sectionId: 'section-1',
      averageProgress: 75,
      completedStudents: 15,
      totalStudents: 20,
    },
    {
      sectionId: 'section-2',
      averageProgress: 60,
      completedStudents: 12,
      totalStudents: 20,
    },
    {
      sectionId: 'section-3',
      averageProgress: 45,
      completedStudents: 9,
      totalStudents: 20,
    },
  ],
}

// Admin module view with editing permissions
export const mockAdminModule: AdminModule = {
  ...mockModule,
  editingPermissions: {
    canPublish: true,
    canSchedule: true,
    canDelete: true,
  },
}

// Helper function to get appropriate mock based on role
export const getMockModuleByRole = (
  role: string,
): Module | StudentModule | MentorModule | AdminModule => {
  switch (role) {
    case 'student':
      return mockStudentModule
    case 'mentor':
      return mockMentorModule
    case 'admin':
      return mockAdminModule
    default:
      return mockModule
  }
}
