import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { convertToStandardGrade } from '@/common/helpers/grades';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { TranscriptDto } from '@/generated/nestjs-dto/transcript.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CustomPrismaService } from 'nestjs-prisma';
import { DetailedTranscriptDto } from './dto/detailed-transcript.dto';
import { FilterTranscriptDto } from './dto/filter-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { UpsertTranscriptDto } from './dto/upsert-transcript.dto';

@Injectable()
export class TranscriptService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Upserts a transcript record.
   *
   * @param createTranscriptDto - The transcript data to create or update.
   *
   * @returns The created or updated transcript.
   *
   * @throws NotFoundException - If the specified course offering or student does not exist.
   * @throws InternalServerErrorException - If there is an error during the upsert operation.
   */
  @Log({
    logArgsMessage: ({ createTranscriptDto }) =>
      `Creating transcript for student [${createTranscriptDto.studentId}]`,
    logSuccessMessage: (_, { createTranscriptDto }) =>
      `Transcript successfully created for student [${createTranscriptDto.studentId}]`,
    logErrorMessage: (err, { createTranscriptDto }) =>
      `Error creating transcript for student [${createTranscriptDto.studentId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { createTranscriptDto }) =>
      new NotFoundException(
        `The specified courseOfferingId [${createTranscriptDto.courseOfferingId}] or studentId [${createTranscriptDto.studentId}] was not found.`,
      ),
  })
  async upsertTranscript(
    @LogParam('createTranscriptDto') createTranscriptDto: UpsertTranscriptDto,
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

      // Now, insert or update the transcript record
      const transcript = await tx.transcript.upsert({
        where: {
          userId: studentId,
          courseOfferingId: courseOfferingId,
        },
        update: {
          grade: computedGrade,
          gradePoints: computedGradePoints,
        },
        create: {
          user: { connect: { id: studentId } },
          courseOffering: { connect: { id: courseOfferingId } },
          grade: computedGrade,
          gradePoints: computedGradePoints,
        },
      });

      return transcript;
    });
  }

  /**
   * Fetches all transcripts for a student.
   *
   * @param filters - The filters to apply when fetching transcripts.
   * @param user - The current user making the request.
   *
   * @returns A list of detailed transcripts for the student.
   *
   * @throws NotFoundException - If no transcripts are found.
   * @throws InternalServerErrorException - If there is an error during the fetch operation.
   */
  @Log({
    logArgsMessage: ({ filters, user }) =>
      `Fetching transcripts with filters [${filters}] for student [${user.id}]`,
    logSuccessMessage: (_, { user }) =>
      `Transcript successfully created for student [${user.id}]`,
    logErrorMessage: (err, { user }) =>
      `Error creating transcript for student [${user.id}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('Transcripts not found'),
  })
  async findAllTranscript(
    @LogParam('filters') filters: FilterTranscriptDto,
    @LogParam('user') user: CurrentAuthUser,
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

  /**
   * Updates a transcript record.
   *
   * @param transcriptId - The ID of the transcript to update.
   * @param updateTranscriptDto - The data to update the transcript with.
   *
   * @returns The updated transcript.
   *
   * @throws NotFoundException - If the transcript does not exist.
   * @throws InternalServerErrorException - If there is an error during the update operation.
   */
  @Log({
    logArgsMessage: ({ transcriptId, updateTranscriptDto }) =>
      `Updating transcript [${transcriptId}] with data [${updateTranscriptDto}]`,
    logSuccessMessage: (_, { transcriptId }) =>
      `Transcript [${transcriptId}] successfully updated.`,
    logErrorMessage: (err, { transcriptId }) =>
      `Error updating transcript [${transcriptId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { transcriptId }) =>
      new NotFoundException(`Transcript [${transcriptId}] not found`),
  })
  async updateTranscript(
    @LogParam('transcriptId') transcriptId: string,
    @LogParam('updateTranscriptDto') updateTranscriptDto: UpdateTranscriptDto,
  ): Promise<TranscriptDto> {
    return this.prisma.client.$transaction(async (tx) => {
      const { grade, gradeLetter } = updateTranscriptDto;

      // Fetch the course units for grade points calculation
      const {
        course: { units },
      } = await tx.courseOffering.findFirstOrThrow({
        where: {
          transcripts: {
            some: { id: transcriptId },
          },
        },
        select: { course: { select: { units: true } } },
      });

      // Compute grade points
      // Also ensure grade is a Decimal instance
      const computedGradePoints = Decimal(grade).mul(Decimal(units));

      // Update the transcript record
      return await tx.transcript.update({
        where: {
          id: transcriptId,
        },
        data: {
          grade: grade,
          gradePoints: computedGradePoints,
          gradeLetter: gradeLetter ?? null,
        },
      });
    });
  }

  /**
   * Removes a transcript record.
   * @param transcriptId - The ID of the transcript to remove.
   * @param directDelete - If true, permanently deletes the record; otherwise, may soft-delete based on implementation.
   *
   * @returns A message indicating the result of the deletion operation.
   *
   * @throws NotFoundException - If the transcript does not exist.
   * @throws InternalServerErrorException - If there is an error during the deletion operation.
   */
  @Log({
    logArgsMessage: ({ transcriptId }) =>
      `Removing transcript [${transcriptId}]`,
    logSuccessMessage: (_, { transcriptId }) =>
      `Transcript [${transcriptId}] successfully removed.`,
    logErrorMessage: (err, { transcriptId }) =>
      `Error removing transcript [${transcriptId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { transcriptId }) =>
      new NotFoundException(`Transcript [${transcriptId}] not found`),
  })
  async removeTranscript(
    @LogParam('transcriptId') transcriptId: string,
    @LogParam('directDelete') directDelete?: boolean,
  ) {
    return await this.prisma.client.$transaction(async (tx) => {
      const transcript = await tx.transcript.findUniqueOrThrow({
        where: { id: transcriptId },
      });

      if (!directDelete && !transcript?.deletedAt) {
        await this.prisma.client.transcript.update({
          where: { id: transcriptId },
          data: { deletedAt: new Date() },
        });

        return { message: 'Transcript marked for deletion' };
      }

      await this.prisma.client.transcript.delete({
        where: { id: transcriptId },
      });

      return { message: 'Transcript permanently deleted' };
    });
  }
}
