import {
  Assignment,
  AssignmentSubmission,
  ContentProgress,
  CourseEnrollment,
  ModuleContent,
  ProgressStatus,
} from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createAssignmentSubmissionData,
  createContentProgressData,
} from '../factories/submission.factory';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedSubmissions(
  prisma: PrismaTransaction,
  enrollments: CourseEnrollment[],
  contents: ModuleContent[],
  assignments: Assignment[],
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

  // Get module sections to map contents to modules
  const moduleSections = await prisma.moduleSection.findMany({
    select: {
      id: true,
      moduleId: true,
    },
  });

  // Create a map for content-to-module lookup
  const contentModuleMap = new Map(
    contents.map((content) => {
      const moduleSection = moduleSections.find(
        (ms) => ms.id === content.moduleSectionId,
      );
      return [content.id, moduleSection?.moduleId];
    }),
  );

  const assignmentSubmissions: AssignmentSubmission[] = [];
  const contentProgress: ContentProgress[] = [];

  // Track submissions to avoid duplicates
  const submissionTracker = new Set<string>();

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
      // Get the module content to find the module
      const moduleContent = contents.find(
        (c) => c.id === assignment.moduleContentId,
      );
      if (!moduleContent) continue;

      const moduleId = contentModuleMap.get(moduleContent.id);
      if (!moduleId) continue;

      const moduleInfo = moduleMap.get(moduleId);
      if (!moduleInfo || !enrolledModules.some((m) => m.id === moduleId)) {
        continue;
      }

      // Create a unique key for this student+assignment combination
      const submissionKey = `${studentId}-${assignment.id}`;

      // Only create a submission if we haven't already created one for this student+assignment
      if (
        !submissionTracker.has(submissionKey) &&
        Math.random() < seedConfig.SUBMISSION_CHANCE
      ) {
        try {
          const submission = await prisma.assignmentSubmission.create({
            data: createAssignmentSubmissionData(studentId, assignment.id),
          });
          assignmentSubmissions.push(submission);
          submissionTracker.add(submissionKey); // Mark this combination as processed
        } catch (error) {
          // If there's still a unique constraint error, log it and continue
          if (error.code === 'P2002') {
            console.warn(
              `Duplicate submission attempted for student ${studentId} and assignment ${assignment.id}`,
            );
            continue;
          }
          throw error;
        }
      }
    }

    // Seed content progress
    for (const content of contents) {
      const moduleId = contentModuleMap.get(content.id);
      if (!moduleId) continue;

      if (!enrolledModules.some((m) => m.id === moduleId)) continue;

      if (Math.random() < seedConfig.PROGRESS_CHANCE) {
        const status =
          Math.random() > 0.3
            ? ProgressStatus.COMPLETED
            : ProgressStatus.IN_PROGRESS;

        try {
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
              ...createContentProgressData(studentId, moduleId, content.id),
              status,
              lastAccessedAt: new Date(),
            },
          });
          contentProgress.push(progress);
        } catch (error) {
          console.warn(
            `Error creating progress for student ${studentId} and content ${content.id}:`,
            error.message,
          );
        }
      }
    }
  }

  log(`-> Created ${assignmentSubmissions.length} assignment submissions.`);
  log(`-> Created ${contentProgress.length} content progress records.`);

  return {
    assignmentSubmissions,
    contentProgress,
  };
}
