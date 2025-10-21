import { faker } from '@faker-js/faker';
import { PrismaClient, Role, User } from '@prisma/client';
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

  let notificationCount = 0;
  let receiptCount = 0;

  // Group users by role
  const usersByRole: Record<Role, User[]> = {
    student: users.filter((u) => u.role === Role.student),
    mentor: users.filter((u) => u.role === Role.mentor),
    admin: users.filter((u) => u.role === Role.admin),
  };

  // Get some course names for context
  const courses = await prisma.course.findMany({ take: 10 });
  const assignments = await prisma.assignment.findMany({
    take: 10,
    include: {
      moduleContent: true, // Include moduleContent to get the title
    },
  });
  const modules = await prisma.module.findMany({ take: 10 });

  // Create notifications for each role
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

        const isRead = Math.random() > 0.7; // 30% chance of being unread

        // Create notification
        const notification = await prisma.notification.create({
          data: {
            title,
            content,
            role: [role as Role],
          },
        });
        notificationCount++;

        // Create receipt for the user (without title and content - they're not in the model)
        await prisma.notificationReceipt.create({
          data: {
            notificationId: notification.id,
            userId: user.id,
            isRead,
            createdAt: faker.date.recent({ days: 30 }),
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
