import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/users.seeder';
import { seedAcademics } from './seeders/academics.seeder';
import { seedEnrollments } from './seeders/enrollment.seeder';
import { seedModules } from './seeders/modules.seeder';
import { seedSubmissions } from './seeders/submissions.seeder';
import { seedBilling } from './seeders/billing.seeder';
import { seedNotifications } from './seeders/notifications.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // --- SEEDING ---
  console.time('Database seeded in');

  console.time('Seeded Users');
  const { users, admins, mentors, students } = await seedUsers(prisma);
  console.timeEnd('Seeded Users');

  console.time('Seeded Academics');
  const { courses } = await seedAcademics(prisma);
  console.timeEnd('Seeded Academics');

  console.time('Seeded Enrollments');
  const { courseEnrollments } = await seedEnrollments(
    prisma,
    courses,
    mentors,
    students,
  );
  console.timeEnd('Seeded Enrollments');

  console.time('Seeded Modules');
  const { contents, assignments } = await seedModules(prisma, courses, mentors);
  console.timeEnd('Seeded Modules');

  console.time('Seeded Submissions & Progress');
  await seedSubmissions(
    prisma,
    mentors,
    courseEnrollments,
    contents,
    assignments,
  );
  console.timeEnd('Seeded Submissions & Progress');

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
