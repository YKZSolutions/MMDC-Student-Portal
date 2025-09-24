import { PrismaClient, Role, User } from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import { createUserData } from '../factories/user.factory';
import { SupabaseService } from '../../../src/lib/supabase/supabase.service';

export async function seedUsers(
  prisma: PrismaClient,
  supabase: SupabaseService,
) {
  log('Seeding users...');
  const { TOTAL, ADMINS, MENTORS } = seedConfig.USERS;

  // Track whether we've already created an auth account for each role
  const authCreated: Record<Role, boolean> = {
    admin: false,
    mentor: false,
    student: false,
  };

  const users: User[] = [];

  for (let i = 0; i < TOTAL; i++) {
    let role: Role;
    if (i < ADMINS) role = Role.admin;
    else if (i < ADMINS + MENTORS) role = Role.mentor;
    else role = Role.student;

    const baseUserData = createUserData(role, i);

    if (!authCreated[role] && seedConfig.CREATE_USER_ACCOUNTS) {
      // First time we hit this role → create auth account
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

      const user = await prisma.user.create({
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
      });

      await supabase.auth.admin.updateUserById(account.data.user.id, {
        user_metadata: {
          user_id: user.id,
        },
      });

      users.push(user);
      authCreated[role] = true; // mark as done
    } else {
      // Normal DB user (no auth)
      const user = await prisma.user.create({
        data: {
          ...baseUserData,
          role,
        },
      });
      users.push(user);
    }
  }

  const admins = users.filter((u) => u.role === Role.admin);
  const mentors = users.filter((u) => u.role === Role.mentor);
  const students = users.filter((u) => u.role === Role.student);

  log(`-> Created ${users.length} users.`);
  log(`   - ${admins.length} Admins`);
  log(`   - ${mentors.length} Mentors`);
  log(`   - ${students.length} Students`);

  return { users, admins, mentors, students };
}
