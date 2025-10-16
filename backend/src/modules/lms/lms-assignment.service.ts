import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import {
  AssignmentItemDto,
  PaginatedAssignmentDto,
  PaginatedMentorAssignmentDto,
  PaginatedStudentAssignmentDto,
  StudentAssignmentItemDto,
} from './dto/paginated-assignment.dto';
import { AssignmentSubmission, Prisma } from '@prisma/client';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { UpdateAssignmentConfigDto } from './dto/update-assignment-config.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Injectable()
export class LmsAssignmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async submit(
    assignmentId: string,
    studentId: string,
    submitAssignmentDto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    const submission = await this.prisma.client.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        state: submitAssignmentDto.state,
        content: submitAssignmentDto.content,
        submittedAt:
          submitAssignmentDto.state === 'SUBMITTED' ? new Date() : undefined,
      },
    });

    return submission;
  }

  async findAllForAdmin(
    moduleId: string,
    filters: BaseFilterDto,
  ): Promise<PaginatedAssignmentDto> {
    const where: Prisma.AssignmentWhereInput = {};
    const page = filters.page || 1;

    where.moduleContent = {
      moduleId,
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
          grading: true,
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
        content: assignment.content as Prisma.JsonValue[],
        grading: assignment.grading
          ? {
              ...assignment.grading,
              rubricSchema: assignment.grading
                .rubricSchema as Prisma.JsonValue[],
              questionRules: assignment.grading
                .questionRules as Prisma.JsonValue[],
              curveSettings: assignment.grading
                .curveSettings as Prisma.JsonValue,
            }
          : undefined,
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
      moduleId,
      module: {
        courseOffering: {
          courseSections: {
            every: { mentorId },
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
          grading: true,
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
        content: assignment.content as Prisma.JsonValue[],
        submissions: assignment.submissions.map((submissionItem) => {
          const { gradeRecord, ...submission } = submissionItem;
          return {
            ...submission,
            grade: gradeRecord
              ? {
                  ...gradeRecord,
                }
              : undefined,
          };
        }),
        grading: assignment.grading
          ? {
              ...assignment.grading,
              rubricSchema: assignment.grading
                .rubricSchema as Prisma.JsonValue[],
              questionRules: assignment.grading
                .questionRules as Prisma.JsonValue[],
              curveSettings: assignment.grading
                .curveSettings as Prisma.JsonValue,
            }
          : undefined,

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
      moduleId,
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
          grading: true,
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
      content: assignment.content as Prisma.JsonValue[],
      submissions: assignment.submissions.map((submissionItem) => {
        const { gradeRecord, ...submission } = submissionItem;
        return {
          ...submission,
          content: submission.content as Prisma.JsonValue[],
          groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
          grade: gradeRecord
            ? {
                ...gradeRecord,
                rubricScores: gradeRecord.rubricScores as Prisma.JsonValue[],
                questionScores:
                  gradeRecord.questionScores as Prisma.JsonValue[],
              }
            : undefined,
        };
      }),
      grading: assignment.grading
        ? {
            ...assignment.grading,
            rubricSchema: assignment.grading.rubricSchema as Prisma.JsonValue[],
            questionRules: assignment.grading
              .questionRules as Prisma.JsonValue[],
            curveSettings: assignment.grading.curveSettings as Prisma.JsonValue,
          }
        : undefined,
    }));

    return {
      assignments,
      meta,
    };
  }

  async findOne(id: string): Promise<AssignmentItemDto> {
    const assignment = await this.prisma.client.assignment.findFirstOrThrow({
      where: { moduleContent: { id } },
      include: { grading: true },
    });

    return {
      ...assignment,
      content: assignment.content as Prisma.JsonValue[],
      grading: assignment.grading
        ? {
            ...assignment.grading,
            rubricSchema: assignment.grading.rubricSchema as Prisma.JsonValue[],
            questionRules: assignment.grading
              .questionRules as Prisma.JsonValue[],
            curveSettings: assignment.grading.curveSettings as Prisma.JsonValue,
          }
        : undefined,
    };
  }

  async findOneForStudent(
    id: string,
    studentId: string,
  ): Promise<StudentAssignmentItemDto> {
    const assignment = await this.prisma.client.assignment.findFirstOrThrow({
      where: { moduleContent: { id } },
      include: { grading: true },
    });

    const submissions = await this.prisma.client.assignmentSubmission.findMany({
      where: { assignmentId: assignment.id, studentId },
      include: { attachments: true },
    });

    return {
      ...assignment,
      content: assignment.content as Prisma.JsonValue[],
      grading: assignment.grading
        ? {
            ...assignment.grading,
            rubricSchema: assignment.grading.rubricSchema as Prisma.JsonValue[],
            questionRules: assignment.grading
              .questionRules as Prisma.JsonValue[],
            curveSettings: assignment.grading.curveSettings as Prisma.JsonValue,
          }
        : undefined,
      submissions: submissions.map((submission) => ({
        ...submission,
        content: submission.content as Prisma.JsonValue[],
        groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
      })),
    };
  }

  async update(
    assignmentId: string,
    updateAssignmentDto: UpdateAssignmentConfigDto,
  ): Promise<{ message: string }> {
    const assignment = await this.prisma.client.assignment.update({
      where: { id: assignmentId },
      data: {
        maxAttempts: updateAssignmentDto.maxAttempt,
        dueDate: updateAssignmentDto.dueAt,
      },
      include: { grading: true },
    });

    if (updateAssignmentDto.maxScore) {
      if (assignment.grading) {
        // already has a grading config → update
        await this.prisma.client.gradingConfig.update({
          where: { id: assignment.grading.id },
          data: { weight: updateAssignmentDto.maxScore },
        });
      } else {
        const grading = await this.prisma.client.gradingConfig.create({
          data: {
            isCurved: false,
            weight: updateAssignmentDto.maxScore,
            assignments: { connect: { id: assignment.id } },
          },
        });

        await this.prisma.client.assignment.update({
          where: { id: assignment.id },
          data: { grading: { connect: { id: grading.id } } },
        });
      }
    }

    return { message: 'Assignment config updated successfully' };
  }
}
