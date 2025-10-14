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
import { UpdateAssignmentConfigDto } from '@/modules/lms/assignment/dto/update-assignment-item.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async submit(
    assignmentId: string,
    studentId: string,
    submitAssignmentDto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    return await this.prisma.client.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        state: submitAssignmentDto.state,
        content: submitAssignmentDto.content,
        submittedAt:
          submitAssignmentDto.state === 'SUBMITTED' ? new Date() : undefined,
      },
    });
  }

  async findAllForAdmin(
    moduleId: string,
    filters: BaseFilterDto,
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

      const { submissions, _count, ...assignment } = assignmentItem;

      return {
        ...assignment,
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

  async findAllForMentor(
    moduleId: string,
    mentorId: string,
    filters: BaseFilterDto,
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

  async findAllForStudent(
    moduleId: string,
    studentId: string,
    filters: BaseFilterDto,
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

  async findOne(id: string): Promise<AssignmentDto> {
    return await this.prisma.client.assignment.findFirstOrThrow({
      where: { id },
    });
  }

  async findOneForStudent(
    id: string,
    studentId: string,
  ): Promise<StudentAssignmentItemDto> {
    const assignment = await this.prisma.client.assignment.findFirstOrThrow({
      where: { id, submissions: { some: { studentId } } },
      include: {
        submissions: { include: { attachments: true } },
      },
    });

    return {
      ...assignment,
      submissions: assignment.submissions.map((submission) => ({
        ...submission,
        content: submission.content as Prisma.JsonValue[],
        groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
      })),
    };
  }

  async update(
    assignmentId: string,
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
      where: { id: assignmentId },
      data,
    });

    return { message: 'Assignment config updated successfully' };
  }

  async remove(
    directDelete: boolean,
    assignmentId?: string,
    moduleContentId?: string,
    tx?: PrismaTransaction,
  ): Promise<MessageDto> {
    const whereCondition: Prisma.AssignmentWhereUniqueInput | null =
      moduleContentId
        ? { moduleContentId }
        : assignmentId
          ? { id: assignmentId }
          : null;

    if (!whereCondition)
      throw new BadRequestException('Missing required id field');

    const client = tx ?? this.prisma.client;
    const assignment = await client.assignment.findUnique({
      where: whereCondition,
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
        where: {
          ...(assignmentId ? { id: assignmentId } : { moduleContentId }),
        },
      });
      return new MessageDto('Assignment permanently deleted');
    }
    await client.assignment.update({
      where: { id: assignmentId },
      data: { deletedAt: new Date() },
    });

    return new MessageDto('Assignment softly deleted');
  }
}
