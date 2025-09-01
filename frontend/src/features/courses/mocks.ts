import type { CourseBasicDetails } from '@/features/courses/types.ts'
import type { Block } from '@blocknote/core'

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
]
