import { PrismaClient } from '@prisma/client';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { SupabaseService } from '../../../src/lib/supabase/supabase.service';

async function confirmDeletion(): Promise<boolean> {
  const rl = readline.createInterface({ input, output });

  try {
    const answer = await rl.question(
      '⚠️ WARNING: This will delete ALL data in the database. Are you sure you want to continue? (Y/N) ',
    );
    return answer.toLowerCase() === 'Y';
  } finally {
    rl.close();
  }
}

export async function deleteAllData(
  prisma: PrismaClient,
  supabase: SupabaseService,
) {
  const shouldProceed = await confirmDeletion();

  if (!shouldProceed) {
    console.log('❌ Operation cancelled. No data was deleted.');
    return;
  }

  console.log('⚠️ Deleting all data...');

  // Order matters due to foreign key constraints!
  await prisma.$transaction([
    // Grade-related records
    prisma.assignmentGradeRecord.deleteMany(),
    prisma.assignmentGrading.deleteMany(),

    // Submission records
    prisma.assignmentSubmission.deleteMany(),
    prisma.quizSubmission.deleteMany(),

    // Discussion and forum related
    prisma.discussionPost.deleteMany(),
    prisma.discussion.deleteMany(),

    // Content progress tracking
    prisma.contentProgress.deleteMany(),

    // Assignment and quiz questions
    prisma.assignment.deleteMany(),
    prisma.quiz.deleteMany(),

    // Module content
    prisma.lesson.deleteMany(),
    prisma.video.deleteMany(),
    prisma.externalUrl.deleteMany(),
    prisma.fileResource.deleteMany(),

    // Module structure
    prisma.sectionModule.deleteMany(),
    prisma.moduleContent.deleteMany(),
    prisma.moduleSection.deleteMany(),
    prisma.module.deleteMany(),

    // Groups and memberships
    prisma.groupMember.deleteMany(),
    prisma.group.deleteMany(),

    // Course enrollments and sections
    prisma.courseEnrollment.deleteMany(),
    prisma.courseSection.deleteMany(),

    // Course offerings and periods
    prisma.courseOffering.deleteMany(),
    prisma.enrollmentPeriod.deleteMany(),

    // Curriculum and courses
    prisma.curriculumCourse.deleteMany(),
    prisma.curriculum.deleteMany(),
    prisma.course.deleteMany(),

    // Programs and majors
    prisma.major.deleteMany(),
    prisma.program.deleteMany(),

    // User-related data
    prisma.notification.deleteMany(),
    prisma.staffDetails.deleteMany(),
    prisma.studentDetails.deleteMany(),
    prisma.userDetails.deleteMany(),
    prisma.userAccount.deleteMany(),
    prisma.user.deleteMany(),

    // Billing and payments
    prisma.pricing.deleteMany(),
    prisma.pricingGroup.deleteMany(),
    prisma.bill.deleteMany(),
  ]);

  // 2. Delete Supabase auth users
  console.log('⚠️ Deleting all Supabase auth users...');
  const { data, error } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (error) {
    console.error('❌ Failed to list Supabase users:', error.message);
  } else {
    for (const user of data.users) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error(`❌ Failed to delete user ${user.id}:`, delError.message);
      } else {
        console.log(`🗑️ Deleted Supabase auth user ${user.email || user.id}`);
      }
    }
  }

  console.log('✅ All data deleted successfully!');
}
