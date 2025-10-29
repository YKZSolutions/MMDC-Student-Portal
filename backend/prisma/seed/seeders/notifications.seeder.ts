import { faker } from '@faker-js/faker';
import {
  Notification,
  NotificationReceipt,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { log } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

const NOTIFICATION_TEMPLATES = {
  student: [
    'New assignment available: {course}',
    'Grade released for {assignment}',
    'Course announcement: {message}',
    'Discussion reply in {course}',
    'Upcoming deadline: {assignment} due soon',
    'Module {module} now available',
    'Feedback available for your submission',
  ],
  mentor: [
    'New submission for {assignment}',
    'Student question in discussion',
    'Course enrollment request',
    'Grade submission reminder',
    'Module review required',
    'Student progress report available',
  ],
  admin: [
    'System maintenance scheduled',
    'New user registration requires approval',
    'Course creation request',
    'Billing issue requires attention',
    'System performance report',
  ],
};

export async function seedNotifications(
  prisma: PrismaTransaction,
  users: User[],
) {
  log('Seeding notifications...');

  // Get some course names for context
  const courses = await prisma.course.findMany({ take: 10 });
  const assignments = await prisma.assignment.findMany({
    take: 10,
    include: {
      moduleContent: true,
    },
  });
  const modules = await prisma.module.findMany({ take: 10 });

  // Group users by role
  const usersByRole: Record<Role, User[]> = {
    student: users.filter((u) => u.role === Role.student),
    mentor: users.filter((u) => u.role === Role.mentor),
    admin: users.filter((u) => u.role === Role.admin),
  };

  // 1. Pre-calculate notifications data for batch creation
  const notificationsToCreate: Prisma.NotificationCreateManyInput[] = [];

  for (const [role, roleUsers] of Object.entries(usersByRole)) {
    if (roleUsers.length === 0) continue;

    const templates = NOTIFICATION_TEMPLATES[role as Role];

    for (const user of roleUsers) {
      for (let i = 0; i < seedConfig.NOTIFICATIONS_PER_USER; i++) {
        const template = faker.helpers.arrayElement(templates);
        const course = faker.helpers.arrayElement(courses);
        const assignment = faker.helpers.arrayElement(assignments);
        const module = faker.helpers.arrayElement(modules);

        // Use moduleContent title for assignment, fallback to a generic title
        const assignmentTitle =
          assignment?.moduleContent?.title || 'Programming Assignment 1';

        const title = template
          .replace('{course}', course?.name || 'Computer Science 101')
          .replace('{assignment}', assignmentTitle)
          .replace('{module}', module?.title || 'Introduction Module')
          .replace('{message}', faker.lorem.words(3));

        const content = generateNotificationContent(role as Role, title);

        notificationsToCreate.push({
          title,
          content,
          role: [role as Role],
        });
      }
    }
  }

  // Batch create notifications
  if (notificationsToCreate.length > 0) {
    await prisma.notification.createMany({
      data: notificationsToCreate,
    });
  }

  // Fetch created notifications
  const notifications = await prisma.notification.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });
  log(`-> Created ${notifications.length} notifications.`);

  // 2. Pre-calculate notification receipts data for batch creation
  const receiptsToCreate: Prisma.NotificationReceiptCreateManyInput[] = [];

  for (const notification of notifications) {
    // Find users who should receive this notification based on role
    const targetUsers = usersByRole[notification.role[0]];
    if (!targetUsers) continue;

    for (const user of targetUsers) {
      const isRead = Math.random() > 0.7; // 30% chance of being unread

      receiptsToCreate.push({
        notificationId: notification.id,
        userId: user.id,
        isRead,
        createdAt: faker.date.recent({ days: 30 }),
      });
    }
  }

  // Batch create notification receipts
  if (receiptsToCreate.length > 0) {
    await prisma.notificationReceipt.createMany({
      data: receiptsToCreate,
    });
  }

  // Fetch created receipts
  const receipts = await prisma.notificationReceipt.findMany({
    where: {
      notificationId: {
        in: notifications.map(n => n.id),
      },
    },
    include: {
      notification: true,
      user: true,
    },
  });
  log(`-> Created ${receipts.length} notification receipts.`);

  return { notifications, receipts };
}

function generateNotificationContent(role: Role, title: string): string {
  const baseContent = {
    student: [
      `Please check the course page for more details.`,
      `Due date: ${faker.date.future().toLocaleDateString()}`,
      `Your attention to this matter is appreciated.`,
    ],
    mentor: [
      `Action may be required. Please review when convenient.`,
      `This requires your professional attention.`,
      `Please address this at your earliest convenience.`,
    ],
    admin: [
      `System administration attention required.`,
      `Please review and take appropriate action.`,
      `This matter requires your administrative oversight.`,
    ],
  };

  const snippets = baseContent[role];
  return `${title}. ${faker.helpers.arrayElement(snippets)} ${faker.lorem.sentence()}`;
}
