import {PrismaClient} from '@prisma/client';
import {log} from '../utils/helpers';
import {seedConfig} from '../seed.config';
import {createAssignmentGradeRecordData} from '../factories/submission.factory';

export async function seedGrades(
  prisma: PrismaClient,
  assignmentSubmissions: any[],
) {
  log('Seeding grades...');
  const allGradeRecords: any[] = [];

  for (const submission of assignmentSubmissions) {
    // Find the assignment for this submission
    const assignment = await prisma.assignment.findUnique({
      where: { id: submission.assignmentId },
      include: { grading: true },
    });

    if (!assignment || !assignment.grading) continue;

    // Only grade some submissions based on config
    if (Math.random() < seedConfig.GRADING_CHANCE) {
      const gradeRecord = await prisma.assignmentGradeRecord.create({
        data: createAssignmentGradeRecordData(
          assignment.grading.id,
          submission.studentId,
        ),
      });

      if (gradeRecord) {
        allGradeRecords.push(gradeRecord);
      }
    }
  }

  log(`-> Created ${allGradeRecords.length} grade records.`);
  return { gradeRecords: allGradeRecords };
}