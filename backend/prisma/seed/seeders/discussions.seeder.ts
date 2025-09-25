import {
  PrismaClient,
  User,
  Discussion as DiscussionType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import { log } from '../utils/helpers';

export async function seedDiscussions(
  prisma: PrismaClient,
  discussions: DiscussionType[],
  students: User[],
  mentors: User[],
) {
  log('Seeding discussion posts...');

  let postCount = 0;
  const allPosts = [];

  for (const discussion of discussions) {
    // Get the module content and then the module to find enrolled students
    const moduleContent = await prisma.moduleContent.findUnique({
      where: { id: discussion.moduleContentId },
      include: { module: true },
    });

    if (!moduleContent) continue;

    // Find course sections that have this module
    const sectionModules = await prisma.sectionModule.findMany({
      where: { moduleId: moduleContent.moduleId },
      include: {
        courseSection: {
          include: {
            courseEnrollments: {
              include: { student: true },
            },
          },
        },
      },
    });

    // Collect all students enrolled in sections that have this module
    const enrolledStudents: User[] = [];
    sectionModules.forEach((sm) => {
      sm.courseSection.courseEnrollments.forEach((enrollment) => {
        enrolledStudents.push(enrollment.student);
      });
    });

    if (enrolledStudents.length === 0) continue;

    // Create initial post by a mentor
    const mentorPost = await prisma.discussionPost.create({
      data: {
        discussionId: discussion.id,
        authorId: faker.helpers.arrayElement(mentors).id,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `Welcome to our discussion on ${discussion.title}! ${faker.lorem.paragraph()}`,
                },
              ],
            },
          ],
        },
        createdAt: faker.date.recent({ days: 7 }),
      },
    });
    postCount++;
    allPosts.push(mentorPost);

    // Create replies to the initial post (mix of students and mentors)
    const numReplies = faker.number.int({ min: 3, max: 10 });

    for (let i = 0; i < numReplies; i++) {
      const isStudentReply = Math.random() > 0.3; // 70% student replies
      const author = isStudentReply
        ? faker.helpers.arrayElement(enrolledStudents)
        : faker.helpers.arrayElement(mentors);

      const replyContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: faker.lorem.paragraphs(
                  faker.number.int({ min: 1, max: 3 }),
                ),
              },
            ],
          },
          ...(Math.random() > 0.8
            ? [
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            { type: 'text', text: faker.lorem.sentence() },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ]
            : []),
        ],
      };

      const reply = await prisma.discussionPost.create({
        data: {
          discussionId: discussion.id,
          authorId: author.id,
          parentId: mentorPost.id,
          content: replyContent,
          createdAt: faker.date.recent({ days: 5 }),
        },
      });
      postCount++;
      allPosts.push(reply);

      // Create nested replies (replies to replies)
      if (Math.random() > 0.7) {
        // 30% chance for nested replies
        const nestedRepliesCount = faker.number.int({ min: 1, max: 3 });

        for (let j = 0; j < nestedRepliesCount; j++) {
          const nestedAuthor = faker.helpers.arrayElement(
            Math.random() > 0.5 ? enrolledStudents : mentors,
          );

          const nestedReply = await prisma.discussionPost.create({
            data: {
              discussionId: discussion.id,
              authorId: nestedAuthor.id,
              parentId: reply.id,
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: faker.lorem.paragraph(),
                      },
                    ],
                  },
                ],
              },
              createdAt: faker.date.recent({ days: 3 }),
            },
          });
          postCount++;
          allPosts.push(nestedReply);
        }
      }
    }

    // Create some additional top-level posts for variety
    if (Math.random() > 0.5) {
      const additionalPost = await prisma.discussionPost.create({
        data: {
          discussionId: discussion.id,
          authorId: faker.helpers.arrayElement([
            ...enrolledStudents,
            ...mentors,
          ]).id,
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: `I have a question about ${faker.lorem.words(2)}. ${faker.lorem.paragraph()}`,
                  },
                ],
              },
            ],
          },
          createdAt: faker.date.recent({ days: 4 }),
        },
      });
      postCount++;
      allPosts.push(additionalPost);
    }
  }

  log(
    `-> Created ${postCount} discussion posts across ${discussions.length} discussions.`,
  );
  return { discussionPosts: allPosts };
}
