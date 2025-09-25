import {
  Assignment,
  AssignmentSubmission,
  ContentProgress,
  CourseEnrollment,
  ModuleContent,
  PrismaClient,
  Quiz,
  QuizSubmission,
} from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createAssignmentSubmissionData,
  createContentProgressData,
  createQuizSubmissionData,
} from '../factories/submission.factory';

export async function seedSubmissions(
  prisma: PrismaClient,
  enrollments: CourseEnrollment[],
  contents: ModuleContent[],
  assignments: Assignment[],
  quizzes: Quiz[],
) {
  log('Seeding submissions and progress...');

  // Preload modules with both courseId and courseOfferingId
  const modules = await prisma.module.findMany({
    select: {
      id: true,
      courseId: true,
      courseOfferingId: true,
      moduleContents: true,
    },
  });

  // Map modules by id for quick lookup
  const moduleMap = new Map<
    string,
    { courseId: string | null; courseOfferingId: string | null }
  >();
  for (const m of modules) {
    moduleMap.set(m.id, {
      courseId: m.courseId,
      courseOfferingId: m.courseOfferingId,
    });
  }

  // Also preload courseOfferings to know which course they belong to
  const offerings = await prisma.courseOffering.findMany({
    select: { id: true, courseId: true },
  });
  const offeringMap = new Map<string, string>(); // offeringId -> courseId
  for (const o of offerings) {
    offeringMap.set(o.id, o.courseId);
  }

  // ---------------------------------------------------
  // Seeding submissions & progress
  // ---------------------------------------------------

  const assignmentSubmissions: AssignmentSubmission[] = [];
  const quizSubmissions: QuizSubmission[] = [];
  const contentProgress: ContentProgress[] = [];

  for (const enrollment of enrollments) {
    const studentId = enrollment.studentId;
    const offeringId = enrollment.courseOfferingId;
    const offeringCourseId = offeringMap.get(offeringId);
    if (!offeringCourseId) continue;

    // Get modules student can access (matching either offering or courseId)
    const enrolledModules = modules.filter(
      (m) =>
        m.courseOfferingId === offeringId ||
        (!m.courseOfferingId && m.courseId === offeringCourseId),
    );

    if (enrolledModules.length === 0) {
      log(
        `⚠️ No modules found for student=${studentId}, offering=${offeringId}`,
      );
      continue;
    }

    // Assignments (submissions)
    for (const assignment of assignments) {
      const mod = moduleMap.get(assignment.moduleContentId);
      if (!mod) continue;

      // Student only allowed if assignment's module is in enrolledModules
      if (!enrolledModules.some((em) => em.id === assignment.moduleContentId))
        continue;

      if (Math.random() < seedConfig.SUBMISSION_CHANCE) {
        const submission = await prisma.assignmentSubmission.create({
          data: createAssignmentSubmissionData(studentId, assignment.id),
        });
        assignmentSubmissions.push(submission);
      }
    }

    // Quiz (submissions)
    for (const quiz of quizzes) {
      const mod = moduleMap.get(quiz.moduleContentId);
      if (!mod) continue;

      if (!enrolledModules.some((em) => em.id === quiz.moduleContentId))
        continue;

      if (Math.random() < seedConfig.SUBMISSION_CHANCE) {
        const submission = await prisma.quizSubmission.create({
          data: createQuizSubmissionData(studentId, quiz.id),
        });
        quizSubmissions.push(submission);
      }
    }

    // Contents (progress)
    for (const content of contents) {
      if (!enrolledModules.some((em) => em.id === content.moduleId)) continue;

      if (Math.random() < seedConfig.PROGRESS_CHANCE) {
        const progress = await prisma.contentProgress.upsert({
          where: {
            studentId_moduleContentId: {
              studentId,
              moduleContentId: content.id,
            },
          },
          update: {}, // no updates, just keep existing
          create: createContentProgressData(
            studentId,
            content.moduleId,
            content.id,
          ),
        });
        contentProgress.push(progress);
      }
    }
  }

  log(`-> Created ${assignmentSubmissions.length} assignment submissions.`);
  log(`-> Created ${contentProgress.length} content progress records.`);

  return {
    quizSubmissions,
    contentProgress,
    assignmentSubmissions,
  };
}
