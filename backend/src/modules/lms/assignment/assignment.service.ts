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
import { UpdateAssignmentConfigDto } from '@/modules/lms/lms-content/dto/update-full-module-content.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async submit(
    moduleContentId: string,
    studentId: string,
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

  async findOne(moduleContentId: string): Promise<AssignmentDto> {
    return await this.prisma.client.assignment.findFirstOrThrow({
      where: { moduleContentId },
    });
  }

  async findOneForStudent(
    moduleContentId: string,
    studentId: string,
  ): Promise<StudentAssignmentItemDto> {
    const assignment = await this.prisma.client.assignment.findFirstOrThrow({
      where: { moduleContentId, submissions: { some: { studentId } } },
      include: {
        moduleContent: true,
        submissions: { include: { attachments: true } },
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

  async update(
    moduleContentId: string,
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

  async remove(
    directDelete: boolean,
    moduleContentId: string,
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
