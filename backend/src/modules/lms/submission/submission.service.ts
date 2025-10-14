import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { AssignmentSubmissionDetailsDto } from './dto/paginated-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { GradeRecordDto } from '@/generated/nestjs-dto/gradeRecord.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class SubmissionService {
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
            assignment: {
              select: {
                moduleContent: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    await this.notificationService.notifyUser(
      gradeDto.studentId,
      'Submission Graded',
      `Your ${grade.assignmentSubmission?.assignment?.moduleContent?.title} submission has been graded`,
    );

    return grade;
  }

  async findOne(id: string): Promise<AssignmentSubmissionDetailsDto> {
    const submission =
      await this.prisma.client.assignmentSubmission.findFirstOrThrow({
        where: { id },
        include: {
          gradeRecord: true,
          student: true,
          attachments: true,
          assignment: true,
        },
      });

    return {
      ...submission,
      content: submission.content as Prisma.JsonValue[],
      groupSnapshot: submission.groupSnapshot as Prisma.JsonValue[],
      gradeRecord: submission.gradeRecord,
    };
  }
}
