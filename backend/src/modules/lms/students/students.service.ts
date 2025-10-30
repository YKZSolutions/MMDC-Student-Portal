import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CourseEnrollmentStatus } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import {
  EnrolledStudentDto,
  EnrolledStudentsResponseDto,
} from './dto/enrolled-students.dto';

@Injectable()
export class StudentsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Retrieves all enrolled students for a module.
   *
   * @remarks
   * This method fetches all students enrolled in the course offering associated with the module,
   * along with their section information.
   *
   * @param moduleId - The UUID of the module
   * @param courseOfferingId - Optional course offering ID to filter by
   * @returns An object containing the list of enrolled students and total count
   *
   * @throws {NotFoundException} If the module is not found
   */
  @Log({
    logArgsMessage: ({ moduleId }) =>
      `Fetching enrolled students for module [${moduleId}]`,
    logSuccessMessage: (result, { moduleId }) =>
      `Fetched ${result.total} enrolled student(s) for module [${moduleId}]`,
    logErrorMessage: (err, { moduleId }) =>
      `Error fetching enrolled students for module [${moduleId}] | Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(`Module not found`),
  })
  async getEnrolledStudents(
    @LogParam('moduleId') moduleId: string,
    @LogParam('courseOfferingId') courseOfferingId?: string,
  ): Promise<EnrolledStudentsResponseDto> {
    // Get the module to validate it exists and get its course offering
    const module = await this.prisma.client.module.findUniqueOrThrow({
      where: { id: moduleId },
      select: {
        id: true,
        courseOfferingId: true,
      },
    });

    // Determine which course offering to use
    const targetOfferingId = courseOfferingId || module.courseOfferingId;

    if (!targetOfferingId) {
      throw new NotFoundException(
        'No course offering found for this module. The module must be associated with a course offering.',
      );
    }

    // Get all enrolled students for this course offering with their section info
    const enrollments = await this.prisma.client.courseEnrollment.findMany({
      where: {
        courseSection: {
          courseOfferingId: targetOfferingId,
        },
        status: {
          in: ['enrolled', 'finalized'] as CourseEnrollmentStatus[],
        },
      },
      select: {
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            role: true,
            studentDetails: {
              select: {
                studentNumber: true,
              },
            },
          },
        },
        courseSection: {
          select: {
            id: true,
            name: true,
            mentorId: true,
            mentor: {
              select: {
                firstName: true,
                lastName: true,
                staffDetails: {
                  select: {
                    employeeNumber: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } },
      ],
    });

    // Transform to DTOs
    const students: EnrolledStudentDto[] = enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      studentNumber: enrollment.student.studentDetails?.studentNumber || null,
      firstName: enrollment.student.firstName,
      middleName: enrollment.student.middleName,
      lastName: enrollment.student.lastName,
      role: enrollment.student.role,
      section: {
        id: enrollment.courseSection.id,
        name: enrollment.courseSection.name,
        mentorId: enrollment.courseSection.mentorId || '',
        mentorName: enrollment.courseSection.mentor
          ? `${enrollment.courseSection.mentor.firstName} ${enrollment.courseSection.mentor.lastName}`
          : 'No Mentor Assigned',
        mentorEmployeeNumber:
          enrollment.courseSection.mentor?.staffDetails?.employeeNumber || null,
      },
    }));

    return {
      students,
      total: students.length,
    };
  }
}
