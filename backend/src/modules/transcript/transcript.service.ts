import { convertToStandardGrade } from '@/common/helpers/grades';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';

@Injectable()
export class TranscriptService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(createTranscriptDto: CreateTranscriptDto) {
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

  async findAll() {
    return `This action returns all transcript`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} transcript`;
  }

  async update(id: number, updateTranscriptDto: UpdateTranscriptDto) {
    return `This action updates a #${id} transcript`;
  }

  async remove(id: number) {
    return `This action removes a #${id} transcript`;
  }
}
