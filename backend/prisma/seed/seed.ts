// [file name]: seed.ts
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/users.seeder';
import { seedAcademics } from './seeders/academics.seeder';
import { seedEnrollments } from './seeders/enrollment.seeder';
import { seedModules } from './seeders/modules.seeder';
import { seedSubmissions } from './seeders/submissions.seeder';
import { seedBilling } from './seeders/billing.seeder';
import { seedNotifications } from './seeders/notifications.seeder';
import { seedGrades } from './seeders/grades.seeder';
import { seedSectionModules } from './seeders/section-modules.seeder';
import { seedDiscussions } from './seeders/discussions.seeder';
import { seedConfig } from './seed.config';
import { deleteAllData } from './utils/delete-all-data';
import { SupabaseService } from '../../src/lib/supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '../../src/config/env.schema';

const prisma = new PrismaClient();
const supabase = new SupabaseService(new ConfigService<EnvVars>());

async function main() {
  console.log('🌱 Starting seed...');

  if (seedConfig.DELETE_ALL_DATA) {
    await deleteAllData(prisma, supabase);
  }

  console.time('Database seeded in');

  // Step 1: Seed Users
  console.time('Seeded Users');
  const { users, admins, mentors, students } = await seedUsers(
    prisma,
    supabase,
  );
  console.timeEnd('Seeded Users');

  // Step 2: Seed Academics
  console.time('Seeded Academics');
  const { programs, majors, courses, curriculums } =
    await seedAcademics(prisma);
  console.timeEnd('Seeded Academics');

  // Step 3: Seed Enrollments
  console.time('Seeded Enrollments');
  const {
    enrollmentPeriods,
    courseOfferings,
    courseSections,
    courseEnrollments,
  } = await seedEnrollments(prisma, courses, mentors, students);
  console.timeEnd('Seeded Enrollments');

  // Step 4: Seed Modules and Content
  console.time('Seeded Modules');
  const { modules, contents, assignments, quizzes, discussions } =
    await seedModules(prisma, courses, courseOfferings);
  console.timeEnd('Seeded Modules');

  // Step 5: Link Sections to Modules
  console.time('Seeded Section Modules');
  await seedSectionModules(prisma, courseSections, modules);
  console.timeEnd('Seeded Section Modules');

  // Step 6: Seed Submissions & Progress
  console.time('Seeded Submissions & Progress');
  const { assignmentSubmissions, quizSubmissions, contentProgress } =
    await seedSubmissions(
      prisma,
      courseEnrollments,
      contents,
      assignments,
      quizzes,
    );
  console.timeEnd('Seeded Submissions & Progress');

  // Step 7: Seed Grades
  console.time('Seeded Grades');
  await seedGrades(prisma, [...assignmentSubmissions, ...quizSubmissions]);
  console.timeEnd('Seeded Grades');

  // Step 8: Seed Discussions
  console.time('Seeded Discussions');
  await seedDiscussions(prisma, discussions, students, mentors);
  console.timeEnd('Seeded Discussions');

  // Step 9: Seed Billing
  console.time('Seeded Billing');
  await seedBilling(prisma, students);
  console.timeEnd('Seeded Billing');

  // Step 10: Seed Notifications
  console.time('Seeded Notifications');
  await seedNotifications(prisma, users);
  console.timeEnd('Seeded Notifications');

  console.timeEnd('Database seeded in');
  console.log('✅ Seed completed successfully!');

  // Print summary
  console.log('\n📊 Seed Summary:');
  console.log(
    `👥 Users: ${users.length} (${admins.length} admins, ${mentors.length} mentors, ${students.length} students)`,
  );
  console.log(
    `🎓 Academics: ${programs.length} programs, ${majors.length} majors, ${courses.length} courses`,
  );
  console.log(
    `📚 Course Content: ${modules.length} modules, ${contents.length} content items`,
  );
  console.log(
    `📝 Submissions: ${assignmentSubmissions.length} assignments, ${quizSubmissions.length} quizzes`,
  );
  console.log(`📈 Progress: ${contentProgress.length} progress records`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
