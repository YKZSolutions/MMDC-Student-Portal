import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateDetailedGroupDto } from './dto/create-group.dto';
import { DetailedGroupDto } from './dto/detailed-group.dto';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Creates a new group in the database.
   *
   * @async
   * @param {string} moduleId - The UUID of the module to which the group belongs.
   * @param {CreateDetailedGroupDto} dto - Data Transfer Object containing the details of the group to create.
   * @returns {Promise<DetailedGroupDto>} - The created group record.
   * @throws {NotFoundException} - If the specified moduleId or studentId/s is not found.
   */
  @Log({
    logArgsMessage: ({ moduleId }) => `Creating group for module ${moduleId}`,
    logSuccessMessage: (_, { moduleId }) =>
      `Created group for module ${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Creating group for module ${moduleId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RelatedRecordNotFound]: (_, { moduleId }) =>
      new NotFoundException(`Module ${moduleId} not found`),
  })
  async create(
    @LogParam('moduleId') moduleId: string,
    dto: CreateDetailedGroupDto,
  ): Promise<DetailedGroupDto> {
    return await this.prisma.client.group.create({
      data: {
        moduleId,
        ...dto,
        members: {
          create: dto.members.map((studentId) => ({ studentId })),
        },
      },
      include: {
        members: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves all groups for a given module.
   *
   * @async
   * @param {string} moduleId - The UUID of the module
   * @returns {Promise<DetailedGroupDto[]>} - A list of groups.
   * @throws {NotFoundException} - If the specified module is not found.
   */
  @Log({
    logArgsMessage: ({ moduleId }) => `Fetching groups for module ${moduleId}`,
    logSuccessMessage: (_, { moduleId }) =>
      `Fetched groups for module ${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Fetching groups for module ${moduleId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { moduleId }) =>
      new NotFoundException(`Module ${moduleId} not found`),
  })
  async findAll(
    @LogParam('moduleId') moduleId: string,
  ): Promise<DetailedGroupDto[]> {
    return this.prisma.client.group.findMany({
      where: { moduleId },
      select: {
        id: true,
        groupNumber: true,
        groupName: true,
        members: {
          select: {
            studentId: true,
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Updates the details of an existing group.
   *
   * @async
   * @param {string} groupId - The UUID of the group to update.
   * @param {CreateDetailedGroupDto} dto - Data Transfer Object containing the group details.
   * @returns {Promise<DetailedGroupDto>} - The updated group.
   * @throws {NotFoundException} - If the specified groupId or studentId/s is not found.
   */
  @Log({
    logArgsMessage: ({ groupId }) => `Updating group ${groupId}`,
    logSuccessMessage: (_, { groupId }) => `Updated group ${groupId}`,
    logErrorMessage: (err, { groupId }) =>
      `Updating group ${groupId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { groupId }) =>
      new NotFoundException(`Group ${groupId} not found`),
  })
  async update(
    @LogParam('groupId') groupId: string,
    dto: UpdateGroupDto,
  ): Promise<DetailedGroupDto> {
    const { members, ...details } = dto;

    const data: Prisma.GroupUpdateInput = {
      ...details,
    };

    if (members?.length) {
      data.members = {
        set: [],
        create: members.map((studentId) => ({ studentId })),
      };
    }

    return this.prisma.client.group.update({
      where: { id: groupId },
      data,
      include: {
        members: {
          select: {
            studentId: true,
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Deletes a group from the database.
   *
   * @async
   * @param {string} groupId - The UUID of the group to delete.
   * @returns {Promise<{message: string}>} - Deletion confirmation message.
   * @throws {NotFoundException} - If no group is found with the given id.
   */
  @Log({
    logArgsMessage: ({ groupId }) => `Deleting group ${groupId}`,
    logSuccessMessage: (_, { groupId }) => `Deleted group ${groupId}`,
    logErrorMessage: (err, { groupId }) =>
      `Deleting group ${groupId} | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { groupId }) =>
      new NotFoundException(`Group ${groupId} not found`),
  })
  async remove(
    @LogParam('groupId') groupId: string,
  ): Promise<{ message: string }> {
    await this.prisma.client.group.delete({
      where: { id: groupId },
    });
    return {
      message: 'Group permanently deleted',
    };
  }
}
