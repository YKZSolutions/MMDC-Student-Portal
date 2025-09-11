import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import { log } from '../utils/helpers';

export async function seedNotifications(prisma: PrismaClient, users: User[]) {
  log('Seeding notifications...');
  const notifications = await Promise.all(
    users.flatMap((user) =>
      Array.from({ length: 3 }, () =>
        prisma.notification.create({
          data: {
            userId: user.id,
            title: faker.lorem.sentence(3),
            content: faker.lorem.paragraph(),
            isRead: Math.random() > 0.5,
          },
        }),
      ),
    ),
  );
  log(`-> Created ${notifications.length} notifications.`);
}
