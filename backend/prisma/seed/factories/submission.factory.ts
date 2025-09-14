import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { mockContent } from '../constants/mockBlockNoteContent';
import { seedConfig } from '../seed.config';

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

export function createAssignmentSubmissionData(
  studentId: string,
  assignmentId: string,
): Prisma.AssignmentSubmissionCreateInput {
  const isLate = Math.random() < seedConfig.LATE_SUBMISSION_CHANCE;
  return {
    student: { connect: { id: studentId } },
    assignment: { connect: { id: assignmentId } },
    content: mockContent,
    submittedAt: faker.date.past(),
    lateDays: isLate ? faker.number.int({ min: 0, max: 10 }) : null,
    attachments: {
      create: {
        name: 'document.pdf',
        fileUrl: faker.internet.url(),
        type: 'document',
        size: faker.number.int({ min: 1000, max: 100000 }),
      },
    },
  };
}

export function createAssignmentGradeRecordData(
  gradingId: string,
  studentId: string,
): Prisma.AssignmentGradeRecordCreateInput {
  return {
    grading: { connect: { id: gradingId } },
    student: { connect: { id: studentId } },
    rawScore: faker.number.int({ min: 60, max: 100 }),
    finalScore: faker.number.int({ min: 60, max: 100 }),
    grade: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
    feedback: faker.lorem.sentence(),
    rubricScores: {
      create: Array.from({ length: 5 }, () => ({
        criterionKey: faker.word.words(),
        label: faker.lorem.sentence(),
        maxPoints: faker.number.int({ min: 60, max: 100 }),
        score: faker.number.int({ min: 60, max: 100 }),
      })),
    },
  };
}

export function createQuizSubmissionData(
  studentId: string,
  quizId: string,
): Prisma.QuizSubmissionCreateInput {
  const isGraded = Math.random() < seedConfig.GRADING_CHANCE;
  return {
    student: { connect: { id: studentId } },
    quiz: { connect: { id: quizId } },
    answers: {
      create: Array.from({ length: 5 }, () => ({
        questionId: faker.string.uuid(),
        answer: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
      })),
    },
    submittedAt: faker.date.past(),
    ...(isGraded && {
      rawScore: faker.number.int({ min: 60, max: 100 }),
      questionResults: {
        create: Array.from({ length: 5 }, () => ({
          questionId: faker.string.uuid(),
          answer: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
          score: faker.number.int({ min: 60, max: 100 }),
          feedback: faker.lorem.sentence(),
        })),
      },
    }),
  };
}
