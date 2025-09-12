import { faker } from '@faker-js/faker';
import {
  AssignmentMode,
  AssignmentStatus,
  AssignmentType,
  ContentType,
  Prisma,
} from '@prisma/client';
import { pickRandomEnum } from '../utils/helpers';
import { seedConfig } from '../seed.config';

export function createModuleData(
  courseId: string,
  publishedById: string,
): Prisma.ModuleCreateInput {
  return {
    title: `Module: ${faker.lorem.words(3)}`,
    course: { connect: { id: courseId } },
    publishedAt: faker.date.past(),
    publishedByUser: { connect: { id: publishedById } },
  };
}

export function createModuleSectionData(
  moduleId: string,
  publishedById: string,
  order: number,
  parentSectionId?: string,
): Prisma.ModuleSectionCreateInput {
  return {
    title: `Section: ${faker.lorem.words(2)}`,
    order,
    module: { connect: { id: moduleId } },
    publishedAt: faker.date.past(),
    publishedByUser: { connect: { id: publishedById } },
    ...(parentSectionId && {
      parentSection: { connect: { id: parentSectionId } },
    }),
  };
}

export function createModuleContentData(
  moduleId: string,
  moduleSectionId: string,
  publishedById: string,
  order: number,
): Prisma.ModuleContentCreateInput {
  const contentType =
    Math.random() < seedConfig.ASSIGNMENT_CHANCE
      ? ContentType.ASSIGNMENT
      : pickRandomEnum(ContentType);

  return {
    title: `${contentType}: ${faker.lorem.words(3)}`,
    order,
    contentType,
    content: {
      type: 'text',
      value: faker.lorem.paragraphs({ min: 1, max: 4 }),
    },
    module: { connect: { id: moduleId } },
    moduleSection: { connect: { id: moduleSectionId } },
    publishedAt: faker.date.past(),
    publishedByUser: { connect: { id: publishedById } },
    ...(contentType === ContentType.ASSIGNMENT && {
      assignment: {
        create: createAssignmentData(),
      },
    }),
  };
}

export function createAssignmentData(): Prisma.AssignmentCreateWithoutModuleContentInput {
  return {
    title: faker.lorem.sentence(),
    rubric: { criteria: 'Clarity, Accuracy, Timeliness' },
    type: pickRandomEnum(AssignmentType),
    mode: pickRandomEnum(AssignmentMode),
    status: pickRandomEnum(AssignmentStatus),
    dueDate: faker.date.future(),
    points: 100,
    allowLateSubmission: Math.random() > 0.5,
    allowResubmission: Math.random() > 0.5,
  };
}