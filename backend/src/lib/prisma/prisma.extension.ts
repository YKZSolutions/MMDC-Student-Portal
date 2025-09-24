import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

const moduleContentSelect = {
  id: true,
  order: true,
  contentType: true,
  publishedAt: true,
  toPublishAt: true,
  unpublishedAt: true,
  createdAt: true,
  updatedAt: true,
  lesson: { omit: { content: true } },
  assignment: {
    include: { grading: { omit: { gradingSchema: true } } },
    omit: { content: true },
  },
  quiz: { omit: { content: true, questions: true } },
  discussion: { omit: { content: true } },
  video: { omit: { content: true } },
  externalUrl: { omit: { content: true } },
  fileResource: { omit: { content: true } },
} as const;

const moduleSectionSelect = {
  id: true,
  moduleId: true,
  parentSectionId: true,
  prerequisiteSectionId: true,
  title: true,
  order: true,
  publishedAt: true,
  toPublishAt: true,
  unpublishedAt: true,
  createdAt: true,
  updatedAt: true,
  moduleContents: {
    where: { deletedAt: null },
    select: moduleContentSelect,
    orderBy: { order: 'asc' },
  },
} as const;

const moduleSelect = {
  id: true,
  courseId: true,
  title: true,
  publishedAt: true,
  toPublishAt: true,
  unpublishedAt: true,
  createdAt: true,
  updatedAt: true,
  moduleSections: {
    where: { deletedAt: null },
    select: moduleSectionSelect,
    orderBy: { order: 'asc' },
  },
} as const;

export const extendedPrismaClient = new PrismaClient()
  .$extends(pagination())
  .$extends({
    model: {
      module: {
        // Add a helper to get the "full" select
        fullSelect: moduleSelect,

        async findFullMany<T>(
          this: any,
          args: Omit<Parameters<typeof this.findMany>[0], 'select'> & {
            include?: any;
          },
        ) {
          return this.findMany({
            ...args,
            select: moduleSelect,
          });
        },
      },
    },
  });

export type ExtendedPrismaClient = typeof extendedPrismaClient;

export type PrismaTransaction = Parameters<
  Parameters<ExtendedPrismaClient['$transaction']>[0]
>[0];
