import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import { DetailedContentProgressDto } from './dto/detailed-content-progress.dto';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class LmsContentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

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
    logSuccessMessage: (result, _) =>
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
            title: true,
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
    logSuccessMessage: (result, _) =>
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
      user.user_metadata.role === 'mentor'
        ? studentId
        : user.user_metadata.user_id;

    if (!userId) {
      throw new BadRequestException('Invalid userId');
    }

    return await this.prisma.client.contentProgress.findMany({
      where: { moduleId, userId },
      include: {
        moduleContent: {
          select: {
            id: true,
            title: true,
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
