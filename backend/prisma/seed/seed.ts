import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/users.seeder';
import { seedAcademics } from './seeders/academics.seeder';
import { seedEnrollments } from './seeders/enrollment.seeder';
import { seedModules } from './seeders/modules.seeder';
import { seedSubmissions } from './seeders/submissions.seeder';
import { seedBilling } from './seeders/billing.seeder';
import { seedNotifications } from './seeders/notifications.seeder';
import { seedGrades } from './seeders/grades.seeder';
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

  // --- SEEDING ---
  console.time('Database seeded in');

  console.time('Seeded Users');
  const { users, admins, mentors, students } = await seedUsers(
    prisma,
    supabase,
  );
  console.timeEnd('Seeded Users');

  console.time('Seeded Academics');
  const { courses } = await seedAcademics(prisma);
  console.timeEnd('Seeded Academics');

  console.time('Seeded Enrollments');
  const { courseEnrollments, courseOfferings } = await seedEnrollments(
    prisma,
    courses,
    mentors,
    students,
  );
  console.timeEnd('Seeded Enrollments');

  console.time('Seeded Modules');
  const { contents, assignments, quizzes } = await seedModules(
    prisma,
    courses,
    courseOfferings,
  );
  console.timeEnd('Seeded Modules');

  console.time('Seeded Submissions & Progress');
  const { assignmentSubmissions } = await seedSubmissions(
    prisma,
    courseEnrollments,
    contents,
    assignments,
    quizzes,
  );
  console.timeEnd('Seeded Submissions & Progress');

  console.time('Seeded Grades');
  await seedGrades(prisma, assignmentSubmissions);
  console.timeEnd('Seeded Grades');

  console.time('Seeded Billing');
  await seedBilling(prisma, students);
  console.timeEnd('Seeded Billing');

  console.time('Seeded Notifications');
  await seedNotifications(prisma, users);
  console.timeEnd('Seeded Notifications');

  console.timeEnd('Database seeded in');
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
