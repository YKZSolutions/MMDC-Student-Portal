import { Prisma, Role } from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createUserData,
  createUserAccountData,
  createUserDetailsData,
  createStudentDetailsData,
  createStaffDetailsData,
} from '../factories/user.factory';
import { SupabaseService } from '../../../src/lib/supabase/supabase.service';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedUsers(
  prisma: PrismaTransaction,
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

  // Pre-calculate all user data for batch creation
  const usersToCreate: Prisma.UserCreateManyInput[] = [];
  const userAccountsToCreate: Prisma.UserAccountCreateManyInput[] = [];
  const userDetailsToCreate: Prisma.UserDetailsCreateManyInput[] = [];
  const studentDetailsToCreate: Prisma.StudentDetailsCreateManyInput[] = [];
  const staffDetailsToCreate: Prisma.StaffDetailsCreateManyInput[] = [];

  const authUsers: Array<{ user: any; role: Role; index: number }> = [];
  for (let i = 0; i < TOTAL; i++) {
    let role: Role;
    if (i < ADMINS) role = Role.admin;
    else if (i < ADMINS + MENTORS) role = Role.mentor;
    else role = Role.student;

    const userData = createUserData(role, i);
    usersToCreate.push(userData);

    // Prepare related data
    userAccountsToCreate.push(createUserAccountData('temp-' + i, i));
    userDetailsToCreate.push(createUserDetailsData('temp-' + i, i));

    if (role === Role.student) {
      studentDetailsToCreate.push(createStudentDetailsData('temp-' + i, i));
    } else {
      staffDetailsToCreate.push(createStaffDetailsData('temp-' + i, role, i));
    }

    // Handle auth account creation for the first user of each role
    if (!authCreated[role] && seedConfig.CREATE_USER_ACCOUNTS) {
      const email = `${role}@tester.com`;
      const password = 'password';

      try {
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

        authUsers.push({
          user: account.data.user,
          role,
          index: i,
        });

        authCreated[role] = true;
      } catch (error) {
        log(`Warning: Failed to create auth account for ${role}: ${error}`);
        authCreated[role] = true; // Don't retry
      }
    }
  }

  // Batch creates all users
  if (usersToCreate.length > 0) {
    await prisma.user.createMany({
      data: usersToCreate,
    });

    // Fetch created users to get their IDs
    const createdUsers = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.admin, Role.mentor, Role.student],
        },
      },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }, { lastName: 'asc' }],
    });

    // Update related data with real user IDs - using direct index mapping since arrays are created in the same order
    const userAccountsWithIds = userAccountsToCreate.map((account, index) => ({
      ...account,
      userId: createdUsers[index].id,
    }));

    const userDetailsWithIds = userDetailsToCreate.map((details, index) => ({
      ...details,
      userId: createdUsers[index].id,
    }));

    // For student details, find the corresponding student user index
    const studentUsers = createdUsers.filter((u) => u.role === Role.student);
    const studentDetailsWithIds = studentDetailsToCreate.map(
      (details, detailsIndex) => ({
        ...details,
        userId: studentUsers[detailsIndex].id,
      }),
    );

    // For staff details, find the corresponding staff user index
    const staffUsers = createdUsers.filter(
      (u) => u.role === Role.admin || u.role === Role.mentor,
    );
    const staffDetailsWithIds = staffDetailsToCreate.map(
      (details, detailsIndex) => ({
        ...details,
        userId: staffUsers[detailsIndex].id,
      }),
    );

    // Batch creates all related records
    if (userAccountsWithIds.length > 0) {
      await prisma.userAccount.createMany({
        data: userAccountsWithIds,
      });
    }

    if (userDetailsWithIds.length > 0) {
      await prisma.userDetails.createMany({
        data: userDetailsWithIds,
      });
    }

    if (studentDetailsWithIds.length > 0) {
      await prisma.studentDetails.createMany({
        data: studentDetailsWithIds,
      });
    }

    if (staffDetailsWithIds.length > 0) {
      await prisma.staffDetails.createMany({
        data: staffDetailsWithIds,
      });
    }

    // Update auth accounts with real user IDs (first user of each role)
    for (const authUser of authUsers) {
      const user = createdUsers.find((u) => u.role === authUser.role);

      if (user) {
        try {
          await supabase.auth.admin.updateUserById(authUser.user.id, {
            user_metadata: {
              user_id: user.id,
            },
          });
        } catch (error) {
          log(
            `Warning: Failed to update auth account for user ${user.id}: ${error}`,
          );
        }
      }
    }
  }

  // Fetch final data with relations
  const users = await prisma.user.findMany({
    include: {
      userAccount: true,
      userDetails: true,
      studentDetails: true,
      staffDetails: true,
    },
    orderBy: [{ role: 'asc' }, { firstName: 'asc' }, { lastName: 'asc' }],
  });

  const admins = users.filter((u) => u.role === Role.admin);
  const mentors = users.filter((u) => u.role === Role.mentor);
  const students = users.filter((u) => u.role === Role.student);
  log(`   - ${admins.length} Admins`);
  log(`   - ${mentors.length} Mentors`);
  log(`   - ${students.length} Students`);

  return { users, admins, mentors, students };
}
