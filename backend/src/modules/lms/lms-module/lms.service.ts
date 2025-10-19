import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { ModuleDto } from '@/generated/nestjs-dto/module.dto';
import { UpdateModuleDto } from '@/generated/nestjs-dto/update-module.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentType,
  CourseEnrollmentStatus,
  EnrollmentStatus,
  Prisma,
  ProgressStatus,
  Role,
} from '@prisma/client';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { FilterModulesDto } from './dto/filter-modules.dto';
import {
  DetailedModulesDto,
  PaginatedModulesDto,
} from './dto/paginated-module.dto';
import { FilterTodosDto } from '@/modules/lms/lms-module/dto/filter-todos.dto';
import { PaginatedTodosDto } from '@/modules/lms/lms-content/dto/paginated-todos.dto';
import {
  ModuleTreeDto,
  ModuleTreeSectionDto,
} from '@/modules/lms/lms-module/dto/module-tree.dto';
import { mapModuleContentToModuleTreeItem } from '@/modules/lms/lms-content/helper/mapper';
import { ModuleTreeContentItem } from '@/modules/lms/lms-content/types';
import { MessageDto } from '@/common/dto/message.dto';

@Injectable()
export class LmsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Initializes a base module for the given course.
   *
   * This is called during course creation and generates an empty module
   * linked to the course, with no enrollment period assigned initially.
   *
   * @async
   * @param {string} courseId - The UUID of the course.
   *
   * @returns {Promise<ModuleDto>} The newly created base module entity.
   *
   * @throws {NotFoundException} If no course is found with the given ID.
   */

  @Log({
    logArgsMessage: ({ courseId }) =>
      `Initializing empty module for course id ${courseId}`,
    logSuccessMessage: (_, { courseId }) =>
      `Initialized empty module for course id ${courseId}`,
    logErrorMessage: (err, { courseId }) =>
      `Initializing empty module for course ${courseId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { courseId }) =>
      new NotFoundException(`Course not found for id ${courseId}`),
  })
  async initializeCourseModule(
    @LogParam('courseId') courseId: string,
  ): Promise<ModuleDto> {
    const course = await this.prisma.client.course.findUniqueOrThrow({
      where: { id: courseId },
      select: { id: true, name: true },
    });

    return await this.prisma.client.module.create({
      data: {
        courseId: course.id,
        title: course.name,
        courseOfferingId: null,
      },
    });
  }

  /**
   * Clones learning modules into the given enrollment period.
   *
   * This includes:
   * - Modules
   * - Module sections
   * - Module contents
   *
   *
   * @async
   * @param {string} enrollmentPeriodId - The UUID of the target enrollment period
   *                                      where modules should be copied into.
   * @throws {NotFoundException} If the enrollment period does not exist.
   * @throws {Error} If any part of the transaction fails (all changes are rolled back).
   */
  @Log({
    logArgsMessage: ({ enrollmentPeriodId }) =>
      `Cloning modules for enrollment period ${enrollmentPeriodId}`,
    logSuccessMessage: (_, { enrollmentPeriodId }) =>
      `Cloned modules for enrollment period id ${enrollmentPeriodId}`,
    logErrorMessage: (err, { enrollmentPeriodId }) =>
      `Cloning modules for enrollment period ${enrollmentPeriodId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { enrollmentPeriodId }) =>
      new NotFoundException(
        `Enrollment period not found for id ${enrollmentPeriodId}`,
      ),
  })
  async cloneMostRecentModules(
    @LogParam('enrollmentPeriodId') enrollmentPeriodId: string,
  ) {
    const currentEnrollment =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id: enrollmentPeriodId },
        include: { courseOfferings: true },
      });

    // Fetch latest module per course
    const latestModules = await this.prisma.client.module.findMany({
      where: {
        courseId: {
          in: currentEnrollment.courseOfferings.map((co) => co.courseId),
        },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['courseId'],
      include: {
        moduleSections: {
          include: {
            moduleContents: {
              include: {
                assignment: true,
              },
            },
          },
        },
      },
    });

    await this.prisma.client.$transaction(async (tx) => {
      for (const module of latestModules) {
        // Find the course offering for the current enrollment period
        const courseOffering = currentEnrollment.courseOfferings.find(
          (co) => co.courseId === module.courseId,
        );

        if (!courseOffering) {
          throw new Error(
            `Course offering not found for courseId ${module.courseId}`,
          );
        }

        if (module.courseOfferingId === courseOffering.id) {
          continue;
        }

        // Create the new module
        const newModule = await tx.module.create({
          data: {
            title: module.title,
            courseId: module.courseId,
            courseOfferingId: courseOffering.id,
            publishedAt: null,
            unpublishedAt: null,
          },
        });

        for (const oldSection of module.moduleSections) {
          const newSection = await tx.moduleSection.create({
            data: {
              moduleId: newModule.id,
              title: oldSection.title,
              order: oldSection.order,
              publishedAt: null, // Reset publication status
              unpublishedAt: null,
            },
          });

          for (const oldContent of oldSection.moduleContents) {
            // Create the base module content
            const newContent = await tx.moduleContent.create({
              data: {
                moduleSectionId: newSection.id,
                title: oldContent.title,
                subtitle: oldContent.subtitle,
                content: oldContent.content,
                order: oldContent.order,
                contentType: oldContent.contentType,
                publishedAt: null, // Reset publication status
                unpublishedAt: null,
              },
            });

            // Clone content-specific data based on type
            switch (oldContent.contentType) {
              case 'ASSIGNMENT':
                if (oldContent.assignment) {
                  await tx.assignment.create({
                    data: {
                      moduleContentId: newContent.id,
                      mode: oldContent.assignment.mode,
                      dueDate: oldContent.assignment.dueDate,
                      maxScore: oldContent.assignment.maxScore,
                      maxAttempts: oldContent.assignment.maxAttempts,
                      allowLateSubmission:
                        oldContent.assignment.allowLateSubmission,
                      latePenalty: oldContent.assignment.latePenalty,
                      gracePeriodMinutes:
                        oldContent.assignment.gracePeriodMinutes,
                      rubricTemplateId: oldContent.assignment.rubricTemplateId,
                    },
                  });
                }
                break;
            }
          }
        }
      }
    });
  }

  /**
   * Retrieves a single module by ID with role-based access control.
   *
   * - Admins can access any module.
   * - Mentors can access modules for course sections they are assigned to.
   * - Students can access modules for course sections they are enrolled in.
   *
   * The returned module includes `courseOffering` (with `course`, `enrollmentPeriod`,
   * and `courseSections`) and `moduleSections` (without contents).
   *
   * @param id - Module UUID
   * @param role - Role of the requesting user
   * @param userId - ID of the requesting user (nullable for admins)
   * @returns The module DTO with related offering and sections
   * @throws BadRequestException when the id is not a valid UUID
   * @throws NotFoundException when the module is not accessible/does not exist
   */
  @Log({
    logArgsMessage: ({ id, role, userId }) =>
      `Fetching module ${id} for role=${role} user=${userId}`,

    logSuccessMessage: (result, { id }) => `Fetched module ${id}`,
    logErrorMessage: (err, { id }) =>
      `Fetching module ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Module ${id} not found`),
  })
  async findOne(
    @LogParam('id') id: string,
    @LogParam('role') role: Role,
    @LogParam('userId') userId: string | null,
  ): Promise<DetailedModulesDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module ID format');
    }

    // Build role-based where clause
    const where: Prisma.ModuleWhereInput = { id };

    if (role === Role.student && userId) {
      where.courseOffering = {
        is: {
          courseSections: {
            some: { courseEnrollments: { some: { studentId: userId } } },
          },
        },
      };
    } else if (role === Role.mentor && userId) {
      where.courseOffering = {
        is: {
          courseSections: { some: { mentorId: userId } },
        },
      };
    }

    // Always include course sections and their enrollments, then filter in JS
    return await this.prisma.client.module.findFirstOrThrow({
      where,
      include: {
        course: true,
        courseOffering: {
          include: {
            courseSections: {
              where:
                role == Role.student && userId
                  ? { courseEnrollments: { some: { studentId: userId } } }
                  : undefined,
              include: {
                mentor: true,
              },
            },
            enrollmentPeriod: true,
          },
        },
      },
    });
  }

  /**
   * Retrieves a paginated list of modules available to a student, filtered by search criteria and enrollment.
   *
   * - Students see only modules from courses they are enrolled in.
   * - Supports filtering by course name, course code, year, and term.
   * - Results are sorted by the most recent enrollment period (startDate descending).
   *
   * @async
   * @param {string} userId - The student user ID making the request.
   * @param {FilterModulesDto} filters - Filters for search, pagination, year, and term.
   * @returns {Promise<PaginatedModulesDto>} A list of matching modules and pagination metadata.
   * @throws {NotFoundException} If no modules are found for the student.
   */
  @Log({
    logArgsMessage: ({ userId, filters }) =>
      `Fetching modules for student ${userId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { userId }) =>
      `Fetched ${result.modules.length} modules for student ${userId}`,
    logErrorMessage: (err, { userId }) =>
      `Fetching modules for student ${userId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { userId }) =>
      new NotFoundException(`No modules found for student ${userId}`),
  })
  async findAllForStudent(
    userId: string,
    filters: FilterModulesDto,
  ): Promise<PaginatedModulesDto> {
    const where: Prisma.ModuleWhereInput = {};
    const page = filters.page || 1;

    // Build search conditions
    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      where.AND = searchTerms.map((term) => ({
        OR: [
          {
            course: {
              is: {
                courseCode: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
          {
            course: {
              is: {
                name: { contains: term, mode: Prisma.QueryMode.insensitive },
              },
            },
          },
        ],
      }));
    }

    const enrollmentPeriod =
      await this.prisma.client.enrollmentPeriod.findFirst({
        orderBy: { createdAt: 'desc' },
      });

    // Only include modules from courses the student is enrolled in
    where.courseOffering = {
      is: {
        courseEnrollments: { some: { studentId: userId } },
        enrollmentPeriod: {
          is: {
            id: enrollmentPeriod?.id,
          },
        },
      },
    };

    // Apply year/term filters if provided
    if (filters.enrollmentPeriodId) {
      if (
        where.courseOffering &&
        'is' in where.courseOffering &&
        where.courseOffering.is
      ) {
        where.courseOffering.is = {
          ...where.courseOffering.is,
          enrollmentPeriod: {
            id: filters.enrollmentPeriodId,
          },
        };
      } else {
        where.courseOffering = {
          enrollmentPeriod: {
            id: filters.enrollmentPeriodId,
          },
        };
      }
    }

    const [modules, meta] = await this.prisma.client.module
      .paginate({
        where,
        orderBy: {
          courseOffering: { enrollmentPeriod: { startDate: 'desc' } },
        },
        include: {
          course: true,
          courseOffering: {
            include: {
              courseSections: {
                // Only include course sections that are relevant to the student
                where: { courseEnrollments: { some: { studentId: userId } } },
                include: {
                  mentor: true,
                },
              },
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    return { modules, meta };
  }

  /**
   * Retrieves a paginated list of modules available to a mentor, filtered by search criteria and teaching assignment.
   *
   * - Mentors see only modules from courses they are assigned to teach.
   * - Supports filtering by course name, course code, year, and term.
   * - Results are sorted by the most recent enrollment period (startDate descending).
   *
   * @async
   * @param {string} userId - The mentor user ID making the request.
   * @param {FilterModulesDto} filters - Filters for search, pagination, year, and term.
   * @returns {Promise<PaginatedModulesDto>} A list of matching modules and pagination metadata.
   * @throws {NotFoundException} If no modules are found for the mentor.
   */
  @Log({
    logArgsMessage: ({ userId, filters }) =>
      `Fetching modules for mentor ${userId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { userId }) =>
      `Fetched ${result.modules.length} modules for mentor ${userId}`,
    logErrorMessage: (err, { userId }) =>
      `Fetching modules for mentor ${userId} | Error: ${err.message}`,
  })
  async findAllForMentor(
    @LogParam('userId') userId: string,
    @LogParam('filters') filters: FilterModulesDto,
  ): Promise<PaginatedModulesDto> {
    const where: Prisma.ModuleWhereInput = {};
    const page = filters.page || 1;

    // Build search conditions
    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      where.AND = searchTerms.map((term) => ({
        OR: [
          {
            course: {
              is: {
                courseCode: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
          {
            course: {
              is: {
                name: { contains: term, mode: Prisma.QueryMode.insensitive },
              },
            },
          },
        ],
      }));
    }

    const enrollmentPeriod =
      await this.prisma.client.enrollmentPeriod.findFirst({
        orderBy: { createdAt: 'desc' },
      });

    where.courseOffering = {
      is: {
        courseSections: { some: { mentorId: userId } },
        enrollmentPeriod: {
          is: {
            id: enrollmentPeriod?.id,
          },
        },
      },
    };

    // Apply year/term filters if provided
    if (filters.enrollmentPeriodId) {
      if (
        where.courseOffering &&
        'is' in where.courseOffering &&
        where.courseOffering.is
      ) {
        where.courseOffering.is = {
          ...where.courseOffering.is,
          enrollmentPeriod: {
            id: filters.enrollmentPeriodId,
          },
        };
      } else {
        where.courseOffering = {
          enrollmentPeriod: {
            id: filters.enrollmentPeriodId,
          },
        };
      }
    }

    const [modules, meta] = await this.prisma.client.module
      .paginate({
        where,
        orderBy: {
          courseOffering: { enrollmentPeriod: { startDate: 'desc' } },
        },
        include: {
          course: true,
          courseOffering: {
            include: {
              courseSections: {
                include: {
                  mentor: true,
                },
              },
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    return { modules, meta };
  }

  /**
   * Retrieves a paginated list of all modules for admins, filtered by search criteria, year, and term.
   *
   * - Admins see all modules across all courses and offerings.
   * - Supports filtering by course name, course code, year, and term.
   * - Results are sorted by the most recent enrollment period (startDate descending).
   *
   * @async
   * @param {FilterModulesDto} filters - Filters for search, pagination, year, and term.
   * @returns {Promise<PaginatedModulesDto>} A list of all matching modules and pagination metadata.
   * @throws {NotFoundException} If no modules are found for the admin.
   */
  @Log({
    logArgsMessage: ({ userId, filters }) =>
      `Fetching modules for admin ${userId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { userId }) =>
      `Fetched ${result.modules.length} modules for admin ${userId}`,
    logErrorMessage: (err, { userId }) =>
      `Fetching modules for admin ${userId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { userId }) =>
      new NotFoundException(`No modules found for admin ${userId}`),
  })
  async findAllForAdmin(
    filters: FilterModulesDto,
  ): Promise<PaginatedModulesDto> {
    const where: Prisma.ModuleWhereInput = {};
    const page = filters.page || 1;

    // Build search conditions
    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      where.AND = searchTerms.map((term) => ({
        OR: [
          {
            course: {
              is: {
                courseCode: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
          {
            course: {
              is: {
                name: { contains: term, mode: Prisma.QueryMode.insensitive },
              },
            },
          },
        ],
      }));
    }

    const latestPerGroup = await this.prisma.client.module.groupBy({
      by: ['courseId'],
      _max: { createdAt: true },
    });

    where.OR = latestPerGroup.map((item) => ({
      courseId: item.courseId,
      createdAt: item._max.createdAt!,
    }));

    // Apply year/term filters if provided
    if (filters.enrollmentPeriodId) {
      where.courseOffering = {
        enrollmentPeriod: {
          id: filters.enrollmentPeriodId,
        },
      };
    }

    const [modules, meta] = await this.prisma.client.module
      .paginate({
        where,
        orderBy: {
          courseOffering: { enrollmentPeriod: { startDate: 'desc' } },
        },
        include: {
          course: true,
          courseOffering: {
            include: {
              courseSections: {
                include: {
                  mentor: true,
                },
              },
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    return { modules, meta };
  }

  /**
   * Updates the details of an existing module.
   *
   * @async
   * @param {string} id - The UUID of the module to update.
   * @param {UpdateModuleDto} updateModuleDto - Data Transfer object containing the updated module details.
   * @returns {Promise<UpdateModuleDto>} The updated module record.
   *
   * @throws {NotFoundException} - If no module is found with the given ID.
   */
  @Log({
    logArgsMessage: ({ id }) => `Updating module id ${id}`,
    logSuccessMessage: (result, { id }) =>
      `Updated module id ${id} ${result.title}`,
    logErrorMessage: (err, { id }) =>
      `Updating module id ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Module ${id} not found`),
  })
  async update(
    @LogParam('id') id: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<ModuleDto> {
    return await this.prisma.client.module.update({
      where: { id },
      data: { ...updateModuleDto },
    });
  }

  /**
   * Deletes a module from the database.
   *
   * - If `directDelete` is false (or omitted), the module is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the module is permanently deleted.
   *
   * @async
   * @param {string} id - The UUID of the module to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the module.
   * @returns {Promise<{message: string}>} - Deletion confirmation message.
   *
   * @throws {NotFoundException} If no module is found with the given id.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Deleting module ${id} hard delete=${directDelete ?? false}`,
    logSuccessMessage: (_, { id, directDelete }) =>
      `Deleted module ${id} hard delete=${directDelete ?? false}`,
    logErrorMessage: (err, { id }) =>
      `Deleting module ${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Module ${id} not found`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    const module = await this.prisma.client.module.findUniqueOrThrow({
      where: { id },
    });

    const now = new Date();

    if (!directDelete && !module.deletedAt) {
      await this.prisma.client.$transaction(async (tx) => {
        await tx.module.update({
          where: { id },
          data: {
            deletedAt: now,
          },
        });

        await tx.moduleSection.updateMany({
          where: {
            moduleId: id,
          },
          data: {
            deletedAt: now,
          },
        });

        await tx.moduleContent.updateMany({
          where: {
            moduleSection: {
              moduleId: id,
            },
          },
          data: {
            deletedAt: now,
          },
        });
      });

      return {
        message: `Module "${module.title}" and all its sections and contents were marked as deleted.`,
      };
    }

    await this.prisma.client.module.delete({ where: { id } });
    return {
      message: `Module "${module.title}" and all related sections and contents were permanently deleted.`,
    };
  }

  /**
   * Removes all modules in a given enrollment period.
   *
   *
   * @async
   * @param {string} enrollmentPeriodId - The UUID of the target enrollment period
   *                                      where modules should be deleted.
   * @throws {NotFoundException} If the enrollment period does not exist.
   */
  @Log({
    logArgsMessage: ({ enrollmentPeriodId }) =>
      `Deleting modules for enrollment period ${enrollmentPeriodId}`,
    logSuccessMessage: (_, { enrollmentPeriodId }) =>
      `Successfully deleted modules for enrollment period id ${enrollmentPeriodId}`,
    logErrorMessage: (err, { enrollmentPeriodId }) =>
      `Failed to delete modules for enrollment period ${enrollmentPeriodId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { enrollmentPeriodId }) =>
      new NotFoundException(
        `Enrollment period not found for id ${enrollmentPeriodId}`,
      ),
  })
  async removeModules(
    @LogParam('enrollmentPeriodId') enrollmentPeriodId: string,
  ): Promise<MessageDto> {
    await this.prisma.client.module.deleteMany({
      where: {
        courseOffering: {
          enrollmentPeriod: {
            id: enrollmentPeriodId,
          },
        },
      },
    });

    return new MessageDto('Modules successfully deleted');
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

    // Get todos (assignments with due dates)
    const whereCondition: Prisma.ModuleContentWhereInput = {
      moduleSection: {
        module: {
          courseOfferingId: { in: courseOfferingIds },
        },
      },
      studentProgress: {
        every: {
          studentId,
          status: { not: ProgressStatus.COMPLETED },
        },
      },
      OR: [
        {
          contentType: ContentType.ASSIGNMENT,
          assignment: {
            dueDate: { gte: new Date() },
          },
        },
        {
          contentType: ContentType.ASSIGNMENT,
          assignment: {
            dueDate: null,
          },
        },
      ],
      publishedAt: { lte: new Date() },
    };

    const [todos, meta] = await this.prisma.client.moduleContent
      .paginate({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          contentType: true,
          assignment: {
            select: {
              dueDate: true,
            },
          },
          moduleSection: {
            select: {
              module: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            assignment: {
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
      const title = todo?.title;
      const dueDate = todo?.assignment?.dueDate;

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
        moduleName: todo.moduleSection.module.title,
      };
    });

    return { todos: items, meta };
  }

  /**
   * Finds ModuleContent tree for a given Module.
   *
   * @param moduleId The ID of the Module.
   * @param role The role of the user.
   * @param userId The ID of the user. Used for students to filter by their progress.
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
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (message, { moduleId }) =>
      new NotFoundException(`Module ${moduleId} not found`),
  })
  async findModuleTree(
    @LogParam('moduleId') moduleId: string,
    @LogParam('role') role: Role,
    @LogParam('userId') userId?: string,
  ): Promise<ModuleTreeDto> {
    if (!isUUID(moduleId)) {
      throw new BadRequestException('Invalid module ID format');
    }

    // Define a single query to get the Module, ALL Sections, and ALL Contents
    const [module, flatSections, flatContents] =
      await this.prisma.client.$transaction([
        // 1. Fetch the Module
        this.prisma.client.module.findUniqueOrThrow({
          where: {
            id: moduleId,
            ...(role !== Role.admin && { publishedAt: { not: null } }),
            ...(role === Role.mentor && {
              courseOffering: {
                courseSections: {
                  some: {
                    mentor: {
                      id: userId,
                    },
                  },
                },
              },
            }),
            ...(role === Role.student && {
              courseOffering: {
                courseEnrollments: {
                  some: {
                    student: {
                      id: userId,
                    },
                  },
                },
              },
            }),
            deletedAt: null,
          },
          select: {
            id: true,
            courseId: true,
            title: true,
            ...(role === Role.admin && {
              publishedAt: true,
              unpublishedAt: true,
              createdAt: true,
              updatedAt: true,
            }),
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
          },
        }),

        // 2. Fetch ALL Sections for this Module (flat list)
        this.prisma.client.moduleSection.findMany({
          where: {
            moduleId: moduleId,
            ...(role !== Role.admin && { publishedAt: { not: null } }),
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            moduleId: true,
            parentSectionId: true,
            prerequisiteSectionId: true,
            title: true,
            order: true,
            ...(role === Role.admin && {
              publishedAt: true,
              unpublishedAt: true,
              createdAt: true,
              updatedAt: true,
            }),
          },
        }),

        // 3. Fetch ALL ModuleContents for this Module (flat list)
        this.prisma.client.moduleContent.findMany({
          where: {
            moduleSection: { moduleId: moduleId },
            ...(role !== Role.admin && { publishedAt: { not: null } }),
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            moduleSectionId: true,
            title: true,
            subtitle: true,
            order: true,
            contentType: true,
            assignment: true,
            ...(role === Role.admin && {
              publishedAt: true,
              unpublishedAt: true,
              createdAt: true,
              updatedAt: true,
            }),
            ...(role === Role.student && userId
              ? { studentProgress: { where: { studentId: userId } } }
              : { studentProgress: true }),
          },
        }),
      ]);

    const moduleContents = flatContents.map((item) => {
      return mapModuleContentToModuleTreeItem(item);
    });

    return {
      ...module,
      moduleSections: this.buildTree(flatSections, moduleContents),
    };
  }

  private buildTree(
    flatSections: ModuleTreeSectionDto[],
    flatContents: ModuleTreeContentItem[],
  ): ModuleTreeSectionDto[] {
    const sectionsMap = new Map();
    const rootSections: ModuleTreeSectionDto[] = [];

    // Map contents to sections
    const contentMap = flatContents.reduce((acc, content) => {
      (acc[content.moduleSectionId] = acc[content.moduleSectionId] || []).push(
        content,
      );
      return acc;
    }, {});

    // First pass: create a map of all sections and attach contents
    for (const section of flatSections) {
      section.subsections = []; // Initialize subsections' array
      section.moduleContents = contentMap[section.id] || []; // Attach contents
      sectionsMap.set(section.id, section);
    }

    // Second pass: build the hierarchy
    for (const section of flatSections) {
      if (section.parentSectionId) {
        const parent = sectionsMap.get(section.parentSectionId);
        if (parent) {
          parent.subsections.push(section);
        }
        // Handle "orphaned" sections if the parent is deleted/filtered out
      } else {
        rootSections.push(section); // Add top-level sections
      }
    }

    return rootSections;
  }
}
