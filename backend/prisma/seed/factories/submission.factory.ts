import { faker } from '@faker-js/faker';
import { Prisma, SubmissionState } from '@prisma/client';
import { seedConfig } from '../seed.config';

export function createContentProgressData(
  userId: string,
  moduleId: string,
  moduleContentId: string,
): Prisma.ContentProgressCreateInput {
  return {
    student: { connect: { id: userId } },
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
  const state = faker.helpers.arrayElement([
    SubmissionState.SUBMITTED,
    SubmissionState.UNDER_REVIEW,
    SubmissionState.GRADED,
    SubmissionState.RETURNED,
  ]);

  const submissionContent = [
    {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Assignment Submission' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: faker.lorem.paragraphs(
                faker.number.int({ min: 2, max: 5 }),
              ),
            },
          ],
        },
        {
          type: 'codeBlock',
          attrs: { language: 'javascript' },
          content: [
            {
              type: 'text',
              text: '// Code solution here\nfunction solve() {\n  return "solution";\n}',
            },
          ],
        },
      ],
    },
  ];

  return {
    student: { connect: { id: studentId } },
    assignment: { connect: { id: assignmentId } },
    content: submissionContent, // Now this is an array
    submittedAt: faker.date.recent({ days: 7 }),
    lateDays: isLate ? faker.number.int({ min: 1, max: 5 }) : 0,
    state,
    attemptNumber: faker.number.int({ min: 1, max: 3 }),
    attachments: {
      create:
        Math.random() > 0.5
          ? [
              {
                name: 'solution.pdf',
                url: faker.internet.url(),
                type: 'document',
                size: faker.number.int({ min: 1000, max: 5000000 }),
              },
              ...(Math.random() > 0.7
                ? [
                    {
                      name: 'code.zip',
                      url: faker.internet.url(),
                      type: 'archive',
                      size: faker.number.int({ min: 5000, max: 20000000 }),
                    },
                  ]
                : []),
            ]
          : undefined,
    },
  };
}

export function createGradeRecordData(
  studentId: string,
  isAssignment: boolean,
): Prisma.GradeRecordCreateInput {
  const rawScore = faker.number.int({
    min: seedConfig.MIN_SCORE,
    max: seedConfig.MAX_SCORE, // Fixed: was MIN_SCORE, should be MAX_SCORE
  });
  const finalScore = isAssignment ? rawScore : rawScore; // Could apply a curve here

  const grade =
    finalScore >= 90
      ? 'A'
      : finalScore >= 80
        ? 'B'
        : finalScore >= 70
          ? 'C'
          : finalScore >= 60
            ? 'D'
            : 'F';

  return {
    // Simplified since we don't have the extra fields in the schema
    student: { connect: { id: studentId } },
    rawScore,
    finalScore,
    grade,
    feedback: faker.helpers.arrayElement([
      'Excellent work! Well done.',
      'Good job, but could use more detail.',
      'Solid effort, some areas need improvement.',
      'Please review the feedback and resubmit.',
      'Outstanding analysis and presentation.',
    ]),
    gradedAt: faker.date.recent(),
  };
}
