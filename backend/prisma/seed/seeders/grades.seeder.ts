import { SubmissionState } from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import { createGradeRecordData } from '../factories/submission.factory';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedGrades(
  prisma: PrismaTransaction,
  submissions: any[], // both assignment and quiz submissions
) {
  log('Seeding grades...');
  const allGradeRecords: any[] = [];

  for (const submission of submissions) {
    let isAssignment = false;

    // Only grade some submissions
    if (Math.random() < seedConfig.GRADING_CHANCE) {
      const gradeRecord = await prisma.gradeRecord.create({
        data: createGradeRecordData(submission.studentId, isAssignment),
      });

      if (gradeRecord) {
        allGradeRecords.push(gradeRecord);

        // also mark submission as graded
        await prisma.assignmentSubmission.update({
          where: { id: submission.id },
          data: { state: SubmissionState.GRADED },
        });
      }
    }
  }

  log(`-> Created ${allGradeRecords.length} grade records.`);
  return { gradeRecords: allGradeRecords };
}
