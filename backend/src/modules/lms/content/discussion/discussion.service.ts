import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { CreateDiscussionDto } from '@/generated/nestjs-dto/create-discussion.dto';
import { DiscussionDto } from '@/generated/nestjs-dto/discussion.dto';
import { UpdateDiscussionDto } from '@/generated/nestjs-dto/update-discussion.dto';
import { Discussion } from '@/generated/nestjs-dto/discussion.entity';
import { CreateDiscussionPostDto } from '@/generated/nestjs-dto/create-discussionPost.dto';
import { DiscussionPostDto } from '@/generated/nestjs-dto/discussionPost.dto';
import { UpdateDiscussionPostDto } from '@/generated/nestjs-dto/update-discussionPost.dto';

@Injectable()
export class DiscussionService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new discussion linked to a module content
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Creating discussion for module content ${moduleContentId}`,
    logSuccessMessage: (discussion) =>
      `Discussion [${discussion.title}] successfully created.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while creating discussion for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Discussion already exists for this module content',
      ),
  })
  async create(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('discussionData')
    discussionData: CreateDiscussionDto,
  ): Promise<DiscussionDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const discussion = await this.prisma.client.discussion.create({
      data: {
        ...discussionData,
        moduleContent: { connect: { id: moduleContentId } },
      },
    });

    return {
      ...discussion,
      content: discussion.content as Prisma.JsonValue,
    };
  }

  /**
   * Updates an existing discussion
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating discussion for module content ${moduleContentId}`,
    logSuccessMessage: (discussion) =>
      `Discussion [${discussion.title}] successfully updated.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while updating discussion for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Discussion not found'),
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('discussionData')
    discussionData: UpdateDiscussionDto,
  ): Promise<DiscussionDto> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const discussion = await this.prisma.client.discussion.update({
      where: { moduleContentId },
      data: discussionData,
    });

    return {
      ...discussion,
      content: discussion.content as Prisma.JsonValue,
    };
  }

  /**
   * Finds a discussion by module content ID
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Finding discussion for module content ${moduleContentId}`,
    logSuccessMessage: (discussion) =>
      `Discussion [${discussion.title}] successfully found.`,
    logErrorMessage: (err, { moduleContentId }) =>
      `An error has occurred while finding discussion for module content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Discussion not found'),
  })
  async findByModuleContentId(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('includePosts') includePosts: boolean = false,
  ): Promise<Discussion> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const discussion = await this.prisma.client.discussion.findUniqueOrThrow({
      where: { moduleContentId },
      include: {
        posts: includePosts
          ? {
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                replies: includePosts,
              },
              orderBy: {
                createdAt: 'desc',
              },
            }
          : false,
      },
    });

    return {
      ...discussion,
      content: discussion.content as Prisma.JsonValue,
      posts: discussion.posts.map((post) => ({
        ...post,
        content: post.content as Prisma.JsonValue,
      })),
    };
  }

  /**
   * Removes a discussion by module content ID (hard/soft delete)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, directDelete }) =>
      `Removing discussion for module content ${moduleContentId} with directDelete=${directDelete}`,
    logSuccessMessage: (_, { moduleContentId, directDelete }) =>
      directDelete
        ? `Discussion for module content ${moduleContentId} hard deleted.`
        : `Discussion for module content ${moduleContentId} soft deleted (deletedAt set).`,
    logErrorMessage: (err, { moduleContentId, directDelete }) =>
      `Error removing discussion for module content ${moduleContentId} with directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('directDelete') directDelete: boolean = false,
  ): Promise<void> {
    if (!isUUID(moduleContentId)) {
      throw new BadRequestException('Invalid module content ID format');
    }
    if (directDelete) {
      await this.prisma.client.discussion.delete({
        where: { moduleContentId },
      });
    } else {
      await this.prisma.client.discussion.update({
        where: { moduleContentId },
        data: { deletedAt: new Date() },
      });
    }
  }

  /**
   * Creates a new post in a discussion
   */
  @Log({
    logArgsMessage: ({ discussionId, authorId }) =>
      `Creating post in discussion ${discussionId} by author ${authorId}`,
    logSuccessMessage: (post) => `Post [${post.id}] successfully created.`,
    logErrorMessage: (err, { discussionId }) =>
      `An error has occurred while creating post in discussion ${discussionId} | Error: ${err.message}`,
  })
  async createPost(
    @LogParam('discussionId') discussionId: string,
    @LogParam('authorId') authorId: string,
    @LogParam('content') content: CreateDiscussionPostDto,
    @LogParam('parentId') parentId?: string,
  ): Promise<DiscussionPostDto> {
    if (
      !isUUID(discussionId) ||
      !isUUID(authorId) ||
      (parentId && !isUUID(parentId))
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const data: Prisma.DiscussionPostCreateInput = {
      content,
      discussion: { connect: { id: discussionId } },
      author: { connect: { id: authorId } },
    };

    if (parentId) {
      data.parent = { connect: { id: parentId } };
    }

    const post = await this.prisma.client.discussionPost.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        replies: true,
      },
    });

    return {
      ...post,
      content: post.content as Prisma.JsonValue,
    };
  }

  /**
   * Updates an existing post
   */
  @Log({
    logArgsMessage: ({ postId }) => `Updating post ${postId}`,
    logSuccessMessage: (post) => `Post [${post.id}] successfully updated.`,
    logErrorMessage: (err, { postId }) =>
      `An error has occurred while updating post ${postId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Post not found'),
  })
  async updatePost(
    @LogParam('postId') postId: string,
    @LogParam('content') content: UpdateDiscussionPostDto,
  ): Promise<DiscussionPostDto> {
    if (!isUUID(postId)) {
      throw new BadRequestException('Invalid post ID format');
    }

    const post = await this.prisma.client.discussionPost.update({
      where: { id: postId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        replies: true,
      },
    });

    return {
      ...post,
      content: post.content as Prisma.JsonValue,
    };
  }

  /**
   * Deletes a post
   */
  @Log({
    logArgsMessage: ({ postId }) => `Deleting post ${postId}`,
    logSuccessMessage: () => 'Post successfully deleted.',
    logErrorMessage: (err, { postId }) =>
      `An error has occurred while deleting post ${postId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Post not found'),
  })
  async deletePost(
    @LogParam('postId') postId: string,
  ): Promise<{ message: string }> {
    if (!isUUID(postId)) {
      throw new BadRequestException('Invalid post ID format');
    }

    await this.prisma.client.discussionPost.delete({
      where: { id: postId },
    });

    return { message: 'Post successfully deleted' };
  }

  // /**
  //  * Finds posts in a discussion with optional filters
  //  */
  // async findPosts(
  //   discussionId: string,
  //   filters: {
  //     parentId?: string | null; // null for top-level posts only
  //     authorId?: string;
  //     includeReplies?: boolean;
  //   } = {},
  // ) {
  //   if (!isUUID(discussionId)) {
  //     throw new BadRequestException('Invalid discussion ID format');
  //   }
  //
  //   const where: Prisma.DiscussionPostWhereInput = {
  //     discussionId,
  //   };
  //
  //   if (filters.parentId !== undefined) {
  //     where.parentId = filters.parentId;
  //   }
  //
  //   if (filters.authorId) {
  //     where.authorId = filters.authorId;
  //   }
  //
  //   return await this.prisma.client.discussionPost.findMany({
  //     where,
  //     include: {
  //       author: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //         },
  //       },
  //       replies: filters.includeReplies
  //         ? {
  //             include: {
  //               author: {
  //                 select: {
  //                   id: true,
  //                   firstName: true,
  //                   lastName: true,
  //                 },
  //               },
  //             },
  //           }
  //         : false,
  //     },
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //   });
  // }
}
