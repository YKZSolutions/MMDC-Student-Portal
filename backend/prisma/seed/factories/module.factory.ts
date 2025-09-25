import { faker } from '@faker-js/faker';
import { AssignmentMode, ContentType, Prisma } from '@prisma/client';
import { pickRandomEnum } from '../utils/helpers';
import { mockContent } from '../constants/mockBlockNoteContent';
import { mockRubrics } from '../constants/mockRubrics';
import { mockQuizQuestions } from '../constants/mockQuizQuestions';

const MODULE_TITLES = [
  'Introduction and Fundamentals',
  'Core Concepts and Principles',
  'Advanced Topics and Applications',
  'Project Development and Implementation',
  'Review and Final Assessment',
];

const SECTION_TITLES = [
  'Getting Started',
  'Key Concepts',
  'Practical Applications',
  'Advanced Techniques',
  'Case Studies',
  'Hands-on Exercises',
  'Review and Assessment',
];

export function createModuleData(
  courseId: string,
  courseOfferingId: string,
  index: number,
): Prisma.ModuleCreateInput {
  return {
    title: `Module ${index + 1}: ${MODULE_TITLES[index] || faker.helpers.arrayElement(MODULE_TITLES)}`,
    course: { connect: { id: courseId } },
    courseOffering: { connect: { id: courseOfferingId } },
    publishedAt: faker.date.recent({ days: 30 }),
  };
}

export function createModuleSectionData(
  moduleId: string,
  order: number,
  parentSectionId?: string,
): Prisma.ModuleSectionCreateInput {
  const title = parentSectionId
    ? `Topic ${order}: ${faker.lorem.words(2)}`
    : `Section ${order}: ${SECTION_TITLES[order - 1] || faker.helpers.arrayElement(SECTION_TITLES)}`;

  return {
    title,
    order,
    module: { connect: { id: moduleId } },
    ...(parentSectionId && {
      parentSection: { connect: { id: parentSectionId } },
    }),
    publishedAt: faker.date.recent({ days: 20 }),
  };
}

export function createModuleContentData(
  moduleId: string,
  moduleSectionId: string,
  order: number,
  contentType: ContentType,
): Prisma.ModuleContentCreateInput {
  return {
    order,
    contentType,
    module: { connect: { id: moduleId } },
    moduleSection: { connect: { id: moduleSectionId } },
    publishedAt: faker.date.recent({ days: 10 }),
  };
}

export function createGradingConfigData(
  isAssignment: boolean,
): Prisma.GradingConfigCreateInput {
  return {
    weight: faker.number.float({ min: 0.1, max: 1, fractionDigits: 1 }),
    isCurved: Math.random() > 0.8,
    curveSettings: Math.random() > 0.8 ? { adjustment: 5 } : null,
    ...(isAssignment
      ? { rubricSchema: mockRubrics }
      : {
          questionRules: {
            MCQ: { points: 1, penalty: 0.25, allowPartialCredit: false },
            Essay: { points: 10, allowPartialCredit: true },
          },
        }),
  };
}

export function createAssignmentData(
  moduleContentId: string,
  gradingId: string,
  moduleIndex: number,
): Prisma.AssignmentCreateInput {
  const assignmentTitles = [
    'Programming Exercise: Basic Algorithms',
    'Database Design Project',
    'Web Application Development',
    'Research Paper on Current Trends',
    'Final Project Implementation',
  ];

  return {
    moduleContent: { connect: { id: moduleContentId } },
    grading: { connect: { id: gradingId } },
    title:
      assignmentTitles[moduleIndex] ||
      `Assignment ${moduleIndex + 1}: ${faker.lorem.words(3)}`,
    content: mockContent,
    mode: pickRandomEnum(AssignmentMode),
    dueDate: faker.date.soon({ days: 30 }),
    allowLateSubmission: Math.random() > 0.3,
    maxAttempts: faker.helpers.arrayElement([1, 2, 3]),
    latePenalty:
      Math.random() > 0.7
        ? faker.number.float({ min: 5, max: 20, fractionDigits: 1 })
        : null,
  };
}

