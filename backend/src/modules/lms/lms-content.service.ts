import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { omitAuditDates, omitPublishFields } from '@/config/prisma_omit.config';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { AssignmentService } from '@/modules/lms/content/assignment/assignment.service';
import { DiscussionService } from '@/modules/lms/content/discussion/discussion.service';
import { FileService } from '@/modules/lms/content/file/file.service';
import { LessonService } from '@/modules/lms/content/lesson/lessson.service';
import { QuizService } from '@/modules/lms/content/quiz/quiz.service';
import { UrlService } from '@/modules/lms/content/url/url.service';
import { VideoService } from '@/modules/lms/content/video/video.service';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';
import { FilterModuleContentsDto } from '@/modules/lms/dto/filter-module-contents.dto';
import { FilterTodosDto } from '@/modules/lms/dto/filter-todos.dto';
import {
  ModuleTreeDto,
  ModuleTreeSectionDto,
} from '@/modules/lms/dto/module-tree.dto';
import { PaginatedModuleContentDto } from '@/modules/lms/dto/paginated-module-content.dto';
import { PaginatedTodosDto } from '@/modules/lms/dto/paginated-todos.dto';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentType,
  CourseEnrollmentStatus,
  EnrollmentStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { DetailedContentProgressDto } from './dto/detailed-content-progress.dto';

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
    const { title, ...rest } = createModuleContentDto;

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
          await tx.assignment.create({
            data: { title, moduleContent: { connect: { id: content.id } } },
          });
          break;

        case ContentType.QUIZ:
          await tx.quiz.create({
            data: { title, moduleContent: { connect: { id: content.id } } },
          });
          break;

        case ContentType.DISCUSSION:
          await tx.discussion.create({
            data: { title, moduleContent: { connect: { id: content.id } } },
          });
          break;

        case ContentType.FILE:
          await tx.fileResource.create({
            data: { title, moduleContent: { connect: { id: content.id } } },
          });
          break;

        case ContentType.URL:
          await tx.externalUrl.create({
            data: { title, moduleContent: { connect: { id: content.id } } },
          });
          break;

        case ContentType.VIDEO:
          await tx.video.create({
            data: { title, moduleContent: { connect: { id: content.id } } },
          });
          break;

        case ContentType.LESSON:
          await tx.lesson.create({
            data: { title, moduleContent: { connect: { id: content.id } } },
          });
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

    if (role === Role.student && userId) {
      baseInclude.studentProgress = {
        where: { studentId: userId },
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
      baseInclude.discussion = {
        include: {
          posts: {
            include: {
              replies: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      };
    } else if (contentType === ContentType.FILE) {
      baseInclude.file = true;
    } else if (contentType === ContentType.URL) {
      baseInclude.url = true;
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
    @LogParam('dto') dto: UpdateContentDto,
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

      if (dto.contentType !== currentContent.contentType) {
        throw new BadRequestException(
          'Changing contentType is not allowed. Please remove and recreate the content.',
        );
      }

      const data: Prisma.ModuleContentUpdateInput = {
        order: dto.order,
      };

      if (dto.sectionId) {
        data.moduleSection = { connect: { id: dto.sectionId } };
      }

      // 2. Update the base module content
      await tx.moduleContent.update({
        where: { id },
        data,
      });

      const { sectionId, contentType, ...updateFields } = dto;

      // 3. Delegate to specialized services (pass `tx`)
      switch (contentType) {
        case ContentType.ASSIGNMENT:
          await this.assignmentService.update(id, updateFields, tx);
          break;
        case ContentType.QUIZ:
          await this.quizService.update(id, updateFields, tx);
          break;
        case ContentType.DISCUSSION:
          await this.discussionService.update(id, updateFields, tx);
          break;
        case ContentType.FILE:
          await this.fileService.update(id, updateFields, tx);
          break;
        case ContentType.URL:
          await this.urlService.update(id, updateFields, tx);
          break;
        case ContentType.VIDEO:
          await this.videoService.update(id, updateFields, tx);
          break;
        case ContentType.LESSON:
          await this.lessonService.update(id, dto, tx);
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
    const whereCondition: Prisma.ModuleContentWhereInput = {};
    const now = new Date();

    //TODO: do not remove the console logs yet since this function is complex
    console.log('filters', filters);

    // // ----- Base filters -----
    // if (filters.contentFilter) {
    //   console.log('setting contentFilter');
    //   Object.assign(whereCondition, filters.contentFilter);
    // }
    //
    // console.log('step 1');
    // console.dir(whereCondition, { depth: null });
    //
    // // Section filter
    // if (filters.sectionFilter) {
    //   console.log('setting moduleSection');
    //   whereCondition.moduleSection = filters.sectionFilter;
    // }
    //
    // console.log('step 2');
    // console.dir(whereCondition, { depth: null });

    // Module filter (with enrollment & student constraints)
    if (
      // filters.moduleFilter ||
      filters.enrollmentPeriod ||
      role === Role.student
    ) {
      console.log('setting module');
      whereCondition.module = {
        // ...(filters.moduleFilter ?? {}),
        ...(filters.enrollmentPeriod || role === Role.student
          ? {
              courseOffering: {
                ...(filters.enrollmentPeriod
                  ? { enrollmentPeriod: filters.enrollmentPeriod }
                  : {}),
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
            }
          : {}),
      };
    }

    console.log('step 3');
    console.dir(whereCondition, { depth: null });

    // Role-specific filters
    if (role === Role.student) {
      console.log('setting publishedAt to not null and lte now');
      whereCondition.publishedAt = { not: null, lte: now };
    } else {
      // if (
      //   filters.contentFilter?.createdAtFrom ||
      //   filters.contentFilter?.createdAtTo
      // ) {
      //   console.log('filtering by createdAt');
      //   whereCondition.createdAt = {
      //     gte: filters.contentFilter.createdAtFrom,
      //     lte: filters.contentFilter.createdAtTo,
      //   };
      // }
      // if (
      //   filters.contentFilter?.updatedAtFrom ||
      //   filters.contentFilter?.updatedAtTo
      // ) {
      //   console.log('filtering by updatedAt');
      //   whereCondition.updatedAt = {
      //     gte: filters.contentFilter.updatedAtFrom,
      //     lte: filters.contentFilter.updatedAtTo,
      //   };
      // }
      // if (
      //   filters.contentFilter?.deletedAtFrom ||
      //   filters.contentFilter?.deletedAtTo
      // ) {
      //   console.log('filtering by deletedAt');
      //   whereCondition.deletedAt = {
      //     gte: filters.contentFilter.deletedAtFrom,
      //     lte: filters.contentFilter.deletedAtTo,
      //   };
      // }
    }

    console.log('step 4');
    console.dir(whereCondition, { depth: null });

    // Student progress filter
    if (
      // filters.progressFilter ||
      role === Role.student ||
      role === Role.admin
    ) {
      console.log('setting studentProgress');
      whereCondition.studentProgress = {
        some: {
          ...(role === Role.student && { user: { id: userId } }),
          ...(filters.progress && { status: filters.progress }),
          // Removed invalid studentDetails.studentNumber filter
        },
      };
    }

    console.log('step 5');
    console.dir(whereCondition, { depth: null });

    // ----- Content-type specific filters -----
    if (filters.contentType) {
      console.log('setting contentType');
      whereCondition.contentType = filters.contentType;

      switch (filters.contentType) {
        case ContentType.ASSIGNMENT:
          console.log('setting assignment');
          whereCondition.assignment = {
            // ...(filters.assignmentFilter ?? {}),
            // ...(filters.assignmentFilter?.dueDateFrom ||
            // filters.assignmentFilter?.dueDateTo
            //   ? {
            //       dueDate: {
            //         gte: filters.assignmentFilter?.dueDateFrom,
            //         lte: filters.assignmentFilter?.dueDateTo,
            //       },
            //     }
            //   : {}),
            ...(filters.search && {
              OR: [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { subtitle: { contains: filters.search, mode: 'insensitive' } },
              ],
            }),
          };
          break;

        case ContentType.QUIZ:
          console.log('setting quiz');
          whereCondition.quiz = {
            // ...(filters.quizFilter ?? {}),
            // ...(filters.quizFilter?.dueDateFrom || filters.quizFilter?.dueDateTo
            //   ? {
            //       dueDate: {
            //         gte: filters.quizFilter?.dueDateFrom,
            //         lte: filters.quizFilter?.dueDateTo,
            //       },
            //     }
            //   : {}),
            ...(filters.search && {
              OR: [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { subtitle: { contains: filters.search, mode: 'insensitive' } },
              ],
            }),
          };
          break;

        case ContentType.DISCUSSION:
          console.log('setting discussion');
          whereCondition.discussion = filters.search
            ? {
                OR: [
                  { title: { contains: filters.search, mode: 'insensitive' } },
                  {
                    subtitle: { contains: filters.search, mode: 'insensitive' },
                  },
                ],
              }
            : {};
          break;

        case ContentType.FILE:
          console.log('setting file');
          whereCondition.file = filters.search
            ? {
                OR: [
                  { title: { contains: filters.search, mode: 'insensitive' } },
                  {
                    subtitle: { contains: filters.search, mode: 'insensitive' },
                  },
                ],
              }
            : {};
          break;

        case ContentType.URL:
          console.log('setting url');
          whereCondition.url = filters.search
            ? {
                OR: [
                  { title: { contains: filters.search, mode: 'insensitive' } },
                  {
                    subtitle: { contains: filters.search, mode: 'insensitive' },
                  },
                ],
              }
            : {};
          break;

        case ContentType.VIDEO:
          console.log('setting video');
          whereCondition.video = filters.search
            ? {
                OR: [
                  { title: { contains: filters.search, mode: 'insensitive' } },
                  {
                    subtitle: { contains: filters.search, mode: 'insensitive' },
                  },
                ],
              }
            : {};
          break;

        case ContentType.LESSON:
          console.log('setting lesson');
          whereCondition.lesson = filters.search
            ? {
                OR: [
                  { title: { contains: filters.search, mode: 'insensitive' } },
                  {
                    subtitle: { contains: filters.search, mode: 'insensitive' },
                  },
                ],
              }
            : {};
          break;
      }
    } else if (filters.search) {
      console.log('setting global search');
      whereCondition.OR = [
        // ----- Content titles/subtitles -----
        {
          lesson: { title: { contains: filters.search, mode: 'insensitive' } },
        },
        {
          lesson: {
            subtitle: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          assignment: {
            title: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          assignment: {
            subtitle: { contains: filters.search, mode: 'insensitive' },
          },
        },
        { quiz: { title: { contains: filters.search, mode: 'insensitive' } } },
        {
          quiz: { subtitle: { contains: filters.search, mode: 'insensitive' } },
        },
        {
          discussion: {
            title: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          discussion: {
            subtitle: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          file: {
            title: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          url: {
            title: { contains: filters.search, mode: 'insensitive' },
          },
        },
        { video: { title: { contains: filters.search, mode: 'insensitive' } } },

        // ----- Student name / student number -----
        {
          module: {
            courseOffering: {
              courseEnrollments: {
                some: {
                  student: {
                    OR: [
                      // search by full or partial student name
                      {
                        firstName: {
                          contains: filters.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        lastName: {
                          contains: filters.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        middleName: {
                          contains: filters.search,
                          mode: 'insensitive',
                        },
                      },
                      // search by student number
                      {
                        studentDetails: {
                          studentNumber: {
                            contains: filters.search,
                            mode: 'insensitive',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      ];
    }

    console.log('step 6');
    console.dir(whereCondition, { depth: null });

    // ----- Mentor filtering -----
    if (role === Role.mentor && userId) {
      // 1. Find all CourseSection IDs where mentorId = userId
      const mentorSections = await this.prisma.client.courseSection.findMany({
        where: { mentorId: userId },
        select: { id: true },
      });
      const mentorSectionIds = mentorSections.map((s) => s.id);

      // 2. Find all SectionModule records for those section IDs
      const sectionModules = await this.prisma.client.sectionModule.findMany({
        where: { courseSectionId: { in: mentorSectionIds } },
        select: { moduleId: true },
      });
      const allowedModuleIds = sectionModules.map((sm) => sm.moduleId);

      // 3. Filter ModuleContent by those module IDs
      whereCondition.moduleId = { in: allowedModuleIds };
    }

    // ----- Final Query -----
    const [items, meta] = await this.prisma.client.moduleContent
      .paginate({
        where: whereCondition,
        include: {
          assignment: { omit: { content: true } },
          quiz: { omit: { content: true, questions: true } },
          lesson: { omit: { content: true } },
          discussion: { omit: { content: true } },
          file: { omit: { content: true } },
          url: { omit: { content: true } },
          video: { omit: { content: true } },
          studentProgress:
            role === Role.student ? { where: { studentId: userId } } : true,
        },
        orderBy: [
          { assignment: { dueDate: 'asc' } },
          { quiz: { dueDate: 'asc' } },
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
   * Finds ModuleContent tree for a given Module.
   *
   * @param moduleId The ID of the Module.
   * @param role The role of the user.
   * @param userId The ID of the user. Used for students to filter by their progress.
   * @param filters The filter criteria.
   * @returns An object containing the ModuleContent records and pagination metadata.
   */
  @Log({
    logArgsMessage: ({ moduleId, role, userId }) =>
      `Fetching all module content tree for module ${moduleId} for user ${userId} with role ${role}`,
    logSuccessMessage: (_, { userId }) =>
      `Successfully fetched module content tree for user ${userId}`,
    logErrorMessage: (err: any, { moduleId, userId, role }) =>
      `Error fetching module contents tree for module ${moduleId} of user ${userId} with role ${role}: ${err.message}`,
  })
  async findModuleTree(
    @LogParam('moduleId') moduleId: string,
    @LogParam('role') role: Role,
    @LogParam('userId') userId?: string,
  ): Promise<ModuleTreeDto> {
    if (!isUUID(moduleId)) {
      throw new BadRequestException('Invalid module ID format');
    }

    // 1. Fetch everything flat
    const module: ModuleTreeDto =
      await this.prisma.client.module.findUniqueOrThrow({
        where: {
          id: moduleId,
          ...(role !== Role.admin && {
            // This fixes the issue for not being able to
            // fetch published modules.
            moduleSections: {
              some: { publishedAt: { not: null } },
            },
          }),
          deletedAt: null,
        },
        select: {
          id: true,
          courseId: true,
          title: true,
          publishedAt: true,
          toPublishAt: true,
          unpublishedAt: true,
          createdAt: true,
          updatedAt: true,
          ...(role === Role.student &&
            userId && {
              progresses: {
                where: { studentId: userId },
                select: {
                  id: true,
                  moduleContentId: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            }),
          moduleSections: {
            where: {
              ...(role !== Role.admin && { publishedAt: { not: null } }),
              deletedAt: null,
            },
            select: {
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
                where: {
                  ...(role !== Role.admin && { publishedAt: { not: null } }),
                  deletedAt: null,
                },
                select: {
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
                    omit: { content: true },
                  },
                  quiz: { omit: { content: true, questions: true } },
                  discussion: { omit: { content: true } },
                  video: { omit: { content: true } },
                  url: { omit: { content: true } },
                  file: { omit: { content: true } },
                  ...(role === Role.student && userId
                    ? { studentProgress: { where: { studentId: userId } } }
                    : { studentProgress: true }),
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

    // 2. Build tree of sections recursively
    const sectionMap = new Map<string, ModuleTreeSectionDto>();

    if (!module.moduleSections) {
      module.moduleSections = [];
    }
    for (const section of module.moduleSections) {
      section.subsections = [];
      sectionMap.set(section.id, section);
    }

    const rootSections: ModuleTreeSectionDto[] = [];
    for (const section of module.moduleSections) {
      if (section.parentSectionId) {
        const parent = sectionMap.get(section.parentSectionId);
        if (parent) {
          parent.subsections?.push(section);
        }
      } else {
        rootSections.push(section);
      }
    }

    return {
      ...module,
      moduleSections: rootSections,
    };
  }

  /**
   * Creates or updates a content progress record for a given user and module content.
   *
   * @async
   * @param {string} moduleId - The UUID of the module that contains the content.
   * @param {string} moduleContentId - The UUID of the module content for which progress is being tracked.
   * @param {string} userId - The UUID of the user making the request.
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
    @LogParam('userId') userId: string,
  ): Promise<DetailedContentProgressDto> {
    if (!userId) {
      throw new BadRequestException(`Invalid userId ${userId}`);
    }

    return await this.prisma.client.contentProgress.upsert({
      where: {
        studentId_moduleContentId: {
          studentId: userId,
          moduleContentId,
        },
      },
      create: {
        studentId: userId,
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
   * @param {string} userId - The UUID of the user making this request.
   * @param {Role} role - The role of the user making this request.
   * @param {string} studentId - The UUID of the student owning the content progress.
   * @returns {Promise<DetailedContentProgressDto[]>} - An array of content progress records with related module content details.
   * @throws {BadRequestException} - If the student ID is missing or invalid.
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
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    @LogParam('studentId') studentId?: string,
  ): Promise<DetailedContentProgressDto[]> {
    if (!studentId && role !== Role.student) {
      throw new BadRequestException(
        'Mentors and admins must provide a studentId',
      );
    }

    return await this.prisma.client.contentProgress.findMany({
      where: { moduleId, studentId: studentId ?? userId },
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

  @Log({
    logArgsMessage: ({ studentId, filters }) =>
      `Fetching todos for student ${studentId} in active term with filters ${JSON.stringify(filters)}`,
    logSuccessMessage: (result) =>
      `Successfully fetched ${result.todos.length} todos`,
    logErrorMessage: (err, { studentId }) =>
      `Error fetching todos for user ${studentId}: ${err.message}`,
  })
  async findTodos(
    @LogParam('studentId') studentId: string,
    @LogParam('filters') filters: FilterTodosDto,
  ): Promise<PaginatedTodosDto> {
    // First, get the active enrollment period
    const activeTerm = await this.prisma.client.enrollmentPeriod.findFirst({
      where: {
        status: EnrollmentStatus.active,
      },
    });

    if (!activeTerm) {
      return {
        todos: [],
        meta: {
          isFirstPage: true,
          isLastPage: true,
          currentPage: 1,
          previousPage: 0,
          nextPage: 0,
          pageCount: 1,
          totalCount: 0,
        },
      };
    }

    // Get user's enrolled courses in active term
    const userEnrollments = await this.prisma.client.courseEnrollment.findMany({
      where: {
        studentId,
        status: CourseEnrollmentStatus.enrolled,
        courseOffering: {
          periodId: activeTerm.id,
        },
      },
      include: {
        courseOffering: {
          include: {
            course: true,
          },
        },
      },
    });

    const courseOfferingIds = userEnrollments.map(
      (enrollment) => enrollment.courseOfferingId,
    );

    // Get todos (assignments and quizzes with due dates)
    const whereCondition: Prisma.ModuleContentWhereInput = {
      module: {
        courseOfferingId: { in: courseOfferingIds },
      },
      OR: [
        {
          contentType: ContentType.ASSIGNMENT,
          assignment: {
            dueDate: { gte: new Date() },
          },
        },
        {
          contentType: ContentType.QUIZ,
          quiz: {
            dueDate: { gte: new Date() },
          },
        },
      ],
      publishedAt: { lte: new Date() },
    };

    const [todos, meta] = await this.prisma.client.moduleContent
      .paginate({
        where: whereCondition,
        include: {
          assignment: true,
          quiz: true,
          module: {
            include: {
              courseOffering: {
                include: {
                  course: true,
                  enrollmentPeriod: true,
                },
              },
            },
          },
          studentProgress: {
            where: { studentId },
          },
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
        limit: filters.limit ?? 10,
        page: filters.page ?? 1,
        includePageCount: true,
      });

    // Transform the results to include progress status
    const items = todos.map((todo) => {
      const title = todo.assignment?.title || todo.quiz?.title;
      const dueDate = todo.assignment?.dueDate || todo.quiz?.dueDate;

      if (!title) {
        throw new Error(`Content ${todo.id} is missing a title`);
      }
      if (!dueDate) {
        throw new Error(`Content ${todo.id} is missing a due date`);
      }

      return {
        id: todo.id,
        type: todo.contentType,
        title,
        dueDate,
        moduleName: todo.module.title,
      };
    });

    return { todos: items, meta };
  }
}
