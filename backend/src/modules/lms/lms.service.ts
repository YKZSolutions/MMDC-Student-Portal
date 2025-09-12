import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { ModuleDto } from '@/generated/nestjs-dto/module.dto';
import { UpdateModuleDto } from '@/generated/nestjs-dto/update-module.dto';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import { Prisma } from '@prisma/client';
import { PaginatedModulesDto } from './dto/paginated-module.dto';
import { FilterModulesDto } from './dto/filter-modules.dto';

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
   * Clones learning modules from the most recent past course offering into the given enrollment period.
   *
   * This includes:
   * - Modules
   * - Module sections
   * - Module contents
   *
   * The "previous course offering" is determined by finding the most
   * recently created course offering (`createdAt` descending) for the
   * same course, where its enrollment period started before the current
   * enrollment period. If found, the entire module structure
   * (module → sections → contents) is duplicated and linked to the
   * new course offering.
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
        moduleSections: { include: { moduleContents: true } },
      },
    });

    await this.prisma.client.$transaction(async (tx) => {
      for (const courseOffering of currentEnrollment.courseOfferings) {
        const latestModule = latestModules.find(
          (m) => m.courseId === courseOffering.courseId,
        );
        if (!latestModule) continue;

        // Create the new module
        const newModule = await tx.module.create({
          data: {
            title: latestModule.title,
            courseId: latestModule.courseId,
            courseOfferingId: courseOffering.id,
          },
        });

        // Batch create sections and return the created sections
        const newSections = await tx.moduleSection.createManyAndReturn({
          data: latestModule.moduleSections.map((s) => ({
            moduleId: newModule.id,
            title: s.title,
          })),
        });

        // Flatten contents for batch creation
        const allContents = latestModule.moduleSections.flatMap(
          (oldSection, index) =>
            oldSection.moduleContents.map((c) => ({
              moduleId: newModule.id,
              moduleSectionId: newSections[index].id,
              order: c.order,
              title: c.title,
              subtitle: c.subtitle,
              content: c.content,
              contentType: c.contentType,
              isActive: true,
            })),
        );

        if (allContents.length > 0) {
          await tx.moduleContent.createMany({ data: allContents });
        }
      }
    });
  }

  /**
   * Retrieves a paginated list of modules available to the user, filtered by search criteria and role.
   *
   * - All users can filter modules by course name or course code.
   * - Students see only modules from courses they are enrolled in.
   * - Mentors see only modules from courses they are assigned to.
   * - Admins see all modules across courses.
   *
   * Results are sorted by the most recent enrollment period (`startDate` descending).
   *
   * @async
   * @param {AuthUser} user - The authenticated user making the request.
   * @param {BaseFilterDto} filters - Filters for search, pagination, and other options.
   *
   * @returns {Promise<PaginatedModulesDto>} A list of matching modules and pagination metadata.
   *
   * @throws {NotFoundException} If no modules are found (Prisma `RecordNotFound`).
   */
  @Log({
    logArgsMessage: ({ user, filters }) =>
      `Fetching modules for user ${user.user_metadata.user_id} role=${user.user_metadata.role}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { user }) =>
      `Fetched ${result.modules.length} modules for user ${user.user_metadata.user_id}`,
    logErrorMessage: (err, { user }) =>
      `Fetching modules for user ${user.user_metadata.user_id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { user }) =>
      new NotFoundException(`No modules found for user ${user.id}`),
  })
  async findAll(
    @LogParam('user') user: AuthUser,
    @LogParam('filters') filters: FilterModulesDto,
  ): Promise<PaginatedModulesDto> {
    const where: Prisma.ModuleWhereInput = {};
    const page = filters.page || 1;

    // All users can filter by course name or course code
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

    // If student retrieve all modules based on course enrollment and course section
    if (user.user_metadata.role === 'student') {
      where.courseOffering = {
        is: {
          courseEnrollments: {
            some: {
              studentId: user.user_metadata.user_id,
            },
          },
        },
      };
    }

    // If mentor retrieve all modules based on assigned course section
    if (user.user_metadata.role === 'mentor') {
      where.courseOffering = {
        is: {
          courseSections: { some: { mentorId: user.user_metadata.user_id } },
        },
      };
    }

    // All users can filter by academic year and term
    if (filters.startYear || filters.endYear || filters.term) {
      where.courseOffering = {
        enrollmentPeriod: {
          startYear: filters.startYear,
          endYear: filters.endYear,
          term: filters.term,
        },
      };
    }

    const [modules, meta] = await this.prisma.client.module
      .paginate({
        where,
        orderBy: {
          courseOffering: {
            enrollmentPeriod: {
              startDate: 'desc',
            },
          },
        },
      })
      .withPages({ limit: 10, page, includePageCount: true });

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
   * @param {boolean} [directDelete=false] - Whether to premamnently delete the module.
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
          where: { moduleId: id },
          data: {
            deletedAt: now,
          },
        });

        await tx.moduleContent.updateMany({
          where: { moduleId: id },
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
}
