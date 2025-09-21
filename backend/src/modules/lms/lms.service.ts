import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { ModuleDto } from '@/generated/nestjs-dto/module.dto';
import { UpdateModuleDto } from '@/generated/nestjs-dto/update-module.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { FilterModulesDto } from './dto/filter-modules.dto';
import { PaginatedModulesDto } from './dto/paginated-module.dto';

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
        moduleSections: {
          include: {
            moduleContents: {
              include: {
                lesson: true,
                assignment: {
                  include: {
                    grading: true,
                    submissions: false,
                  },
                },
                quiz: {
                  include: {
                    submissions: false,
                  },
                },
                discussion: {
                  include: {
                    posts: false,
                  },
                },
                video: true,
                externalUrl: true,
                fileResource: true,
              },
            },
          },
        },
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
            publishedAt: null,
            toPublishAt: null,
            unpublishedAt: null,
          },
        });

        for (const oldSection of latestModule.moduleSections) {
          const newSection = await tx.moduleSection.create({
            data: {
              moduleId: newModule.id,
              title: oldSection.title,
              order: oldSection.order,
              publishedAt: null, // Reset publication status
              toPublishAt: null,
              unpublishedAt: null,
            },
          });

          for (const oldContent of oldSection.moduleContents) {
            // Create the base module content
            const newContent = await tx.moduleContent.create({
              data: {
                moduleId: newModule.id,
                moduleSectionId: newSection.id,
                order: oldContent.order,
                contentType: oldContent.contentType,
                publishedAt: null, // Reset publication status
                toPublishAt: null,
                unpublishedAt: null,
              },
            });

            // Clone content-specific data based on type
            switch (oldContent.contentType) {
              case 'LESSON':
                if (oldContent.lesson) {
                  await tx.lesson.create({
                    data: {
                      moduleContentId: newContent.id,
                      title: oldContent.lesson.title,
                      subtitle: oldContent.lesson.subtitle,
                      content: oldContent.lesson.content,
                    },
                  });
                }
                break;

              case 'ASSIGNMENT':
                if (oldContent.assignment) {
                  // Clone grading if it exists
                  let gradingId: string | null = null;
                  if (oldContent.assignment.grading) {
                    const gradingSchema = oldContent.assignment.grading
                      .gradingSchema as Prisma.JsonValue;
                    const curveSettings = oldContent.assignment.grading
                      .curveSettings as Prisma.JsonValue;
                    const newGrading = await tx.assignmentGrading.create({
                      data: {
                        gradingSchema: gradingSchema ?? {},
                        weight: oldContent.assignment.grading.weight,
                        isCurved: oldContent.assignment.grading.isCurved,
                        curveSettings: curveSettings ?? {},
                      },
                    });
                    gradingId = newGrading.id;
                  }

                  await tx.assignment.create({
                    data: {
                      moduleContentId: newContent.id,
                      title: oldContent.assignment.title,
                      subtitle: oldContent.assignment.subtitle,
                      content: oldContent.assignment.content,
                      mode: oldContent.assignment.mode,
                      dueDate: oldContent.assignment.dueDate,
                      maxAttempts: oldContent.assignment.maxAttempts,
                      allowLateSubmission:
                        oldContent.assignment.allowLateSubmission,
                      latePenalty: oldContent.assignment.latePenalty,
                      gradingId,
                    },
                  });
                }
                break;

              case 'QUIZ':
                if (oldContent.quiz) {
                  await tx.quiz.create({
                    data: {
                      moduleContentId: newContent.id,
                      title: oldContent.quiz.title,
                      subtitle: oldContent.quiz.subtitle,
                      content: oldContent.quiz.content,
                      timeLimit: oldContent.quiz.timeLimit,
                      maxAttempts: oldContent.quiz.maxAttempts,
                      questions: oldContent.quiz.questions,
                    },
                  });
                }
                break;

              case 'DISCUSSION':
                if (oldContent.discussion) {
                  await tx.discussion.create({
                    data: {
                      moduleContentId: newContent.id,
                      title: oldContent.discussion.title,
                      subtitle: oldContent.discussion.subtitle,
                      content: oldContent.discussion.content,
                      isThreaded: oldContent.discussion.isThreaded,
                      requirePost: oldContent.discussion.requirePost,
                    },
                  });
                }
                break;

              case 'VIDEO':
                if (oldContent.video) {
                  await tx.video.create({
                    data: {
                      moduleContentId: newContent.id,
                      title: oldContent.video.title,
                      subtitle: oldContent.video.subtitle,
                      content: oldContent.video.content,
                      url: oldContent.video.url,
                      duration: oldContent.video.duration,
                      transcript: oldContent.video.transcript,
                    },
                  });
                }
                break;

              case 'URL':
                if (oldContent.externalUrl) {
                  await tx.externalUrl.create({
                    data: {
                      moduleContentId: newContent.id,
                      title: oldContent.externalUrl.title,
                      subtitle: oldContent.externalUrl.subtitle,
                      content: oldContent.externalUrl.content,
                      url: oldContent.externalUrl.url,
                    },
                  });
                }
                break;

              case 'FILE':
                if (oldContent.fileResource) {
                  await tx.fileResource.create({
                    data: {
                      moduleContentId: newContent.id,
                      title: oldContent.fileResource.title,
                      subtitle: oldContent.fileResource.subtitle,
                      content: oldContent.fileResource.content,
                      name: oldContent.fileResource.name,
                      path: oldContent.fileResource.path,
                      size: oldContent.fileResource.size,
                      mimeType: oldContent.fileResource.mimeType,
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
    where.courseOffering = {
      is: {
        courseEnrollments: { some: { studentId: userId } },
      },
    };
    if (filters.startYear || filters.endYear || filters.term) {
      if (
        where.courseOffering &&
        'is' in where.courseOffering &&
        where.courseOffering.is
      ) {
        where.courseOffering.is = {
          ...where.courseOffering.is,
          enrollmentPeriod: {
            startYear: filters.startYear,
            endYear: filters.endYear,
            term: filters.term,
          },
        };
      } else {
        where.courseOffering = {
          enrollmentPeriod: {
            startYear: filters.startYear,
            endYear: filters.endYear,
            term: filters.term,
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
          courseOffering: {
            include: {
              course: true,
              courseSections: {
                include: {
                  user: true,
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
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { userId }) =>
      new NotFoundException(`No modules found for mentor ${userId}`),
  })
  async findAllForMentor(
    userId: string,
    filters: FilterModulesDto,
  ): Promise<PaginatedModulesDto> {
    const where: Prisma.ModuleWhereInput = {};
    const page = filters.page || 1;
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
    where.courseOffering = {
      is: {
        courseSections: { some: { mentorId: userId } },
      },
    };
    if (filters.startYear || filters.endYear || filters.term) {
      if (
        where.courseOffering &&
        'is' in where.courseOffering &&
        where.courseOffering.is
      ) {
        where.courseOffering.is = {
          ...where.courseOffering.is,
          enrollmentPeriod: {
            startYear: filters.startYear,
            endYear: filters.endYear,
            term: filters.term,
          },
        };
      } else {
        where.courseOffering = {
          enrollmentPeriod: {
            startYear: filters.startYear,
            endYear: filters.endYear,
            term: filters.term,
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
          courseOffering: {
            include: {
              course: true,
              courseSections: {
                include: {
                  user: true,
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
   * @param {string} userId - The admin user ID making the request (not used for filtering).
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
    userId: string,
    filters: FilterModulesDto,
  ): Promise<PaginatedModulesDto> {
    const where: Prisma.ModuleWhereInput = {};
    const page = filters.page || 1;
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
          courseOffering: { enrollmentPeriod: { startDate: 'desc' } },
        },
        include: {
          courseOffering: {
            include: {
              course: true,
              courseSections: {
                include: {
                  user: true,
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
