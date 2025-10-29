import {
  Assignment,
  AssignmentSubmission,
  ContentProgress,
  CourseEnrollment,
  ModuleContent,
  Prisma,
  ProgressStatus,
} from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createAssignmentSubmissionData,
  createContentProgressData,
  createGradeRecordData,
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

  // Pre-calculate assignment submissions data for batch creation
  const assignmentSubmissionsToCreate: Prisma.AssignmentSubmissionCreateManyInput[] = [];
  const contentProgressToCreate: Prisma.ContentProgressCreateManyInput[] = [];
  const gradeRecordsToCreate: Prisma.GradeRecordCreateManyInput[] = [];

  // Track submissions to avoid duplicates (studentId-assignmentId)
  const submissionTracker = new Map<string, number>(); // Maps studentId-assignmentId to attempt count

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
        // Generate attempt number (1-3)
        const attemptNumber = 1; // Start with attempt 1 for simplicity
        submissionTracker.set(submissionKey, attemptNumber);

        assignmentSubmissionsToCreate.push({
          studentId,
          assignmentId: assignment.id,
          content: [
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
                      text: 'This is a seeded assignment submission with sample content.',
                    },
                  ],
                },
              ],
            },
          ],
          submittedAt: new Date(),
          lateDays: Math.random() < 0.15 ? Math.floor(Math.random() * 5) + 1 : 0,
          state: 'SUBMITTED',
          attemptNumber,
        });
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

        contentProgressToCreate.push({
          studentId,
          moduleId,
          moduleContentId: content.id,
          status,
          completedAt: status === ProgressStatus.COMPLETED ? new Date() : null,
          lastAccessedAt: new Date(),
        });
      }
    }
  }

  // Batch create assignment submissions
  let createdSubmissions: AssignmentSubmission[] = [];
  if (assignmentSubmissionsToCreate.length > 0) {
    try {
      await prisma.assignmentSubmission.createMany({
        data: assignmentSubmissionsToCreate,
      });

      // Fetch created submissions
      createdSubmissions = await prisma.assignmentSubmission.findMany({
        where: {
          studentId: {
            in: assignmentSubmissionsToCreate.map(s => s.studentId),
          },
        },
        include: {
          assignment: true,
          student: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        log('Warning: Some duplicate assignment submissions were skipped');
      } else {
        throw error;
      }
    }
  }

  // Batch create content progress records
  if (contentProgressToCreate.length > 0) {
    await prisma.contentProgress.createMany({
      data: contentProgressToCreate,
    });
  }

  // Create grade records for graded submissions
  for (const submission of createdSubmissions) {
    if (submission.state === 'GRADED') {
      gradeRecordsToCreate.push(createGradeRecordData(
        submission.studentId,
        true, // isAssignment
      ));
    }
  }

  // Batch create grade records
  if (gradeRecordsToCreate.length > 0) {
    await prisma.gradeRecord.createMany({
      data: gradeRecordsToCreate,
    });
  }

  // Fetch final data
  const finalSubmissions = await prisma.assignmentSubmission.findMany({
    where: {
      studentId: {
        in: enrollments.map(e => e.studentId),
      },
    },
    include: {
      assignment: true,
      student: true,
    },
  });

  const finalProgress = await prisma.contentProgress.findMany({
    where: {
      studentId: {
        in: enrollments.map(e => e.studentId),
      },
    },
    include: {
      student: true,
      module: true,
      moduleContent: true,
    },
  });

  const finalGrades = await prisma.gradeRecord.findMany({
    where: {
      studentId: {
        in: enrollments.map(e => e.studentId),
      },
    },
    include: {
      student: true,
    },
  });

  log(`-> Created ${finalSubmissions.length} assignment submissions.`);
  log(`-> Created ${finalProgress.length} content progress records.`);
  log(`-> Created ${finalGrades.length} grade records.`);

  return {
    assignmentSubmissions: finalSubmissions,
    contentProgress: finalProgress,
    gradeRecords: finalGrades,
  };
}
