import {
  Assignment,
  AssignmentSubmission,
  ContentProgress,
  CourseEnrollment,
  ModuleContent,
  PrismaClient,
  ProgressStatus,
  Quiz,
  QuizSubmission,
  SubmissionState,
} from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createAssignmentSubmissionData,
  createContentProgressData,
  createQuizSubmissionData,
} from '../factories/submission.factory';
import { faker } from '@faker-js/faker';

export async function seedSubmissions(
  prisma: PrismaClient,
  enrollments: CourseEnrollment[],
  contents: ModuleContent[],
  assignments: Assignment[],
  quizzes: Quiz[],
) {
  log('Seeding submissions and progress...');

  // Get all modules with their course offerings
  const modules = await prisma.module.findMany({
    select: {
      id: true,
      courseId: true,
      courseOfferingId: true,
    },
  });

  // Create a map for quick lookup
  const moduleMap = new Map(
    modules.map((m) => [
      m.id,
      { courseId: m.courseId, courseOfferingId: m.courseOfferingId },
    ]),
  );

  const assignmentSubmissions: AssignmentSubmission[] = [];
  const quizSubmissions: QuizSubmission[] = [];
  const contentProgress: ContentProgress[] = [];

  for (const enrollment of enrollments) {
    const studentId = enrollment.studentId;
    const offeringId = enrollment.courseOfferingId;

    // Get modules available for this enrollment
    const enrolledModules = modules.filter(
      (m) => m.courseOfferingId === offeringId,
    );

    if (enrolledModules.length === 0) continue;

    // Seed assignment submissions
    for (const assignment of assignments) {
      const moduleInfo = moduleMap.get(assignment.moduleContentId);
      if (
        !moduleInfo ||
        !enrolledModules.some((m) => m.id === assignment.moduleContentId)
      ) {
        continue;
      }

      if (Math.random() < seedConfig.SUBMISSION_CHANCE) {
        const submission = await prisma.assignmentSubmission.create({
          data: createAssignmentSubmissionData(studentId, assignment.id),
        });
        assignmentSubmissions.push(submission);
      }
    }

    // Seed quiz submissions
    for (const quiz of quizzes) {
      const moduleInfo = moduleMap.get(quiz.moduleContentId);
      if (
        !moduleInfo ||
        !enrolledModules.some((m) => m.id === quiz.moduleContentId)
      ) {
        continue;
      }

      if (Math.random() < seedConfig.SUBMISSION_CHANCE) {
        const submission = await prisma.quizSubmission.create({
          data: createQuizSubmissionData(studentId, quiz.id),
        });
        quizSubmissions.push(submission);
      }
    }

    // Seed content progress
    for (const content of contents) {
      if (!enrolledModules.some((m) => m.id === content.moduleId)) continue;

      if (Math.random() < seedConfig.PROGRESS_CHANCE) {
        const status =
          Math.random() > 0.3
            ? ProgressStatus.COMPLETED
            : ProgressStatus.IN_PROGRESS;

        const progress = await prisma.contentProgress.upsert({
          where: {
            studentId_moduleContentId: {
              studentId,
              moduleContentId: content.id,
            },
          },
          update: {
            status,
            ...(status === ProgressStatus.COMPLETED && {
              completedAt: new Date(),
            }),
            lastAccessedAt: new Date(),
          },
          create: {
            ...createContentProgressData(
              studentId,
              content.moduleId,
              content.id,
            ),
            status,
            lastAccessedAt: new Date(),
            timeSpent: faker.number.int({ min: 300, max: 3600 }), // 5-60 minutes
          },
        });
        contentProgress.push(progress);
      }
    }
  }

  log(`-> Created ${assignmentSubmissions.length} assignment submissions.`);
  log(`-> Created ${quizSubmissions.length} quiz submissions.`);
  log(`-> Created ${contentProgress.length} content progress records.`);

  return {
    assignmentSubmissions,
    quizSubmissions,
    contentProgress,
  };
}
