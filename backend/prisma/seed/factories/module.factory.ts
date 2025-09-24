import { faker } from '@faker-js/faker';
import { AssignmentMode, ContentType, Prisma } from '@prisma/client';
import { pickRandomEnum } from '../utils/helpers';
import { mockContent } from '../constants/mockBlockNoteContent';
import { mockRubrics } from '../constants/mockRubrics';
import { mockQuizQuestions } from '../constants/mockQuizQuestions';

export function createModuleData(
  courseId: string,
  courseOfferingId: string,
): Prisma.ModuleCreateInput {
  return {
    title: `Module: ${faker.lorem.words(3)}`,
    course: { connect: { id: courseId } },
    courseOffering: { connect: { id: courseOfferingId } },
    publishedAt: faker.date.past(),
  };
}

export function createModuleSectionData(
  moduleId: string,
  order: number,
  parentSectionId?: string,
): Prisma.ModuleSectionCreateInput {
  return {
    title: `Section: ${faker.lorem.words(2)}`,
    order,
    module: { connect: { id: moduleId } },
    ...(parentSectionId && {
      parentSection: { connect: { id: parentSectionId } },
    }),
    publishedAt: faker.date.past(),
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
    publishedAt: faker.date.past(),
  };
}

export function createAssignmentGradingData(): Prisma.AssignmentGradingCreateInput {
  return {
    gradingSchema: mockRubrics,
    weight: faker.number.float({ min: 0.1, max: 1 }),
    isCurved: Math.random() > 0.5,
  };
}

export function createAssignmentData(
  moduleContentId: string,
  gradingId: string,
): Prisma.AssignmentCreateInput {
  return {
    moduleContent: { connect: { id: moduleContentId } },
    grading: { connect: { id: gradingId } },
    title: faker.lorem.sentence(),
    content: mockContent,
    mode: pickRandomEnum(AssignmentMode),
    dueDate: faker.date.future(),
    allowLateSubmission: Math.random() > 0.5,
  };
}

export function createQuizData(
  moduleContentId: string,
): Prisma.QuizCreateInput {
  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: faker.lorem.sentence(),
    content: mockContent,
    dueDate: faker.date.future(),
    questions: mockQuizQuestions,
    allowLateSubmission: Math.random() > 0.5,
  };
}

export function createLessonData(
  moduleContentId: string,
): Prisma.LessonCreateInput {
  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: faker.lorem.sentence(),
    subtitle: faker.lorem.sentence(),
    content: mockContent,
  };
}

export function createVideoData(
  moduleContentId: string,
): Prisma.VideoCreateInput {
  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: faker.lorem.sentence(),
    subtitle: faker.lorem.sentence(),
    content: mockContent,
    url: faker.internet.url(),
    duration: faker.number.int({ min: 60, max: 3600 }),
  };
}

export function createExternalUrlData(
  moduleContentId: string,
): Prisma.ExternalUrlCreateInput {
  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: faker.lorem.sentence(),
    subtitle: faker.lorem.sentence(),
    content: mockContent,
    url: faker.internet.url(),
  };
}

export function createFileResourceData(
  moduleContentId: string,
): Prisma.FileResourceCreateInput {
  return {
    moduleContent: { connect: { id: moduleContentId } },
    title: faker.lorem.sentence(),
    subtitle: faker.lorem.sentence(),
    content: mockContent,
    name: faker.system.fileName(),
    path: faker.system.filePath(),
    size: faker.number.int({ min: 1000, max: 1000000 }),
    mimeType: faker.system.mimeType(),
  };
}
