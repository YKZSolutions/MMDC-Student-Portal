import { extendedPrismaClient } from '../../src/lib/prisma/prisma.extension';
import { seedUsers } from './seeders/users.seeder';
import { seedAcademics } from './seeders/academics.seeder';
import { seedEnrollments } from './seeders/enrollment.seeder';
import { seedModules } from './seeders/modules.seeder';
import { seedSubmissions } from './seeders/submissions.seeder';
import { seedBilling } from './seeders/billing.seeder';
import { seedNotifications } from './seeders/notifications.seeder';
import { seedGrades } from './seeders/grades.seeder';
import { seedSectionModules } from './seeders/section-modules.seeder';
import { seedConfig } from './seed.config';
import { deleteAllData } from './utils/delete-all-data';
import { SupabaseService } from '../../src/lib/supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '../../src/config/env.schema';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '../../src/lib/prisma/prisma.extension';

const prisma = new CustomPrismaService<ExtendedPrismaClient>(
  extendedPrismaClient,
);
const supabase = new SupabaseService(new ConfigService<EnvVars>());

async function main() {
  console.log('🌱 Starting seed...');

  // Increase the transaction timeout to 30 seconds
  await prisma.client.$transaction(
    async (tx) => {
      if (seedConfig.DELETE_ALL_DATA) {
        await deleteAllData(tx, supabase);
      }

      console.time('Database seeded in');

      // Step 1: Seed Users
      console.time('Seeded Users');
      const { users, admins, mentors, students } = await seedUsers(
        tx,
        supabase,
      );
      console.timeEnd('Seeded Users');

      if (!seedConfig.FRESH_DATA) {
        // Step 2: Seed Academics
        console.time('Seeded Academics');
        const { programs, majors, courses, curriculums } =
          await seedAcademics(tx);
        console.timeEnd('Seeded Academics');

        // Step 3: Seed Enrollments
        console.time('Seeded Enrollments');
        const {
          enrollmentPeriods,
          courseOfferings,
          courseSections,
          courseEnrollments,
        } = await seedEnrollments(tx, courses, mentors, students);
        console.timeEnd('Seeded Enrollments');

        // Step 4: Seed Modules and Content
        console.time('Seeded Modules');
        const { modules, contents, assignments } = await seedModules(
          tx,
          courses,
          courseOfferings,
        );
        console.timeEnd('Seeded Modules');

        // Step 5: Link Sections to Modules
        console.time('Seeded Section Modules');
        await seedSectionModules(tx, courseSections, modules);
        console.timeEnd('Seeded Section Modules');

        // Step 6: Seed Submissions & Progress
        console.time('Seeded Submissions & Progress');
        const { assignmentSubmissions, contentProgress } =
          await seedSubmissions(tx, courseEnrollments, contents, assignments);
        console.timeEnd('Seeded Submissions & Progress');

        // Step 7: Seed Grades
        console.time('Seeded Grades');
        await seedGrades(tx, [...assignmentSubmissions]);
        console.timeEnd('Seeded Grades');

        // Step 9: Seed Billing
        console.time('Seeded Billing');
        await seedBilling(tx, students);
        console.timeEnd('Seeded Billing');

        // Step 10: Seed Notifications
        console.time('Seeded Notifications');
        await seedNotifications(tx, users);
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
        console.log(`📈 Progress: ${contentProgress.length} progress records`);
      }
    },
    {
      timeout: 120000, // 120-second timeout
      maxWait: 30000, // Maximum wait time for the transaction
    },
  );
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.client.$disconnect();
  });
