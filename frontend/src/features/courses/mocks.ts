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
import type { CourseGradebookForMentor, CourseGradebookForStudent, } from '@/features/courses/grades/types.ts'

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
          startTime: getPastDate(1),
          endTime: getFutureDate(1),
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
          startTime: getPastDate(1),
          endTime: getFutureDate(1),
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[1],
    academicTerm: mockTerms[1],
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
          startTime: getPastDate(1),
          endTime: getFutureDate(1),
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[2],
    academicTerm: mockTerms[2],
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
          startTime: getPastDate(1),
          endTime: getFutureDate(1),
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [
      {
        activityName: 'Assignment 1',
        dueTimestamp: getFutureDate(1),
      },
      {
        activityName: 'Assignment 2',
        dueTimestamp: getFutureDate(1),
      },
    ],
    program: mockAcademicPrograms[0],
    academicTerm: mockTerms[3],
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
    dueDate: getFutureDate(1),
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
    dueDate: getFutureDate(1),
    mode: 'group',
    points: 30,
    status: 'open',
    rubricId: 'rubric-1',
  },
  {
    id: 'assign-4',
    title: 'Project Milestone',
    type: 'milestone',
    dueDate: getFutureDate(1),
    mode: 'group',
    points: 40,
    status: 'closed',
  },
  {
    id: 'assign-5',
    title: 'Additional Exercise',
    type: 'other',
    dueDate: getFutureDate(1),
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
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: 1, // Represents an <h1> tag
      isToggleable: false,
    },
    content: [
      {
        type: 'text',
        text: 'Module 1: Introduction to Quantum Physics',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Welcome to the fascinating world of quantum physics! This module provides a foundational understanding of the principles that govern the universe at the smallest scales. We will explore the counterintuitive concepts that challenge our classical understanding of reality.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: 2, // Represents an <h2> tag
      isToggleable: false,
    },
    content: [
      {
        type: 'text',
        text: 'Learning Objectives',
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: 'd4e5f6a7-b8c9-0123-4567-890abcdef123',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Define the concept of wave-particle duality.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: "Explain Heisenberg's Uncertainty Principle.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Describe the significance of the Schrödinger equation.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'g7b8c9d0-e1f2-3456-7890-abcdef123456',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'For more information, please visit the ',
        styles: {},
      },
      {
        type: 'link',
        href: 'https://www.example-course.com/quantum-physics',
        content: [
          {
            type: 'text',
            text: 'Official Course Page',
            styles: {},
          },
        ],
      },
      {
        type: 'text',
        text: '.',
        styles: {},
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

export const mockStudentGradebook: CourseGradebookForStudent = {
  courseId: 'course_001',
  studentId: 'student_101',
  studentName: 'Alice Johnson',
  assignments: [
    // Scenario 1: Graded assignment with multiple attempts
    {
      assignmentId: 'assign_001',
      assignmentTitle: 'Introduction to React',
      points: 100,
      dueDate: '2023-10-15T23:59:59Z',
      submissions: [
        {
          submissionStatus: 'draft',
          submissionLink: 'https://example.com/submission/draft1',
          submittedAt: '2023-10-10T14:30:00Z',
          attemptNumber: 1,
          isLate: false,
        },
        {
          submissionStatus: 'graded',
          submissionLink: 'https://example.com/submission/final',
          submittedAt: '2023-10-15T22:45:00Z',
          attemptNumber: 2,
          isLate: false,
          grade: {
            id: 'grade_001',
            assignmentId: 'assign_001',
            submissionId: 'sub_002',
            studentId: 'student_101',
            score: 95,
            maxScore: 100,
            feedback:
              'Excellent work! Your component structure was well thought out.',
            gradedBy: 'mentor_001',
            gradedAt: '2023-10-17T10:30:00Z',
            released: true,
          },
        },
      ],
      currentGrade: {
        score: 95,
        maxScore: 100,
        feedback:
          'Excellent work! Your component structure was well thought out.',
        gradedAt: '2023-10-17T10:30:00Z',
      },
    },
    // Scenario 2: Ready for grading (submitted but not graded yet)
    {
      assignmentId: 'assign_002',
      assignmentTitle: 'Project Proposal',
      points: 50,
      dueDate: '2023-10-25T23:59:59Z',
      submissions: [
        {
          submissionStatus: 'ready-for-grading',
          submissionLink: 'https://example.com/proposal/submission',
          submittedAt: '2023-10-24T15:20:00Z',
          attemptNumber: 1,
          isLate: false,
        },
      ],
    },
    // Scenario 3: Pending (not submitted yet)
    {
      assignmentId: 'assign_003',
      assignmentTitle: 'Database Schema Design',
      points: 75,
      dueDate: '2023-11-05T23:59:59Z',
      submissions: [
        {
          submissionStatus: 'pending',
          attemptNumber: 0,
          isLate: false,
        },
      ],
    },
    // Scenario 4: Late submission with penalty
    {
      assignmentId: 'assign_004',
      assignmentTitle: 'API Implementation',
      points: 100,
      dueDate: '2023-10-20T23:59:59Z',
      submissions: [
        {
          submissionStatus: 'graded',
          submissionLink: 'https://example.com/api/submission',
          submittedAt: '2023-10-22T09:15:00Z', // 2 days late
          attemptNumber: 1,
          isLate: true,
          lateDays: 2,
          grade: {
            id: 'grade_004',
            assignmentId: 'assign_004',
            submissionId: 'sub_004',
            studentId: 'student_101',
            score: 82, // Penalty applied
            maxScore: 100,
            feedback:
              'Good implementation but late submission resulted in 10% penalty.',
            gradedBy: 'mentor_001',
            gradedAt: '2023-10-23T14:20:00Z',
            released: true,
          },
        },
      ],
      currentGrade: {
        score: 82,
        maxScore: 100,
        feedback:
          'Good implementation but late submission resulted in 10% penalty.',
        gradedAt: '2023-10-23T14:20:00Z',
      },
    },
    // Scenario 5: Group assignment
    {
      assignmentId: 'assign_005',
      assignmentTitle: 'Team Project',
      points: 200,
      dueDate: '2023-11-10T23:59:59Z',
      submissions: [
        {
          submissionStatus: 'graded',
          submissionLink: 'https://example.com/team-project',
          submittedAt: '2023-11-10T20:30:00Z',
          attemptNumber: 1,
          isLate: false,
          grade: {
            id: 'grade_005',
            assignmentId: 'assign_005',
            submissionId: 'sub_005',
            groupId: 'group_001',
            groupMemberIds: ['student_101', 'student_102', 'student_103'],
            score: 185,
            maxScore: 200,
            feedback: 'Excellent collaboration and project execution.',
            gradedBy: 'mentor_001',
            gradedAt: '2023-11-12T11:45:00Z',
            released: true,
          },
        },
      ],
      currentGrade: {
        score: 185,
        maxScore: 200,
        feedback: 'Excellent collaboration and project execution.',
        gradedAt: '2023-11-12T11:45:00Z',
      },
    },
  ],
  totalScore: 362, // 95 + 82 + 185 (only graded assignments)
  totalMaxScore: 400, // 100 + 100 + 200 (only graded assignments)
  gpaEquivalent: 3.6,
}

// --- Mock Data (Mentor) ---
export const mockMentorGradebook: CourseGradebookForMentor = {
  courseId: 'course_001',
  assignments: [
    {
      assignmentId: 'assign_001',
      assignmentTitle: 'Introduction to React',
      points: 100,
      dueDate: '2023-10-15T23:59:59Z',
      submissions: [
        {
          studentId: 'student_101',
          studentName: 'Alice Johnson',
          submissionStatus: 'graded',
          submissionTimestamp: '2023-10-15T22:45:00Z',
          grade: {
            score: 95,
            maxScore: 100,
            feedback:
              'Excellent work! Your component structure was well thought out.',
            gradedAt: '2023-10-17T10:30:00Z',
          },
        },
        {
          studentId: 'student_102',
          studentName: 'Bob Smith',
          submissionStatus: 'graded',
          submissionTimestamp: '2023-10-15T21:30:00Z',
          grade: {
            score: 88,
            maxScore: 100,
            feedback:
              'Good effort. Consider using more React hooks for state management.',
            gradedAt: '2023-10-17T11:15:00Z',
          },
        },
        {
          studentId: 'student_103',
          studentName: 'Charlie Brown',
          submissionStatus: 'pending',
        },
        {
          studentId: 'student_104',
          studentName: 'Diana Prince',
          submissionStatus: 'graded',
          submissionTimestamp: '2023-10-16T09:30:00Z', // Late submission
          grade: {
            score: 76,
            maxScore: 100,
            feedback: 'Good work but late submission with penalty applied.',
            gradedAt: '2023-10-17T14:20:00Z',
          },
        },
      ],
    },
    {
      assignmentId: 'assign_002',
      assignmentTitle: 'Project Proposal',
      points: 50,
      dueDate: '2023-10-25T23:59:59Z',
      submissions: [
        {
          studentId: 'student_101',
          studentName: 'Alice Johnson',
          submissionStatus: 'ready-for-grading',
          submissionTimestamp: '2023-10-24T15:20:00Z',
        },
        {
          studentId: 'student_102',
          studentName: 'Bob Smith',
          submissionStatus: 'submitted',
          submissionTimestamp: '2023-10-25T20:45:00Z',
        },
        {
          studentId: 'student_104',
          studentName: 'Diana Prince',
          submissionStatus: 'draft',
          submissionTimestamp: '2023-10-25T18:30:00Z',
        },
      ],
    },
    {
      assignmentId: 'assign_005',
      assignmentTitle: 'Team Project',
      points: 200,
      dueDate: '2023-11-10T23:59:59Z',
      submissions: [
        {
          studentId: 'student_101',
          studentName: 'Alice Johnson',
          submissionStatus: 'graded',
          submissionTimestamp: '2023-11-10T20:30:00Z',
          grade: {
            score: 185,
            maxScore: 200,
            feedback: 'Excellent collaboration and project execution.',
            gradedAt: '2023-11-12T11:45:00Z',
          },
        },
        {
          studentId: 'student_102',
          studentName: 'Bob Smith',
          submissionStatus: 'graded',
          submissionTimestamp: '2023-11-10T20:30:00Z',
          grade: {
            score: 185,
            maxScore: 200,
            feedback: 'Excellent collaboration and project execution.',
            gradedAt: '2023-11-12T11:45:00Z',
          },
        },
        {
          studentId: 'student_103',
          studentName: 'Charlie Brown',
          submissionStatus: 'graded',
          submissionTimestamp: '2023-11-10T20:30:00Z',
          grade: {
            score: 185,
            maxScore: 200,
            feedback: 'Excellent collaboration and project execution.',
            gradedAt: '2023-11-12T11:45:00Z',
          },
        },
      ],
    },
  ],
}
