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
import { StudentAssignmentsSubmissionsDto } from '@/generated/nestjs-dto/studentAssignmentsSubmissions.dto';

@Injectable()
export class LmsContentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Builds Prisma `include` object based on role and content type.
   */
  private buildIncludeForRoleAndType(
    role: Role,
    contentType: ContentType,
    userId?: string,
  ): Prisma.ModuleContentInclude {
    const contentHasProgress =
      contentType === ContentType.ASSIGNMENT ||
      contentType === ContentType.REFLECTION ||
      contentType === ContentType.DISCUSSION;

    if (role === Role.mentor || role === Role.admin) {
      return {
        assignment: contentType === ContentType.ASSIGNMENT,
        studentProgress:
          userId && contentHasProgress ? { where: { userId } } : undefined,
      };
    }

    if (role === Role.student) {
      return {
        assignment:
          contentType === ContentType.ASSIGNMENT
            ? { omit: omitAuditDates }
            : undefined,
        submissions:
          contentType === ContentType.ASSIGNMENT
            ? { where: { studentId: userId } }
            : undefined,
        studentProgress:
          userId && contentHasProgress ? { where: { userId } } : undefined,
      };
    }

    throw new Error('Invalid role or content type');
  }

  /**
   * Builds Prisma `omit` rules based on role.
   */
  private buildOmitForRole(role: Role): Prisma.ModuleContentOmit | undefined {
    if (role === Role.student) {
      return { ...omitAuditDates, ...omitPublishFields };
    }
    return undefined;
  }

  /**
   * Creates a new module content in the database.
   *
   * @async
   * @param {CreateModuleContentDto} createModuleContentDto - Data Transfer Object containing the module content details to create.
   * @param {string} moduleId - The UUID of the module to which the content belongs.
   * @returns {Promise<ModuleContent>} The created module content record
   *
   * @throws {ConflictException} - If the module content title already exists in the same section.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ content }: { content: CreateContentDto }) =>
      `Creating module content [${content.title}] in section ${content.sectionId}`,
    logSuccessMessage: (content) =>
      `Module content [${content.title}] successfully created.`,
    logErrorMessage: (
      err,
      {
        content,
      }: {
        content: CreateContentDto;
      },
    ) =>
      `An error has occurred while creating module content [${content.title}] | Error: ${err.message}`,
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
    const { sectionId, assignment, ...rest } = createModuleContentDto;

    const data: Prisma.ModuleContentCreateInput = {
      ...rest,
      module: { connect: { id: moduleId } },
      moduleSection: sectionId ? { connect: { id: sectionId } } : undefined,
      assignment: assignment ? { create: assignment } : undefined,
    };

    const content = await this.prisma.client.moduleContent.create({
      data,
      include: { assignment: true },
    });

    return {
      ...content,
      content: content.content as Prisma.JsonValue,
      assignment: content.assignment
        ? {
            ...content.assignment,
            rubric: content.assignment.rubric as Prisma.JsonValue,
          }
        : null,
    };
  }

  /**
   * Retrieves a single module content by its unique ID.
   *
   * @async
   * @param {string} id - The UUID of the module content.
   * @returns {Promise<ModuleContentDto>} The module content record.
   * @param {Role} role - The role of the user making the request.
   * @param {string} [userId] - The UUID of the user making the request.
   * @param {ContentType} contentType - The type of content to retrieve.
   *
   * @throws {BadRequestException} If the provided ID is not a valid UUID.
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
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

    const content = await this.prisma.client.moduleContent.findUniqueOrThrow({
      where: { id },
      include: this.buildIncludeForRoleAndType(
        role,
        'ASSIGNMENT', //TODO: change to contentType
        userId ?? undefined,
      ),
      omit: this.buildOmitForRole(role),
    });

    return {
      ...content,
      content: content.content as Prisma.JsonValue,
      assignment: content.assignment
        ? {
            ...content.assignment,
            rubric: content.assignment.rubric as Prisma.JsonValue,
          }
        : null,
    };
  }

  /**
   * Updates the details of an existing module content.
   *
   * @async
   * @param {string} id - The UUID of the module content to update
   * @param {UpdateContentDto} updateContentDto - Data Transfer Object containing updated module content details.
   * @param {string} publishedBy - The UUID of the user who published the content, if applicable.
   * @returns {Promise<ModuleContentDto>} The updated module content record.
   *
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {ConflictException} If the module content title already exists in the same section.
   * @throws {Error} Any other unexpected errors.
   */
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
    [PrismaErrorCode.UniqueConstraint]: (
      _,
      { content }: { content: UpdateContentDto },
    ) =>
      new ConflictException(
        `Module content title ${content?.title} already exists in this section`,
      ),
  })
  async update(
    @LogParam('id') id: string,
    @LogParam('content') updateContentDto: UpdateContentDto,
    @LogParam('publishedBy') publishedBy?: string | null,
  ): Promise<ModuleContent> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid module content ID format');
    }

    const { sectionId, assignment, ...contentData } = updateContentDto;

    const data: Prisma.ModuleContentUpdateInput = {
      ...contentData,
    };

    // Connect section if provided
    if (sectionId) {
      data.moduleSection = { connect: { id: sectionId } };
    }

    // Update assignment if provided
    if (assignment) {
      data.assignment = { update: assignment };
    }

    // Handle publishing
    if (contentData.publishedAt || contentData.toPublishAt) {
      if (publishedBy) {
        data.publishedByUser = { connect: { id: publishedBy } };
      }
    } else {
      // If neither publishedAt nor toPublishAt are set, disconnect
      data.publishedByUser = { disconnect: true };
    }

    const updatedContent = await this.prisma.client.moduleContent.update({
      where: { id },
      include: {
        assignment: true,
      },
      data,
    });

    return {
      ...updatedContent,
      content: updatedContent.content as Prisma.JsonValue,
      assignment: updatedContent.assignment
        ? {
            ...updatedContent.assignment,
            rubric: updatedContent.assignment.rubric as Prisma.JsonValue,
          }
        : null,
    };
  }

  /**
   * Deletes a module content from the database.
   *
   * - If `directDelete` is false (or omitted), the content is soft-deleted (sets `deletedAt`).
   * - If `directDelete` is true, the content is permanently deleted.
   *
   * @async
   * @param {string} id - The UUID of the module content to delete.
   * @param {boolean} [directDelete=false] - Whether to permanently delete the record.
   * @returns {Promise<{ message: string }>} Deletion confirmation message.
   *
   * @throws {NotFoundException} If no module content is found with the given ID.
   * @throws {Error} Any other unexpected errors.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Deleting module content with id=${id}, directDelete=${directDelete ?? false}`,
    logSuccessMessage: (_result, { id, directDelete }) =>
      `Successfully deleted module content with id=${id} (${directDelete ? 'permanent' : 'soft'})`,
    logErrorMessage: (err, { id }) =>
      `Failed to delete module content with id=${id} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_msg, { id }) =>
      new NotFoundException(`Module content with ID ${id} not found`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const content = await this.prisma.client.moduleContent.findUniqueOrThrow({
      where: { id },
    });

    if (!directDelete && !content.deletedAt) {
      await this.prisma.client.moduleContent.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Module content marked for deletion' };
    }

    await this.prisma.client.moduleContent.delete({ where: { id } });
    return { message: 'Module content permanently deleted' };
  }

  // @Log({
  //   logArgsMessage: ({ role, user_id, filters }) =>
  //     `Fetching assignments for user ${user_id} role=${role}, filters=${JSON.stringify(filters)}`,
  //   logSuccessMessage: ({ id }) =>
  //     `Successfully fetched module content for id ${id}`,
  //   logErrorMessage: (err, { id }) =>
  //     `An error has occurred while fetching module content for id ${id} | Error: ${err.message}`,
  // })
  // @PrismaError({
  //   [PrismaErrorCode.RecordNotFound]: () =>
  //     new NotFoundException('Module content not found'),
  // })
  // async findAllAssignments(
  //   @LogParam('id') id: string,
  //   @LogParam('role') role: Role,
  //   @LogParam('userId') userId: string,
  //   @LogParam('filters') filters: FilterAssignmentsDto,
  // ): Promise<StudentAssignmentsSubmissionsDto[]> {
  //   if (!isUUID(id)) {
  //     throw new BadRequestException('Invalid module content ID format');
  //   }
  //
  //   if (role === Role.admin) {
  //     return await this.prisma.client.studentAssignmentsSubmissions.findMany(
  //       {},
  //     );
  //   }
  //
  //   if (role === Role.student) {
  //     return await this.prisma.client.studentAssignmentsSubmissions.findMany({
  //       where: {
  //         user_id: userId,
  //         submission_id: null, // not submitted yet
  //         dueDate: { gte: new Date() }, // upcoming only
  //       },
  //       orderBy: { dueDate: 'asc' },
  //     });
  //   }
  // }

  @Log({
    logArgsMessage: ({ userId }) =>
      `Fetching todo assignments for user ${userId}`,
    logSuccessMessage: (assignments, { userId }) =>
      `Successfully fetched ${assignments.length} todo assignments for user ${userId}`,
    logErrorMessage: (err, { userId }) =>
      `An error has occurred while fetching todos for id ${userId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Assignment not found'),
  })
  async findAssignmentTodos(
    @LogParam('userId') userId: string,
  ): Promise<StudentAssignmentsSubmissionsDto[]> {
    return await this.prisma.client.studentAssignmentsSubmissions.findMany({
      where: {
        user_id: userId,
        submission_id: null, // not submitted yet
        dueDate: { gte: new Date() }, // upcoming only
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
