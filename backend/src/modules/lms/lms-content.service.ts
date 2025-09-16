import {BadRequestException, ConflictException, Inject, Injectable, NotFoundException,} from '@nestjs/common';
import {CustomPrismaService} from 'nestjs-prisma';
import {CreateContentDto} from '@/modules/lms/dto/create-content.dto';
import {ContentType, CourseEnrollmentStatus, Prisma, Role,} from '@prisma/client';
import {isUUID} from 'class-validator';
import {omitAuditDates, omitPublishFields} from '@/config/prisma_omit.config';
import {ExtendedPrismaClient} from '@/lib/prisma/prisma.extension';
import {AuthUser} from '@/common/interfaces/auth.user-metadata';
import {DetailedContentProgressDto} from './dto/detailed-content-progress.dto';
import {LogParam} from '@/common/decorators/log-param.decorator';
import {Log} from '@/common/decorators/log.decorator';
import {PrismaError, PrismaErrorCode,} from '@/common/decorators/prisma-error.decorator';
import {UpdateContentDto} from '@/modules/lms/dto/update-content.dto';
import {ModuleContent} from '@/generated/nestjs-dto/moduleContent.entity';
import {AssignmentService} from '@/modules/lms/content/assignment/assignment.service';
import {QuizService} from '@/modules/lms/content/quiz/quiz.service';
import {DiscussionService} from '@/modules/lms/content/discussion/discussion.service';
import {FileService} from '@/modules/lms/content/file/file.service';
import {UrlService} from '@/modules/lms/content/url/url.service';
import {VideoService} from '@/modules/lms/content/video/video.service';
import {LessonService} from '@/modules/lms/content/lesson/lessson.service';
import {PaginatedModuleContentDto} from '@/modules/lms/dto/paginated-module-content.dto';
import {FilterModuleContentsDto} from '@/modules/lms/dto/filter-module-contents.dto';

