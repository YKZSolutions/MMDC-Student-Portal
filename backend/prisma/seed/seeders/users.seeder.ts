import { PrismaClient, Role, User } from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import { createUserData } from '../factories/user.factory';
import { SupabaseService } from '../../../src/lib/supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '../../../src/config/env.schema';

const supabase = new SupabaseService(new ConfigService<EnvVars>());

export async function seedUsers(prisma: PrismaClient) {
  log('Seeding users...');
  const { TOTAL, ADMINS, MENTORS } = seedConfig.USERS;
  const userPromises: Promise<User>[] = [];

  const roleCounts: Record<Role, number> = {
    admin: 0,
    mentor: 0,
    student: 0,
  };

  for (let i = 0; i < TOTAL; i++) {
    let role: Role;
    if (i < ADMINS) role = Role.admin;
    else if (i < ADMINS + MENTORS) role = Role.mentor;
    else role = Role.student;

    roleCounts[role]++;

    // default base user data
    const baseUserData = createUserData(role, i);

    // if this is within the first 3 of that role, also create Supabase auth account
    if (roleCounts[role] <= 3) {
      const email = `${role}@tester.com`;
      const password = 'password';

      const account = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          status: 'active',
        },
      });

      if (account.error) {
        throw account.error;
      }

      const authUser = account.data.user;

      // attach authUid + email into userAccount relation
      userPromises.push(
        prisma.user.create({
          data: {
            ...baseUserData,
            role,
            userAccount: {
              create: {
                authUid: authUser.id,
                email: authUser.email!,
              },
            },
          },
        }),
      );
    } else {
      // normal user creation (no auth account)
      userPromises.push(
        prisma.user.create({
          data: {
            ...baseUserData,
            role,
          },
        }),
      );
    }
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
