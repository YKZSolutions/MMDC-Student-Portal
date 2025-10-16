import { faker } from '@faker-js/faker';
import { AssignmentMode, ContentType, Prisma } from '@prisma/client';
import { pickRandom, pickRandomEnum } from '../utils/helpers';

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
  moduleSectionId: string,
  order: number,
  contentType: ContentType,
): Prisma.ModuleContentCreateInput {
  const assignmentTitles = [
    'Assignment 1: Introduction to Programming',
    'Assignment 2: Data Structures and Algorithms',
    'Assignment 3: Object-Oriented Programming',
    'Assignment 4: Database Management Systems',
  ];
  const lessonTitles = [
    'Lesson 1: Introduction to Programming',
    'Lesson 2: Data Structures and Algorithms',
    'Lesson 3: Object-Oriented Programming',
    'Lesson 4: Database Management Systems',
  ];
  return {
    order,
    contentType,
    moduleSection: { connect: { id: moduleSectionId } },
    publishedAt: faker.date.recent({ days: 10 }),
    title:
      contentType === ContentType.ASSIGNMENT
        ? pickRandom(assignmentTitles)
        : pickRandom(lessonTitles),
  };
}

export function createAssignmentData(
  moduleContentId: string,
): Prisma.AssignmentCreateInput {
  return {
    moduleContent: { connect: { id: moduleContentId } },
    mode: pickRandomEnum(AssignmentMode),
    dueDate: faker.date.soon({ days: 30 }),
    allowLateSubmission: Math.random() > 0.3,
    maxAttempts: faker.helpers.arrayElement([1, 2, 3]),
    latePenalty:
      Math.random() > 0.7
        ? faker.number.float({ min: 5, max: 20, fractionDigits: 1 })
        : null,
    maxScore: faker.number.int({ min: 10, max: 100 }),
  };
}
