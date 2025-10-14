import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { SubmissionDetailsDto } from './dto/paginated-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LmsSubmissionService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly notificationService: NotificationsService,
  ) {}

  async grade(
    id: string,
    gradeDto: GradeSubmissionDto,
  ): Promise<GradeRecordDto> {
    const grade = await this.prisma.client.gradeRecord.upsert({
      where: { studentId: gradeDto.studentId, assignmentSubmissionId: id },
      create: {
        studentId: gradeDto.studentId,
        assignmentSubmissionId: id,
        rawScore: gradeDto.grade,
        finalScore: gradeDto.grade,
        grade: 'Pass',
      },
      update: {
        rawScore: gradeDto.grade,
        finalScore: gradeDto.grade,
        grade: 'Pass',
      },
      include: {
        assignmentSubmission: {
          select: {
            assignment: true,
          },
        },
      },
    });

    await this.notificationService.notifyUser(
      gradeDto.studentId,
      'Submission Graded',
      `Your submission on ${grade.assignmentSubmission?.assignment.title} has been graded`,
    );

    return {
      ...grade,
      rubricScores: grade.rubricScores as Prisma.JsonValue[],
      questionScores: grade.questionScores as Prisma.JsonValue[],
    };
  }

  async findOne(id: string): Promise<SubmissionDetailsDto> {
    const submissionData =
      await this.prisma.client.assignmentSubmission.findFirstOrThrow({
        where: { id },
        include: {
          gradeRecord: true,
          student: true,
          attachments: true,
          assignment: {
            include: {
              grading: true,
            },
          },
        },
      });

    const {
      assignment: { grading, ...assignment },
      ...submission
    } = submissionData;

    return {
      ...submission,
      content: submission.content as Prisma.JsonValue[],
      groupSnapshot: submission.groupSnapshot as Prisma.JsonValue[],
      grade: submission.gradeRecord
        ? {
            ...submission.gradeRecord,
            rubricScores: submission.gradeRecord
              .rubricScores as Prisma.JsonValue[],
            questionScores: submission.gradeRecord
              .questionScores as Prisma.JsonValue[],
          }
        : undefined,
      assignment: {
        ...assignment,
        content: assignment.content as Prisma.JsonValue[],
      },
      grading: grading
        ? {
            ...grading,
            curveSettings: grading.curveSettings as Prisma.JsonValue[],
            rubricSchema: grading.rubricSchema as Prisma.JsonValue[],
            questionRules: grading.questionRules as Prisma.JsonValue[],
          }
        : undefined,
    };
  }
}
