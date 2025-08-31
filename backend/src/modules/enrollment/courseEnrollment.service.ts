import { CourseEnrollmentDto } from '@/generated/nestjs-dto/courseEnrollment.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { StudentIdentifierDto } from './dto/studentIdentifier.dto';
import { AuthUser } from '@supabase/supabase-js';
import { Role } from '@/common/enums/roles.enum';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';

@Injectable()
export class CourseEnrollmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Enrolls a student in a given course section.
   *
   * @param courseSectionId - The ID of the course section to enroll into
   * @param dto - DTO with the student identifier (if admin is enrolling on behalf)
   * @param user - The authenticated user
   * @returns The created {@link CourseEnrollmentDto}
   *
   * @throws BadRequestException - If `studentId` is missing or enrollment period is closed
   * @throws ConflictException - If the student is already enrolled in the offering
   */
  @Log({
    logArgsMessage: ({ courseSectionId, dto, user }) =>
      `Creating enrollment for section [${courseSectionId}] | user: ${user.id} | studentId: ${dto?.studentId ?? 'self'}`,
    logSuccessMessage: (enrollment) =>
      `Enrollment [${enrollment.id}] successfully created`,
    logErrorMessage: (err, { courseSectionId, dto, user }) =>
      `Error creating enrollment in section [${courseSectionId}] | user: ${user.id} | studentId: ${dto?.studentId ?? 'self'} | Error: ${err.message}`,
  })
  async createCourseEnrollment(
    @LogParam('courseSectionId') courseSectionId: string,
    @LogParam('dto') dto: StudentIdentifierDto,
    @LogParam('user') user: AuthUser,
  ): Promise<CourseEnrollmentDto> {
    let studentId: string;

    if (user.role === Role.STUDENT) {
      studentId = user.id;
    } else {
      if (!dto.studentId) {
        throw new BadRequestException('studentId cannot be empty.');
      }
      studentId = dto.studentId;
    }

    if (user.role === Role.ADMIN && !studentId) {
      throw new BadRequestException('studentId cannot be empty.');
    }
    // Retrieve course section, offering, and enrollment period
    const {
      id: sectionId,
      maxSlot,
      courseOffering: {
        id: offeringId,
        enrollmentPeriod: { status: periodStatus },
      },
    } = await this.prisma.client.courseSection.findUniqueOrThrow({
      where: { id: courseSectionId },
      include: {
        courseOffering: {
          select: {
            id: true,
            periodId: true,
            enrollmentPeriod: { select: { status: true } },
          },
        },
      },
    });

    // Validate enrollment period
    if (['closed', 'archived', 'cancelled'].includes(periodStatus)) {
      throw new BadRequestException('Enrollment period already closed.');
    }

    const enrollment = await this.prisma.client.$transaction(async (tx) => {
      const enrolled = await tx.courseEnrollment.findFirst({
        where: {
          studentId: studentId,
          courseOfferingId: offeringId,
        },
      });

      // Validate if student is already enrolled in the course
      if (enrolled) {
        throw new ConflictException('Already enrolled in this course offering');
      }

      const count = await tx.courseEnrollment.count({
        where: {
          courseSectionId: sectionId,
          deletedAt: null,
        },
      });

      // Validate no of currently enrolled student
      if (count >= maxSlot) {
        throw new BadRequestException(
          'This section has reached its maximum capacity.',
        );
      }

      // create course enrollment record
      return tx.courseEnrollment.create({
        data: {
          studentId: studentId,
          courseOfferingId: offeringId,
          courseSectionId: sectionId,
          status: 'enlisted',
          startedAt: new Date(),
        },
      });
    });
    return enrollment;
  }

  /**
   * Drops (soft-deletes) an active course enrollment.
   *
   * @param sectionId - The course section ID
   * @param dto - DTO with the student identifier (if admin is dropping on behalf)
   * @param user - The authenticated user
   * @returns A confirmation message
   *
   * @throws NotFoundException - If the enrollment does not exist
   * @throws BadRequestException - If `studentId` is missing
   */
  @Log({
    logArgsMessage: ({ sectionId, dto, user }) =>
      `Dropping enrollment for section [${sectionId}] | user: ${user.id} | studentId: ${dto?.studentId ?? 'self'}`,
    logSuccessMessage: (_, { sectionId, user }) =>
      `Successfully dropped enrollment in section [${sectionId}] by user [${user.id}]`,
    logErrorMessage: (err, { sectionId, user }) =>
      `Error dropping enrollment in section [${sectionId}] by user [${user.id}] | Error: ${err.message}`,
  })
  async dropCourseEnrollment(
    @LogParam('sectionId') sectionId: string,
    @LogParam('dto') dto: StudentIdentifierDto,
    @LogParam('user') user: AuthUser,
  ) {
    const studentId = user.role === Role.STUDENT ? user.id : dto.studentId;

    if (user.role === Role.ADMIN && !studentId) {
      throw new BadRequestException('studentId cannot be empty.');
    }

    return this.prisma.client.$transaction(async (tx) => {
      const courseEnrollment = await tx.courseEnrollment.findFirst({
        where: { studentId, courseSectionId: sectionId, deletedAt: null },
      });

      if (!courseEnrollment) {
        throw new NotFoundException(
          'Enrollment record not found or already dropped.',
        );
      }

      await tx.courseEnrollment.update({
        where: { id: courseEnrollment.id },
        data: {
          status: 'dropped',
          deletedAt: new Date(),
        },
      });

      return {
        message: `Successfully dropped course enrollment for section ${sectionId}.`,
      };
    });
  }

  /**
   * Finalizes all enlisted enrollments for a student.
   *
   * @param dto - DTO with the student identifier (if admin is finalizing on behalf)
   * @param user - The authenticated user
   * @returns A summary message with the number of finalized enrollments
   *
   * @throws BadRequestException - If no enlisted enrollments are found
   */
  async finalizeEnrollment(dto: StudentIdentifierDto, user: AuthUser) {
    const studentId = user.role === Role.STUDENT ? user.id : dto.studentId;

    if (user.role === Role.ADMIN && !studentId) {
      throw new BadRequestException('studentId cannot be empty.');
    }

    return this.prisma.client.$transaction(async (tx) => {
      const enslisted = await tx.courseEnrollment.findMany({
        where: { studentId, status: 'enlisted', deletedAt: null },
      });

      if (!enslisted.length) {
        throw new BadRequestException(
          'No enslisted enrollments found to finalize.',
        );
      }

      await tx.courseEnrollment.updateMany({
        where: {
          studentId,
          status: 'enlisted',
          deletedAt: null,
        },
        data: {
          status: 'finalized',
        },
      });

      return {
        message: `Successfilly finalized ${enslisted.length} course enrollment(s).`,
        studentId,
      };
    });
  }
}
