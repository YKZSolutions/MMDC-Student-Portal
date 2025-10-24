import { SubmissionState, Prisma } from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import { createGradeRecordData } from '../factories/submission.factory';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedGrades(
  prisma: PrismaTransaction,
  submissions: any[], // both assignment and quiz submissions
) {
  log('Seeding grades...');

  // Pre-calculate grade records data for batch creation
  const gradeRecordsToCreate: Prisma.GradeRecordCreateManyInput[] = [];
  const submissionsToUpdate: Array<{ id: string; state: SubmissionState }> = [];

  for (const submission of submissions) {
    // Only grade some submissions
    if (Math.random() < seedConfig.GRADING_CHANCE) {
      gradeRecordsToCreate.push(createGradeRecordData(submission.studentId, true));

      // Mark submission as graded
      submissionsToUpdate.push({
        id: submission.id,
        state: SubmissionState.GRADED,
      });
    }
  }

  // Batch create grade records
  if (gradeRecordsToCreate.length > 0) {
    await prisma.gradeRecord.createMany({
      data: gradeRecordsToCreate,
    });
  }

  // Batch update submissions to mark them as graded
  for (const update of submissionsToUpdate) {
    await prisma.assignmentSubmission.update({
      where: { id: update.id },
      data: { state: update.state },
    });
  }

  // Fetch created grade records
  const gradeRecords = await prisma.gradeRecord.findMany({
    where: {
      studentId: {
        in: submissions.map(s => s.studentId),
      },
    },
    include: {
      student: true,
    },
  });

  log(`-> Created ${gradeRecords.length} grade records.`);

  return { gradeRecords };
}
