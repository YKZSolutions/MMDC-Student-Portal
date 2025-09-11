import { PrismaClient, Role, User } from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import { createUserData } from '../factories/user.factory';

export async function seedUsers(prisma: PrismaClient) {
  log('Seeding users...');
  const { TOTAL, ADMINS, MENTORS } = seedConfig.USERS;
  const studentCount = TOTAL - ADMINS - MENTORS;

  const userPromises: Promise<User>[] = [];

  for (let i = 0; i < TOTAL; i++) {
    let role: Role;
    if (i < ADMINS) role = Role.admin;
    else if (i < ADMINS + MENTORS) role = Role.mentor;
    else role = Role.student;

    userPromises.push(
      prisma.user.create({
        data: createUserData(role, i),
      }),
    );
  }

  const users = await Promise.all(userPromises);
  const admins = users.filter((u) => u.role === 'admin');
  const mentors = users.filter((u) => u.role === 'mentor');
  const students = users.filter((u) => u.role === 'student');

  log(`-> Created ${users.length} users.`);
  log(`   - ${admins.length} Admins`);
  log(`   - ${mentors.length} Mentors`);
  log(`   - ${students.length} Students`);

  return { users, admins, mentors, students };
}
