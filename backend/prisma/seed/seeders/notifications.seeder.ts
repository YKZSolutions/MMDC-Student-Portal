import { faker } from '@faker-js/faker';
import { PrismaClient, Role, User } from '@prisma/client';
import { log } from '../utils/helpers';

const NOTIFICATIONS_PER_USER = 3;

export async function seedNotifications(prisma: PrismaClient, users: User[]) {
  log('Seeding notifications...');

  // Create notifications with receipts for each user
  let notificationCount = 0;
  let receiptCount = 0;

  // Group users by role to create role-based notifications
  const usersByRole: Record<Role, User[]> = {
    student: [],
    mentor: [],
    admin: [],
  };

  for (const user of users) {
    if (!usersByRole[user.role]) {
      usersByRole[user.role] = [];
    }
    usersByRole[user.role].push(user);
  }

  // Create notifications for each role
  for (const [role, roleUsers] of Object.entries(usersByRole)) {
    for (const user of roleUsers) {
      for (let i = 0; i < NOTIFICATIONS_PER_USER; i++) {
        const title = faker.lorem.sentence(3);
        const content = faker.lorem.paragraph();
        const isRead = Math.random() > 0.5;

        // Create notification
        const notification = await prisma.notification.create({
          data: {
            title,
            content,
            role: [role as Role],
          },
        });
        notificationCount++;

        // Create receipt for the user
        await prisma.notificationReceipt.create({
          data: {
            notificationId: notification.id,
            userId: user.id,
            title,
            content,
            isRead,
          },
        });
        receiptCount++;
      }
    }
  }

  log(
    `-> Created ${notificationCount} notifications and ${receiptCount} notification receipts.`,
  );
}
