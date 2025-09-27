import { PrismaClient } from '@prisma/client';
import { SupabaseService } from '../../../src/lib/supabase/supabase.service';
import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';

async function confirmDeletion(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    // Set raw mode to get keypresses immediately
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    console.log(
      '⚠️ WARNING: This will delete ALL data in the database. Are you sure you want to continue? (Y/N)',
    );

    // Handle keypress events
    const onKeyPress = (str: string, key: any) => {
      // Clean up
      process.stdin.off('keypress', onKeyPress);
      process.stdin.setRawMode(false);
      rl.close();

      const char = str.toLowerCase();
      console.log(char); // Echo the pressed key
      resolve(char === 'y');
    };

    // Set up the keypress listener
    readline.emitKeypressEvents(process.stdin);
    process.stdin.on('keypress', onKeyPress);
  });
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
    // Grades and submissions
    prisma.gradeRecord.deleteMany(),
    prisma.assignmentSubmission.deleteMany(),
    prisma.quizSubmission.deleteMany(),

    // Discussion and forum related
    prisma.discussionPost.deleteMany(),
    prisma.discussion.deleteMany(),

    // Content progress tracking
    prisma.contentProgress.deleteMany(),

    // Assignments
    prisma.assignment.deleteMany(),

    // Quizzes
    prisma.quiz.deleteMany(),

    // Grading configs
    prisma.gradingConfig.deleteMany(),

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
    prisma.notificationReceipt.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.staffDetails.deleteMany(),
    prisma.studentDetails.deleteMany(),
    prisma.userDetails.deleteMany(),
    prisma.userAccount.deleteMany(),
    prisma.user.deleteMany(),

    // Billing and payments
    prisma.billPayment.deleteMany(),
    prisma.billInstallment.deleteMany(),
    prisma.bill.deleteMany(),
    prisma.pricing.deleteMany(),
    prisma.pricingGroup.deleteMany(),
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
