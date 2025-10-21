import {
  ExtendedPrismaClient,
  PrismaTransaction,
} from '@/lib/prisma/prisma.extension';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import {
  PaginatedAssignmentDto,
  PaginatedMentorAssignmentDto,
  PaginatedStudentAssignmentDto,
  StudentAssignmentItemDto,
} from './dto/paginated-assignment.dto';
import { AssignmentSubmission, Prisma } from '@prisma/client';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { SubmitAssignmentDto } from '../submission/dto/submit-assignment.dto';
import { MessageDto } from '@/common/dto/message.dto';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { UpdateAssignmentConfigDto } from '@/modules/lms/assignment/dto/update-assignment-config.dto';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Log({
    logArgsMessage: ({ moduleContentId, studentId }) =>
      `Submitting assignment for moduleContentId ${moduleContentId} by student ${studentId}`,
    logSuccessMessage: (_, { moduleContentId, studentId }) =>
      `Successfully submitted assignment for moduleContentId ${moduleContentId} by student ${studentId}`,
    logErrorMessage: (err, { moduleContentId, studentId }) =>
      `Error submitting assignment for moduleContentId ${moduleContentId} by student ${studentId}: ${err.message}`,
  })
  async submit(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('studentId') studentId: string,
    submitAssignmentDto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    return await this.prisma.client.assignmentSubmission.create({
      data: {
        assignment: { connect: { moduleContentId } },
        student: { connect: { id: studentId } },
        state: submitAssignmentDto.state,
        content: submitAssignmentDto.content,
        submittedAt:
          submitAssignmentDto.state === 'SUBMITTED' ? new Date() : undefined,
      },
    });
  }

  @Log({
    logArgsMessage: ({ moduleId, filters }) =>
      `Fetching all assignments for admin in module ${moduleId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { moduleId }) =>
      `Successfully fetched ${result.assignments.length} assignments for admin in module ${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Error fetching assignments for admin in module ${moduleId}: ${err.message}`,
  })
  async findAllForAdmin(
    @LogParam('moduleId') moduleId: string,
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedAssignmentDto> {
    const where: Prisma.AssignmentWhereInput = {};
    const page = filters.page || 1;

    where.moduleContent = {
      moduleSection: {
        moduleId,
      },
    };

    const studentCount = await this.prisma.client.courseEnrollment.count({
      where: {
        courseOffering: {
          modules: { every: { id: moduleId } },
        },
      },
    });

    const [data, meta] = await this.prisma.client.assignment
      .paginate({
        where,
        include: {
          _count: {
            select: { submissions: true },
          },
          moduleContent: {
            select: {
              title: true,
              subtitle: true,
              content: true,
            },
          },
          submissions: {
            select: {
              id: true,
              gradeRecord: {
                select: {
                  id: true,
                  grade: true,
                },
              },
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    const assignments = data.map((assignmentItem) => {
      const submitted = assignmentItem._count.submissions;
      const graded = assignmentItem.submissions.filter(
        (item) => item.gradeRecord !== null,
      ).length;

      return {
        ...assignmentItem,
        title: assignmentItem.moduleContent.title,
        subtitle: assignmentItem.moduleContent.subtitle,
        content: assignmentItem.moduleContent.content as Prisma.JsonValue[],
        stats: {
          submitted: submitted,
          graded: graded,
          total: studentCount,
        },
      };
    });

    return {
      assignments,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ moduleId, mentorId, filters }) =>
      `Fetching assignments for mentor ${mentorId} in module ${moduleId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { moduleId, mentorId }) =>
      `Successfully fetched ${result.assignments.length} assignments for mentor ${mentorId} in module ${moduleId}`,
    logErrorMessage: (err, { moduleId, mentorId }) =>
      `Error fetching assignments for mentor ${mentorId} in module ${moduleId}: ${err.message}`,
  })
  async findAllForMentor(
    @LogParam('moduleId') moduleId: string,
    @LogParam('mentorId') mentorId: string,
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedMentorAssignmentDto> {
    const where: Prisma.AssignmentWhereInput = {};
    const page = filters.page || 1;

    where.moduleContent = {
      moduleSection: {
        moduleId,
        module: {
          courseOffering: {
            courseSections: {
              every: { mentorId },
            },
          },
        },
      },
    };

    const studentCount = await this.prisma.client.courseEnrollment.count({
      where: {
        courseOffering: {
          modules: { every: { id: moduleId } },
          courseSections: {
            every: { mentorId },
          },
        },
      },
    });

    const [data, meta] = await this.prisma.client.assignment
      .paginate({
        where,
        include: {
          _count: {
            select: { submissions: true },
          },
          moduleContent: {
            select: {
              title: true,
              subtitle: true,
              content: true,
            },
          },
          submissions: {
            select: {
              id: true,
              student: true,
              submittedAt: true,
              gradeRecord: {
                select: {
                  id: true,
                  grade: true,
                  rawScore: true,
                  finalScore: true,
                  gradedAt: true,
                },
              },
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    const assignments = data.map((assignment) => {
      const submitted = assignment._count.submissions;
      const graded = assignment.submissions.filter(
        (item) => item.gradeRecord !== null,
      ).length;

      return {
        ...assignment,
        title: assignment.moduleContent.title,
        subtitle: assignment.moduleContent.subtitle,
        content: assignment.moduleContent.content as Prisma.JsonValue[],
        submissions: assignment.submissions.map((submissionItem) => {
          const { gradeRecord, ...submission } = submissionItem;
          return {
            ...submission,
            grade: gradeRecord,
          };
        }),

        stats: {
          submitted: submitted,
          graded: graded,
          total: studentCount,
        },
      };
    });

    return {
      assignments,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ moduleId, studentId, filters }) =>
      `Fetching assignments for student ${studentId} in module ${moduleId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { moduleId, studentId }) =>
      `Successfully fetched ${result.assignments.length} assignments for student ${studentId} in module ${moduleId}`,
    logErrorMessage: (err, { moduleId, studentId }) =>
      `Error fetching assignments for student ${studentId} in module ${moduleId}: ${err.message}`,
  })
  async findAllForStudent(
    @LogParam('moduleId') moduleId: string,
    @LogParam('studentId') studentId: string,
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedStudentAssignmentDto> {
    const where: Prisma.AssignmentWhereInput = {};
    const page = filters.page || 1;

    where.moduleContent = {
      moduleSection: {
        moduleId,
      },
    };

    where.submissions = {
      some: {
        studentId,
      },
    };

    const [data, meta] = await this.prisma.client.assignment
      .paginate({
        where,
        include: {
          moduleContent: true,
          submissions: {
            include: {
              gradeRecord: true,
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    const assignments = data.map((assignment) => ({
      ...assignment,
      title: assignment.moduleContent.title,
      subtitle: assignment.moduleContent.subtitle,
      content: assignment.moduleContent.content as Prisma.JsonValue[],
      submissions: assignment.submissions.map((submissionItem) => {
        const { gradeRecord, ...submission } = submissionItem;
        return {
          ...submission,
          content: submission.content as Prisma.JsonValue[],
          groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
          grade: gradeRecord,
        };
      }),
    }));

    return {
      assignments,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Fetching assignment for moduleContentId ${moduleContentId}`,
    logSuccessMessage: (_, { moduleContentId }) =>
      `Successfully fetched assignment for moduleContentId ${moduleContentId}`,
    logErrorMessage: (err, { moduleContentId }) =>
      `Error fetching assignment for moduleContentId ${moduleContentId}: ${err.message}`,
  })
  async findOne(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<AssignmentDto> {
    return await this.prisma.client.assignment.findFirstOrThrow({
      where: { moduleContentId },
    });
  }

  /**
   * Find an assignment for a specific student, including their submissions if any exist
   * @param moduleContentId - The assignment's module content ID
   * @param studentId - The student's ID
   * @returns Assignment data with student submissions (empty array if none)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, studentId }) =>
      `Fetching assignment for student ${studentId} with moduleContentId ${moduleContentId}`,
    logSuccessMessage: (_, { moduleContentId, studentId }) =>
      `Successfully fetched assignment for student ${studentId} with moduleContentId ${moduleContentId}`,
    logErrorMessage: (err, { moduleContentId, studentId }) =>
      `Error fetching assignment for student ${studentId} with moduleContentId ${moduleContentId}: ${err.message}`,
  })
  async findOneForStudent(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('studentId') studentId: string,
  ): Promise<StudentAssignmentItemDto> {
    // Find assignment for student - submissions included if they exist
    const assignment = await this.prisma.client.assignment.findFirstOrThrow({
      where: { moduleContentId },
      include: {
        moduleContent: true,
        submissions: {
          where: { studentId },
          include: { attachments: true },
        },
      },
    });

    return {
      ...assignment,
      title: assignment.moduleContent.title,
      subtitle: assignment.moduleContent.subtitle,
      content: assignment.moduleContent.content as Prisma.JsonValue[],
      submissions: assignment.submissions.map((submission) => ({
        ...submission,
        content: submission.content as Prisma.JsonValue[],
        groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
      })),
    };
  }

  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Updating assignment configuration for moduleContentId ${moduleContentId}`,
    logSuccessMessage: (result, { moduleContentId }) =>
      `Successfully updated assignment configuration for moduleContentId ${moduleContentId}: ${result.message}`,
    logErrorMessage: (err, { moduleContentId }) =>
      `Error updating assignment configuration for moduleContentId ${moduleContentId}: ${err.message}`,
  })
  async update(
    @LogParam('moduleContentId') moduleContentId: string,
    updateAssignmentDto: UpdateAssignmentConfigDto,
    tx?: PrismaTransaction,
  ): Promise<MessageDto> {
    const client = tx ?? this.prisma.client;
    const rubricId: string | null | undefined =
      updateAssignmentDto?.rubricTemplateId;

    const data: Prisma.AssignmentUpdateInput = {
      ...updateAssignmentDto,
    };

    if (rubricId !== undefined) {
      data.rubricTemplate =
        rubricId === null
          ? { disconnect: true }
          : { connect: { id: rubricId } };
    }

    await client.assignment.update({
      where: { moduleContentId },
      data,
    });

    return { message: 'Assignment config updated successfully' };
  }

  @Log({
    logArgsMessage: ({ directDelete, moduleContentId }) =>
      `Removing assignment for moduleContentId ${moduleContentId}, directDelete=${directDelete}`,
    logSuccessMessage: (result, { directDelete, moduleContentId }) =>
      `Successfully removed assignment for moduleContentId ${moduleContentId}, directDelete=${directDelete}: ${result.message}`,
    logErrorMessage: (err, { directDelete, moduleContentId }) =>
      `Error removing assignment for moduleContentId ${moduleContentId}, directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('directDelete') directDelete: boolean,
    @LogParam('moduleContentId') moduleContentId: string,
    tx?: PrismaTransaction,
  ): Promise<MessageDto> {
    const client = tx ?? this.prisma.client;
    const assignment = await client.assignment.findUnique({
      where: { moduleContentId },
      include: { submissions: true },
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.submissions.length > 0) {
      throw new BadRequestException(
        'Cannot delete assignments with submissions',
      );
    }

    if (directDelete) {
      await client.assignment.delete({
        where: { moduleContentId },
      });
      return new MessageDto('Assignment permanently deleted');
    }
    await client.assignment.update({
      where: { moduleContentId },
      data: { deletedAt: new Date() },
    });

    return new MessageDto('Assignment softly deleted');
  }
}
