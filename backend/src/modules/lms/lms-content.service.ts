import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { Log } from '@/common/decorators/log.decorator';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';
import { PrismaError, PrismaErrorCode, } from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { ContentType, Prisma, Role } from '@prisma/client';
import { isUUID } from 'class-validator';
import { omitAuditDates, omitPublishFields } from '@/config/prisma_omit.config';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { AssignmentService } from '@/modules/lms/content/assignment/assignment.service';
import { QuizService } from '@/modules/lms/content/quiz/quiz.service';
import { DiscussionService } from '@/modules/lms/content/discussion/discussion.service';
import { FileService } from '@/modules/lms/content/file/file.service';
import { UrlService } from '@/modules/lms/content/url/url.service';
import { VideoService } from '@/modules/lms/content/video/video.service';

@Injectable()
export class LmsContentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private assignmentService: AssignmentService,
    private quizService: QuizService,
    private discussionService: DiscussionService,
    private fileService: FileService,
    private urlService: UrlService,
    private videoService: VideoService,
  ) {}

  @Log({
    logArgsMessage: ({
      moduleId,
      content,
    }: {
      moduleId: string;
      content: CreateContentDto;
    }) =>
      `Creating module content in module ${moduleId} and section ${content.sectionId}`,
    logSuccessMessage: (content) =>
      `Module content [${content.id}] with type ${content.contentType} successfully created.`,
    logErrorMessage: (
      err,
      {
        moduleId,
      }: {
        moduleId: string;
      },
    ) =>
      `An error has occurred while creating module content [${moduleId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new ConflictException(
        'Module content title already exists in this section.',
      ),
  })
  async create(
    @LogParam('content') createModuleContentDto: CreateContentDto,
    @LogParam('moduleId') moduleId: string,
  ): Promise<ModuleContent> {
    const { assignment, quiz, discussion, file, externalUrl, video, ...rest } =
      createModuleContentDto;

    const data: Prisma.ModuleContentCreateInput = {
      ...rest,
      module: { connect: { id: moduleId } },
    };

    // Create the module content first
    const content = await this.prisma.client.moduleContent.create({
      data,
    });

    // Delegate to specialized services based on content type
    if (rest.contentType === ContentType.ASSIGNMENT && assignment) {
      await this.assignmentService.create(content.id, assignment);
    } else if (rest.contentType === ContentType.QUIZ && quiz) {
      await this.quizService.create(content.id, quiz);
    } else if (rest.contentType === ContentType.DISCUSSION && discussion) {
      await this.discussionService.create(content.id, discussion);
    } else if (rest.contentType === ContentType.FILE && file) {
      await this.fileService.create(content.id, file);
    } else if (rest.contentType === ContentType.URL && externalUrl) {
      await this.urlService.create(content.id, externalUrl);
    } else if (rest.contentType === ContentType.VIDEO && video) {
      await this.videoService.create(content.id, video);
    }

    return this.findOne(content.id, Role.admin, null, rest.contentType);
  }

  @Log({
    logArgsMessage: ({ id }) => `Fetching module content record for id ${id}`,
    logSuccessMessage: ({ id }) =>
      `Successfully fetched module content for id ${id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while fetching module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Module content not found'),
  })
  async findOne(
    @LogParam('id') id: string,
    @LogParam('role') role: Role,
    @LogParam('userId') userId: string | null,
    @LogParam('contentType') contentType: ContentType,
  ): Promise<ModuleContent> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    // Explicitly type baseInclude to allow dynamic properties
    const baseInclude = {} as Prisma.ModuleContentInclude;

    if (userId) {
      baseInclude.studentProgress = {
        where: { userId },
      };
    }

    // Add content-type specific includes
    if (contentType === ContentType.ASSIGNMENT) {
      if (role === Role.student && userId) {
        baseInclude.assignment = {
          include: {
            submissions: {
              where: { studentId: userId },
            },
          },
        };
      } else {
        baseInclude.assignment = true;
      }
    } else if (contentType === ContentType.QUIZ) {
      if (role === Role.student && userId) {
        baseInclude.quiz = {
          include: {
            submissions: {
              where: { studentId: userId },
            },
          },
        };
      } else {
        baseInclude.quiz = true;
      }
    } else if (contentType === ContentType.DISCUSSION) {
      const postsWhereConditions: Prisma.DiscussionPostWhereInput[] = [
        { parentId: null },
      ];
      if (userId) {
        postsWhereConditions.push({ authorId: userId });
      }

      baseInclude.discussion = {
        include: {
          posts:
            role !== Role.student
              ? true
              : {
                  where: {
                    OR: postsWhereConditions,
                  },
                  include: {
                    author: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                    replies:
                      role !== Role.student
                        ? true
                        : {
                            where: {
                              authorId: userId || undefined, // Use undefined if userId is null
                            },
                            include: {
                              author: {
                                select: {
                                  id: true,
                                  firstName: true,
                                  lastName: true,
                                },
                              },
                            },
                          },
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                },
        },
      };
    } else if (contentType === ContentType.FILE) {
      baseInclude.fileResource = true;
    } else if (contentType === ContentType.URL) {
      baseInclude.externalUrl = true;
    } else if (contentType === ContentType.VIDEO) {
      baseInclude.video = true;
    }

    // Apply security filters based on role
    const queryOptions: Prisma.ModuleContentFindUniqueOrThrowArgs = {
      where: { id },
      include: baseInclude,
    };

    if (role === Role.student) {
      queryOptions.omit = { ...omitAuditDates, ...omitPublishFields };
    }

    return await this.prisma.client.moduleContent.findUniqueOrThrow(
      queryOptions,
    );
  }

  @Log({
    logArgsMessage: ({ id }: { id: string }) =>
      `Updating module content for id ${id}`,
    logSuccessMessage: (moduleContent) =>
      `Successfully updated module content for id ${moduleContent.id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while updating module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Module content not found for Id ${id}`),
    [PrismaErrorCode.UniqueConstraint]: (_, { id }: { id: string }) =>
      new ConflictException(
        `Module content ${id} already exists in this section`,
      ),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('content') updateContentDto: UpdateContentDto,
  ): Promise<ModuleContent> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    // First get the current content to know its type
    const currentContent = await this.prisma.client.moduleContent.findUnique({
      where: { id },
      select: { contentType: true },
    });

    if (!currentContent) {
      throw new NotFoundException(`Module content with ID ${id} not found`);
    }

    const {
      sectionId,
      assignment,
      quiz,
      discussion,
      file,
      externalUrl,
      video,
      contentType: newContentType, // prevent changing contentType
      ...contentData
    } = updateContentDto;

    if (newContentType && newContentType !== currentContent.contentType) {
      throw new BadRequestException(
        'Changing contentType is not allowed. Please remove and recreate the content.',
      );
    }

    const data: Prisma.ModuleContentUpdateInput = {
      ...contentData,
    };

    if (sectionId) {
      data.moduleSection = { connect: { id: sectionId } };
    }

    // Update the module content
    await this.prisma.client.moduleContent.update({
      where: { id },
      data,
    });

    // Delegate to specialized services based on content type
    if (currentContent.contentType === ContentType.ASSIGNMENT && assignment) {
      await this.assignmentService.update(id, assignment);
    } else if (currentContent.contentType === ContentType.QUIZ && quiz) {
      await this.quizService.update(id, quiz);
    } else if (
      currentContent.contentType === ContentType.DISCUSSION &&
      discussion
    ) {
      await this.discussionService.update(id, discussion);
    } else if (currentContent.contentType === ContentType.FILE && file) {
      await this.fileService.update(id, file);
    } else if (currentContent.contentType === ContentType.URL && externalUrl) {
      await this.urlService.update(id, externalUrl);
    } else if (currentContent.contentType === ContentType.VIDEO && video) {
      await this.videoService.update(id, video);
    }

    return this.findOne(id, Role.admin, null, currentContent.contentType);
  }

  /**
   * Remove module content and its associated sub-content
   */
  @Log({
    logArgsMessage: ({ id }) => `Removing module content for id ${id}`,
    logSuccessMessage: ({ id }) =>
      `Successfully removed module content for id ${id}`,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while removing module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Module content not found'),
  })
  async remove(
    @LogParam('id') id: string,
  ): Promise<{ id: string; deleted: boolean }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    // Get the current content type
    const currentContent = await this.prisma.client.moduleContent.findUnique({
      where: { id },
      select: { contentType: true },
    });
    if (!currentContent) {
      throw new NotFoundException(`Module content with ID ${id} not found`);
    }

    // Remove associated sub-content
    switch (currentContent.contentType) {
      case ContentType.ASSIGNMENT:
        await this.assignmentService.remove(id);
        break;
      case ContentType.QUIZ:
        await this.quizService.remove(id);
        break;
      case ContentType.DISCUSSION:
        await this.discussionService.remove(id);
        break;
      case ContentType.FILE:
        await this.fileService.remove(id);
        break;
      case ContentType.URL:
        await this.urlService.remove(id);
        break;
      case ContentType.VIDEO:
        await this.videoService.remove(id);
        break;
      default:
        break;
    }

    // Remove the main module content
    await this.prisma.client.moduleContent.delete({ where: { id } });
    return { id, deleted: true };
  }
}
