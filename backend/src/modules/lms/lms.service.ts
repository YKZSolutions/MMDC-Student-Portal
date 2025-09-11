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
    // Get enrollment period and course offerings
    const currentEnrollment =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id: enrollmentPeriodId },
        include: { courseOfferings: true },
      });

    // For each course offering in this period
    for (const courseOffering of currentEnrollment.courseOfferings) {
      const latestModule = await this.prisma.client.module.findFirstOrThrow({
        where: {
          courseId: courseOffering.courseId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          moduleSections: { include: { moduleContents: true } },
        },
      });

      if (!latestModule) continue;

      await this.prisma.client.$transaction(async (tx) => {
        // Create new module for this current offering
        const newModule = await tx.module.create({
          data: {
            title: latestModule.title,
            courseId: latestModule.courseId,
            courseOfferingId: courseOffering.id,
          },
        });

        // Copy module sections to new module
        for (const oldSection of latestModule.moduleSections) {
          const newSection = await tx.moduleSection.create({
            data: {
              moduleId: newModule.id,
              title: oldSection.title,
            },
          });

          // Copy module content to new module section
          for (const oldContent of oldSection.moduleContents) {
            await tx.moduleContent.create({
              data: {
                moduleId: newModule.id,
                order: oldContent.order,
                title: oldContent.title,
                subtitle: oldContent.subtitle,
                moduleSectionId: newSection.id,
                content: oldContent.content,
                contentType: oldContent.contentType,
              },
            });
          }
        }
      });
    }
  }
}
