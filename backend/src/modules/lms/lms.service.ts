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
   * Clones learning modules from the previous enrollment period into the given enrollment period.
   *
   * This includes:
   * - Modules
   * - Module sections
   * - Module contents
   *
   * The "previous enrollment period" is determined by finding the most recent period
   * with the same `term` and an `endYear` exactly one year before the current period.
   * Each course offering in the current period is matched with its corresponding
   * course offering from the previous period. If found, the entire module structure
   * (module → sections → contents) is duplicated and linked to the new course offering.
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
  async copyModulesFromPreviousTerm(enrollmentPeriodId: string) {
    // Get enrollment period and course offerings
    const currentEnrollment =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id: enrollmentPeriodId },
        include: { courseOfferings: true },
      });

    // For each course offering in this period
    for (const courseOffering of currentEnrollment.courseOfferings) {
      // Look for the latest previous period in which the term is the same
      const previousOffering =
        await this.prisma.client.courseOffering.findFirst({
          where: {
            courseId: courseOffering.courseId,
            enrollmentPeriod: {
              endYear: currentEnrollment.startYear - 1,
              term: currentEnrollment.term,
            },
          },
          include: {
            modules: {
              include: {
                moduleSections: { include: { moduleContents: true } },
              },
            },
          },
        });

      if (!previousOffering) continue;
      await this.prisma.client.$transaction(async (tx) => {
        // For each previous course offerings
        for (const oldModule of previousOffering.modules) {
          const newModule = await this.prisma.client.module.create({
            data: {
              title: oldModule.title,
              courseId: oldModule.courseId,
              courseOfferingId: courseOffering.id,
            },
          });

          // Copy module sections to current module
          for (const oldSection of oldModule.moduleSections) {
            const newSection = await this.prisma.client.moduleSection.create({
              data: {
                moduleId: newModule.id,
              },
            });

            // Copy module content to current module section
            for (const oldContent of oldSection.moduleContents) {
              await this.prisma.client.moduleContent.create({
                data: {
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
        }
      });
    }
  }
}
