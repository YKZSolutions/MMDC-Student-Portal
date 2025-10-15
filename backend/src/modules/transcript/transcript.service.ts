import { convertToStandardGrade } from '@/common/helpers/grades';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { TranscriptDto } from '@/generated/nestjs-dto/transcript.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { DetailedTranscriptDto } from './dto/detailed-transcript.dto';
import { FilterTranscriptDto } from './dto/filter-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';

@Injectable()
export class TranscriptService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(
    createTranscriptDto: CreateTranscriptDto,
  ): Promise<TranscriptDto> {
    const { courseOfferingId, studentId } = createTranscriptDto;

    return await this.prisma.client.$transaction(async (tx) => {
      const gradeRecords = await tx.gradeRecord.findMany({
        where: {
          assignmentSubmission: {
            studentId: studentId,
            assignment: {
              moduleContent: {
                module: {
                  courseOfferingId: courseOfferingId,
                },
              },
            },
          },
        },
        select: {
          assignmentSubmission: {
            select: {
              assignment: {
                select: {
                  grading: true,
                },
              },
            },
          },
          rawScore: true,
        },
      });

      // Fetch the course units for grade points calculation
      const {
        course: { units },
      } = await tx.courseOffering.findUniqueOrThrow({
        where: { id: courseOfferingId },
        select: { course: { select: { units: true } } },
      });

      const { sumPercent, count } = gradeRecords.reduce(
        (acc, record) => {
          const rawScore = new Decimal(record.rawScore);
          const maxScore = new Decimal(
            record.assignmentSubmission?.assignment.grading?.weight || 0,
          );

          // Avoid division by zero
          if (maxScore.isZero()) return acc;

          const percent = rawScore.div(maxScore).mul(100);

          return {
            sumPercent: acc.sumPercent.plus(percent),
            count: acc.count.plus(1),
          };
        },
        {
          sumPercent: new Decimal(0),
          count: new Decimal(0),
        },
      );

      const computedGrade = count.gt(0)
        ? convertToStandardGrade(sumPercent.div(count))
        : convertToStandardGrade(new Decimal(0));

      // Compute grade points
      const computedGradePoints = computedGrade.mul(Decimal(units));

      // Now, create the transcript record
      const transcript = await tx.transcript.create({
        data: {
          user: { connect: { id: studentId } },
          courseOffering: { connect: { id: courseOfferingId } },
          grade: computedGrade,
          gradePoints: computedGradePoints,
        },
      });

      return transcript;
    });
  }

  async findAll(
    filters: FilterTranscriptDto,
    user: CurrentAuthUser,
  ): Promise<DetailedTranscriptDto[]> {
    return this.prisma.client.$transaction(async (tx) => {
      const { enrollmentPeriodId, studentId } = filters;
      const role = user.user_metadata.role;
      const where: Prisma.TranscriptWhereInput = {};

      // Assign the enrollmentPeriodId may it be provided or not
      where.courseOffering = {
        enrollmentPeriod: {
          id: enrollmentPeriodId,
        },
      };

      // If enrollmentPeriodId is not provided, fetch the active enrollment period
      if (!enrollmentPeriodId) {
        const fetchedEnrollmentPeriodId = (
          await tx.enrollmentPeriod.findFirstOrThrow().catch(() => {
            throw new NotFoundException(
              'No enrollment periods found in the system',
            );
          })
        ).id;

        where.courseOffering.enrollmentPeriod = {
          id: fetchedEnrollmentPeriodId,
        };
      }

      // Ensure that non-admin users can only access their own transcripts
      // Assign the user.id may it be provided or not
      where.userId = user.id;

      if (role !== 'student') {
        where.userId =
          studentId ??
          (
            await tx.user
              .findFirstOrThrow({
                where: {
                  role: 'student',
                },
                select: { id: true },
              })
              .catch(() => {
                throw new NotFoundException('No students found in the system');
              })
          ).id;
      }

      return await tx.transcript.findMany({
        where: {
          ...where,
        },
        include: {
          courseOffering: {
            include: {
              course: true,
              enrollmentPeriod: true,
            },
          },
        },
      });
    });
  }

  async update(transcriptId: string, dto: UpdateTranscriptDto) {
    return `This action updates a #${transcriptId} transcript`;
  }

  async remove(id: number) {
    return `This action removes a #${id} transcript`;
  }
}
