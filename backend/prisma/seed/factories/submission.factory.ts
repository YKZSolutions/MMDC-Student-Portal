// prisma/seed/factories/submission.factory.ts
import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

export function createContentProgressData(
  userId: string,
  moduleId: string,
  moduleContentId: string,
): Prisma.ContentProgressCreateInput {
  return {
    user: { connect: { id: userId } },
    module: { connect: { id: moduleId } },
    moduleContent: { connect: { id: moduleContentId } },
    completedAt: Math.random() > 0.5 ? faker.date.recent() : null,
  };
}

export function createSubmissionData(
  studentId: string,
  moduleContentId: string,
  graderId: string,
): Prisma.SubmissionCreateInput {
  const isGraded = Math.random() > 0.3;
  return {
    title: `Submission for ${faker.lorem.words(2)}`,
    submission: faker.lorem.paragraphs(2),
    student: { connect: { id: studentId } },
    moduleContent: { connect: { id: moduleContentId } },
    submittedAt: faker.date.past(),
    ...(isGraded && {
      score: faker.number.int({ min: 60, max: 100 }),
      feedback: faker.lorem.sentence(),
      gradedAt: faker.date.recent(),
      grader: { connect: { id: graderId } },
    }),
    attachments: {
      create: {
        name: 'document.pdf',
        attachment: faker.internet.url(),
      },
    },
  };
}
