import { PrismaClient, SubmissionState } from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import { createGradeRecordData } from '../factories/submission.factory';

export async function seedGrades(
  prisma: PrismaClient,
  submissions: any[], // both assignment and quiz submissions
) {
  log('Seeding grades...');
  const allGradeRecords: any[] = [];

  for (const submission of submissions) {
    // Resolve grading config depending on submission type
    let gradingId: string | null = null;
    let isAssignment = false;

    if (submission.assignmentId) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: submission.assignmentId },
        include: { grading: true },
      });
      if (assignment?.grading) {
        gradingId = assignment.grading.id;
        isAssignment = true;
      }
    }

    if (submission.quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: { id: submission.quizId },
        include: { grading: true },
      });
      if (quiz?.grading) {
        gradingId = quiz.grading.id;
        isAssignment = false;
      }
    }

    if (!gradingId) continue;

    // Only grade some submissions
    if (Math.random() < seedConfig.GRADING_CHANCE) {
      const gradeRecord = await prisma.gradeRecord.create({
        data: createGradeRecordData(
          gradingId,
          submission.studentId,
          isAssignment,
        ),
      });

      if (gradeRecord) {
        allGradeRecords.push(gradeRecord);

        // also mark submission as graded
        if ('quiz' in submission) {
          await prisma.quizSubmission.update({
            where: { id: submission.id },
            data: { state: SubmissionState.GRADED },
          });
        } else {
          await prisma.assignmentSubmission.update({
            where: { id: submission.id },
            data: { state: SubmissionState.GRADED },
          });
        }
      }
    }
  }

  log(`-> Created ${allGradeRecords.length} grade records.`);
  return { gradeRecords: allGradeRecords };
}