@Injectable()
export class LmsContentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private lessonService: LessonService,
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
    const {
      assignment,
      quiz,
      discussion,
      file,
      externalUrl,
      video,
      lesson,
      ...rest
    } = createModuleContentDto;

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Create the base module content
      const content = await tx.moduleContent.create({
        data: {
          ...rest,
          module: { connect: { id: moduleId } },
        },
      });

      // 2. Delegate to specialized services OR inline nested creation
      switch (rest.contentType) {
        case ContentType.ASSIGNMENT:
          if (assignment) {
            await this.assignmentService.create(content.id, assignment, tx);
          }
          break;

        case ContentType.QUIZ:
          if (quiz) {
            await this.quizService.create(content.id, quiz, tx);
          }
          break;

        case ContentType.DISCUSSION:
          if (discussion) {
            await this.discussionService.create(content.id, discussion, tx);
          }
          break;

        case ContentType.FILE:
          if (file) {
            await this.fileService.create(content.id, file, tx);
          }
          break;

        case ContentType.URL:
          if (externalUrl) {
            await this.urlService.create(content.id, externalUrl, tx);
          }
          break;

        case ContentType.VIDEO:
          if (video) {
            await this.videoService.create(content.id, video, tx);
          }
          break;

        case ContentType.LESSON:
          if (lesson) {
            await this.lessonService.create(content.id, lesson, tx);
          }
          break;
      }

      // 3. Always return fresh with relations
      return this.findOne(content.id, Role.admin, null);
    });
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

    // Fetch contentType from the database first
    const contentRecord =
      await this.prisma.client.moduleContent.findUniqueOrThrow({
        where: { id },
        select: { contentType: true },
      });

    const contentType = contentRecord.contentType; // Use the fetched contentType

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

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Get current content type inside the transaction
      const currentContent = await tx.moduleContent.findUnique({
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
        lesson,
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

      // 2. Update the base module content
      await tx.moduleContent.update({
        where: { id },
        data,
      });

      // 3. Delegate to specialized services (pass `tx`)
      switch (currentContent.contentType) {
        case ContentType.ASSIGNMENT:
          if (assignment) {
            await this.assignmentService.update(id, assignment, tx);
          }
          break;
        case ContentType.QUIZ:
          if (quiz) {
            await this.quizService.update(id, quiz, tx);
          }
          break;
        case ContentType.DISCUSSION:
          if (discussion) {
            await this.discussionService.update(id, discussion, tx);
          }
          break;
        case ContentType.FILE:
          if (file) {
            await this.fileService.update(id, file, tx);
          }
          break;
        case ContentType.URL:
          if (externalUrl) {
            await this.urlService.update(id, externalUrl, tx);
          }
          break;
        case ContentType.VIDEO:
          if (video) {
            await this.videoService.update(id, video, tx);
          }
          break;
        case ContentType.LESSON:
          if (lesson) {
            await this.lessonService.update(id, lesson, tx);
          }
          break;
      }

      // 4. Return the refreshed entity
      return this.findOne(id, Role.admin, null);
    });
  }

  /**
   * Remove module content and its associated sub-content
   */
  @Log({
    logArgsMessage: ({ id }) => `Removing module content for id ${id}`,
    logSuccessMessage: (result) => result.message,
    logErrorMessage: (err, { id }) =>
      `An error has occurred while removing module content for id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Module content not found'),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete: boolean = false,
  ): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Get current content inside transaction
      const currentContent = await tx.moduleContent.findUnique({
        where: { id },
        select: { contentType: true },
      });

      if (!currentContent) {
        throw new NotFoundException(`Module content with ID ${id} not found`);
      }

      let message = 'Module content successfully removed.';

      // 2. Delegate child deletion/soft-delete (pass tx)
      switch (currentContent.contentType) {
        case ContentType.ASSIGNMENT:
          message = (await this.assignmentService.remove(id, directDelete, tx))
            .message;
          break;
        case ContentType.LESSON:
          message = (await this.lessonService.remove(id, directDelete, tx))
            .message;
          break;
        case ContentType.QUIZ:
          message = (await this.quizService.remove(id, directDelete, tx))
            .message;
          break;
        case ContentType.DISCUSSION:
          message = (await this.discussionService.remove(id, directDelete, tx))
            .message;
          break;
        case ContentType.FILE:
          message = (await this.fileService.remove(id, directDelete, tx))
            .message;
          break;
        case ContentType.URL:
          message = (await this.urlService.remove(id, directDelete, tx))
            .message;
          break;
        case ContentType.VIDEO:
          message = (await this.videoService.remove(id, directDelete, tx))
            .message;
          break;
      }

      // 3. Delete or soft-delete the moduleContent itself
      if (directDelete) {
        await tx.moduleContent.delete({ where: { id } });
      } else {
        await tx.moduleContent.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        message = 'Module content successfully soft-deleted.';
      }

      return { message: message };
    });
  }

  @Log({
    logArgsMessage: ({ userId, filters }) =>
      `Fetching all module contents for user ${userId} with filters ${JSON.stringify(filters)}`,
    logSuccessMessage: (result) =>
      `Successfully fetched ${result.moduleContents.length} content items`,
    logErrorMessage: (err, { userId }) =>
      `Error fetching multiple module contents for user ${userId}: ${err.message}`,
  })
  async findAll(
    @LogParam('filters') filters: FilterModuleContentsDto,
    @LogParam('role') role: Role,
    @LogParam('userId') userId?: string,
  ): Promise<PaginatedModuleContentDto> {
    const whereCondition: Prisma.ModuleContentWhereInput = {
      ...filters.contentFilter,
      moduleSection: filters.sectionFilter,
      module: {
        ...filters.moduleFilter,
        courseOffering: {
          enrollmentPeriod: filters.enrollmentFilter,
          ...(role === Role.student && {
            courseEnrollments: {
              some: {
                studentId: userId,
                status: {
                  in: [
                    CourseEnrollmentStatus.enrolled,
                    CourseEnrollmentStatus.completed,
                    CourseEnrollmentStatus.incomplete,
                    CourseEnrollmentStatus.failed,
                    CourseEnrollmentStatus.dropped,
                  ],
                },
              },
            },
          }),
        },
      },
      ...(role === Role.student && {
        publishedAt: { not: null, lte: new Date() },
      }),
      ...(role !== Role.student && {
        createdAt: {
          gte: filters.contentFilter?.createdAtFrom,
          lte: filters.contentFilter?.createdAtTo,
        },
        updatedAt: {
          gte: filters.contentFilter?.updatedAtFrom,
          lte: filters.contentFilter?.updatedAtTo,
        },
        deletedAt: {
          gte: filters.contentFilter?.deletedAtFrom,
          lte: filters.contentFilter?.deletedAtTo,
        },
      }),
      studentProgress: {
        some: {
          ...(role === Role.student && { user: { id: userId } }),
          // TODO: Add mentor filter where they only see their own students
          status: filters.progressFilter,
          ...(role === Role.admin && {
            user: {
              studentDetails: {
                is: {
                  studentNumber: {
                    contains: filters.search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
            },
          }),
        },
      },
    };

    switch (filters.contentFilter?.contentType) {
      case ContentType.ASSIGNMENT:
        whereCondition.contentType = ContentType.ASSIGNMENT;
        whereCondition.assignment = {
          ...filters.assignmentFilter,
          dueDate: {
            gte: filters.assignmentFilter?.dueDateFrom,
            lte: filters.assignmentFilter?.dueDateTo,
          },
          title: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
          subtitle: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
        };
        break;
      case ContentType.QUIZ:
        whereCondition.contentType = ContentType.QUIZ;
        whereCondition.quiz = {
          ...filters.quizFilter,
          dueDate: {
            gte: filters.quizFilter?.dueDateFrom,
            lte: filters.quizFilter?.dueDateTo,
          },
          title: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
          subtitle: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
        };
        break;
      case ContentType.DISCUSSION:
        whereCondition.contentType = ContentType.DISCUSSION;
        whereCondition.discussion = {
          title: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
          subtitle: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
        };
        break;
      case ContentType.FILE:
        whereCondition.contentType = ContentType.FILE;
        whereCondition.fileResource = {
          title: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
          subtitle: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
        };
        break;
      case ContentType.URL:
        whereCondition.contentType = ContentType.URL;
        whereCondition.externalUrl = {
          title: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
          subtitle: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
        };
        break;
      case ContentType.VIDEO:
        whereCondition.contentType = ContentType.VIDEO;
        whereCondition.video = {
          title: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
          subtitle: {
            contains: filters.search,
            mode: Prisma.QueryMode.insensitive,
          },
        };
        break;
    }

    const [items, meta] = await this.prisma.client.moduleContent
      .paginate({
        where: whereCondition,
        include: {
          assignment: {
            omit: { content: true },
          },
          quiz: {
            omit: { content: true, questions: true },
          },
          lesson: {
            omit: { content: true },
          },
          discussion: {
            omit: { content: true },
          },
          fileResource: {
            omit: { content: true },
          },
          externalUrl: {
            omit: { content: true },
          },
          video: {
            omit: { content: true },
          },
          studentProgress:
            role === Role.student
              ? {
                  where: { userId },
                }
              : true,
        },
        orderBy: [
          {
            assignment: {
              dueDate: 'asc',
            },
          },
          {
            quiz: {
              dueDate: 'asc',
            },
          },
        ],
      })
      .withPages({
        limit: 10,
        page: filters.page,
        includePageCount: true,
      });

    return { moduleContents: items, meta };
  }

  /**
   * Creates or updates a content progress record for a given user and module content.
   *
   * @async
   * @param {string} moduleId - The UUID of the module that contains the content.
   * @param {string} moduleContentId - The UUID of the module content for which progress is being tracked.
   * @param {AuthUser} user - The currently authenticated user.
   * @returns {Promise<DetailedContentProgressDto>} - The upserted content progress record, including related content details.
   * @throws {BadRequestException} - If the user ID is missing or invalid.
   * @throws {NotFoundException} - If the related User, Module, or ModuleContent record does not exist.
   */
  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Inserting content progress for content ${moduleContentId}`,
    logSuccessMessage: (result) =>
      `Inserted content progress ${result.id} content ${result.moduleContent.id}`,
    logErrorMessage: (err, { moduleContentId }) =>
      `Inserting content progress for content ${moduleContentId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: () =>
      new NotFoundException(
        `Required records (moduleId, moduleContentId, userId) not found`,
      ),
  })
  async createContentProgress(
    @LogParam('moduleId') moduleId: string,
    @LogParam('moduleContentId') moduleContentId: string,
    user: AuthUser,
  ): Promise<DetailedContentProgressDto> {
    const userId = user.user_metadata.user_id;
    if (!userId) {
      throw new BadRequestException(`Invalid userId ${userId}`);
    }

    return await this.prisma.client.contentProgress.upsert({
      where: {
        userId_moduleContentId: {
          userId,
          moduleContentId,
        },
      },
      create: {
        userId,
        moduleId,
        moduleContentId,
        completedAt: new Date(),
      },
      update: {
        completedAt: new Date(),
      },
      include: {
        moduleContent: {
          select: {
            id: true,
            contentType: true,
            order: true,
            moduleSectionId: true,
            moduleId: true,
          },
        },
      },
    });
  }

  /**
   * Retrieves all content progress records for a specific module and user.
   *
   * @async
   * @param {string} moduleId - The UUID of the module for which content progress is being fetched.
   * @param {string | undefined} studentId - The UUID of the student. Required if the current user is a mentor.
   * @param {AuthUser} user - The currently authenticated user.
   * @returns {Promise<DetailedContentProgressDto[]>} - An array of content progress records with related module content details.
   * @throws {BadRequestException} - If the user ID is missing or invalid.
   */
  @Log({
    logArgsMessage: ({ moduleId, studentId }) =>
      `Fetching content progress for module ${moduleId} student ${studentId ?? 'self'}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.length} content progress records`,
    logErrorMessage: (err, { moduleId, studentId }) =>
      `Fetching content progress for module ${moduleId} student ${studentId ?? 'self'} | Error: ${err.message}`,
  })
  async findAllContentProgress(
    @LogParam('moduleId') moduleId: string,
    @LogParam('studentId') studentId: string | undefined,
    user: AuthUser,
  ): Promise<DetailedContentProgressDto[]> {
    const userId =
      user.user_metadata.role !== 'student'
        ? studentId
        : user.user_metadata.user_id;

    if (!userId) {
      throw new BadRequestException(
        user.user_metadata.role === 'student'
          ? 'Invalid userId'
          : 'Mentors and admins must provide a studentId',
      );
    }

    return await this.prisma.client.contentProgress.findMany({
      where: { moduleId, userId },
      include: {
        moduleContent: {
          select: {
            id: true,
            contentType: true,
            order: true,
            moduleSectionId: true,
            moduleId: true,
          },
        },
      },
      orderBy: { moduleContent: { order: 'asc' } },
    });
  }
}
