import type { CourseBasicDetails } from '@/features/courses/types.ts'
import type { Block } from '@blocknote/core'
import {
  convertModuleToTreeData,
  getFutureDate,
  getPastDate,
} from '@/utils/helpers.ts'
import type {
  AssignmentBase,
  StudentAssignment,
} from '@/features/courses/assignments/types.ts'
import type { Module } from '@/features/courses/modules/types.ts'

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
export const mockAssignmentsData: StudentAssignment[] = [
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
    submissionTimestamp: getPastDate(1),
  },
  {
    ...mockAssignmentBase[3],
    submissionStatus: 'ready-for-grading',
    submissionTimestamp: getPastDate(1),
  },
  {
    ...mockAssignmentBase[4],
    submissionStatus: 'graded',
    submissionTimestamp: getPastDate(1),
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
    submissionTimestamp: getPastDate(1),
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
export const mockInitialContentString = JSON.stringify(mockInitialContent)

export const mockModule: Module = {
  id: 'module-1',
  courseCode: 'MO-IT200',
  courseName: 'Web Technology Applications',
  courseSection: 'A',
  sections: [
    // Section 1: Introduction to Course
    {
      id: 'section-1',
      title: 'Introduction to Course',
      order: 1,
      items: [
        {
          id: 'lesson-1',
          type: 'lesson',
          title: 'Welcome Lesson',
          order: 1,
          content: mockInitialContentString,
        },
        {
          id: 'assignment-1',
          type: 'assignment',
          title: 'Introduction Quiz',
          order: 2,
          assignment: mockAssignmentBase[0],
        },
      ],
    },

    // Section 2: Core Concepts with a subsection
    {
      id: 'section-2',
      title: 'Core Concepts',
      order: 2,
      items: [],
      subsections: [
        {
          id: 'subsection-2-1',
          title: 'Basic Principles',
          order: 1,
          items: [
            {
              id: 'lesson-2',
              type: 'lesson',
              title: 'Programming Basics',
              order: 1,
              content: mockInitialContentString,
              prerequisites: ['lesson-1'],
            },
            {
              id: 'assignment-2',
              type: 'assignment',
              title: 'First Code Assignment',
              order: 2,
              assignment: mockAssignmentBase[1],
            },
            {
              id: 'discussion-1',
              type: 'discussion',
              title: 'Q&A Forum',
              order: 3,
              content: 'Discuss questions about basic concepts here',
            },
          ],
        },
      ],
    },

    // Section 3: Advanced Topics
    {
      id: 'section-3',
      title: 'Advanced Topics',
      order: 3,
      items: [
        {
          id: 'assignment-3',
          type: 'assignment',
          title: 'Final Project Draft',
          order: 1,
          assignment: mockAssignmentBase[2],
        },
        {
          id: 'assignment-4',
          type: 'assignment',
          title: 'Project Milestone',
          order: 2,
          assignment: mockAssignmentBase[3],
        },
        {
          id: 'url-1',
          type: 'url',
          title: 'External Resources',
          order: 3,
          content: 'https://example.com/resources',
        },
        {
          id: 'file-1',
          type: 'file',
          title: 'Course Materials',
          order: 4,
          content: '/uploads/course-materials.pdf',
        },
        {
          id: 'assignment-5',
          type: 'assignment',
          title: 'Additional Exercise',
          order: 5,
          content: mockInitialContentString,
          assignment: mockAssignmentBase[4],
        },
      ],
    },
  ],
}

// Create the student mock module (uses StudentAssignment)
export const mockStudentModule: Module = {
  ...mockModule,
  sections: mockModule.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.type === 'assignment' && item.assignment) {
        // Find the corresponding student assignment
        const studentAssignment = mockAssignmentsData.find(
          (a) => a.id === item.assignment!.id,
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
        if (item.type === 'assignment' && item.assignment) {
          // Find the corresponding student assignment
          const studentAssignment = mockAssignmentsData.find(
            (a) => a.id === item.assignment!.id,
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

// Generate the tree data from the modules
export const mockModuleTreeData = convertModuleToTreeData(mockModule)
export const mockStudentTreeData = convertModuleToTreeData(mockStudentModule)