export function createQuizData(
  moduleContentId: string,
  gradingId: string,
  moduleIndex: number,
): Prisma.QuizCreateInput {
  const quizTitles = [
    'Chapter 1 Knowledge Check',
    'Midterm Assessment',
    'Weekly Quiz',
    'Concept Review',
    'Final Examination',
  ];

  return {
    moduleContent: { connect: { id: moduleContentId } },
    grading: { connect: { id: gradingId } },
    title: quizTitles[moduleIndex] || `Quiz ${moduleIndex + 1}`,
    content: mockContent,
    dueDate: faker.date.soon({ days: 21 }),
    questions: mockQuizQuestions,
    allowLateSubmission: false,
    timeLimit: faker.number.int({ min: 30, max: 120 }),
    maxAttempts: faker.helpers.arrayElement([1, 2]),
  };
}

export function createLessonData(
  moduleContentId: string,
  sectionIndex: number,
): Prisma.LessonCreateInput {
  const lessonTopics = [
    'Introduction to Key Concepts',
    'Deep Dive into Core Principles',
    'Practical Implementation Guide',
    'Advanced Techniques and Methods',
    'Real-world Applications',
  ];

  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: lessonTopics[sectionIndex] || `Lesson ${sectionIndex + 1}`,
    subtitle: `Understanding ${faker.lorem.words(2)} in depth`,
    content: mockContent,
  };
}

export function createVideoData(
  moduleContentId: string,
): Prisma.VideoCreateInput {
  const videoTopics = [
    'Introduction Lecture',
    'Concept Explanation',
    'Step-by-Step Tutorial',
    'Expert Interview',
    'Case Study Analysis',
  ];

  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: faker.helpers.arrayElement(videoTopics),
    subtitle: `Video resource for ${faker.lorem.words(2)}`,
    content: mockContent,
    url: 'https://example.com/educational-video',
    duration: faker.number.int({ min: 300, max: 3600 }), // 5-60 minutes
    transcript: faker.lorem.paragraphs(3),
  };
}

export function createExternalUrlData(
  moduleContentId: string,
): Prisma.ExternalUrlCreateInput {
  const resourceTypes = [
    'Documentation',
    'Research Paper',
    'Tutorial',
    'Reference Guide',
    'Interactive Resource',
  ];

  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: `${faker.helpers.arrayElement(resourceTypes)}: ${faker.lorem.words(2)}`,
    subtitle: 'Additional learning resource',
    content: mockContent,
    url: faker.internet.url(),
  };
}

export function createFileResourceData(
  moduleContentId: string,
): Prisma.FileResourceCreateInput {
  const fileTypes = [
    { name: 'lecture_notes.pdf', type: 'Lecture Notes' },
    { name: 'textbook_chapter.docx', type: 'Textbook Chapter' },
    { name: 'code_examples.zip', type: 'Code Examples' },
    { name: 'research_paper.pdf', type: 'Research Paper' },
    { name: 'assignment_template.docx', type: 'Template' },
  ];

  const fileType = faker.helpers.arrayElement(fileTypes);

  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: fileType.type,
    subtitle: `Downloadable resource for ${faker.lorem.words(2)}`,
    content: mockContent,
    name: fileType.name,
    path: `/resources/${fileType.name}`,
    size: faker.number.int({ min: 1000, max: 5000000 }),
    mimeType: fileType.name.endsWith('.pdf')
      ? 'application/pdf'
      : fileType.name.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/zip',
  };
}

export function createDiscussionData(
  moduleContentId: string,
): Prisma.DiscussionCreateInput {
  const discussionTopics = [
    'Key Concepts Discussion',
    'Case Study Analysis',
    'Project Ideas Brainstorming',
    'Q&A Session',
    'Weekly Reflection',
  ];

  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: faker.helpers.arrayElement(discussionTopics),
    subtitle: 'Share your thoughts and learn from peers',
    content: mockContent,
    isThreaded: true,
    requirePost: Math.random() > 0.5,
  };
}
