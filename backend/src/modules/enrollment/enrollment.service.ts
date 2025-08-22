import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateCourseOfferingDto } from './dto/create-courseOffering.dto';
import { CreateCourseSectionFullDto } from './dto/create-courseSection.dto';
import { UpdateCourseSection } from './dto/update-courseSection.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollmentStatus.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async createEnrollment(dto: CreateEnrollmentPeriodDto) {
    return await this.prisma.client.enrollmentPeriod.create({
      data: { ...dto },
    });
  }

  async createCourseOffering(periodId: string, dto: CreateCourseOfferingDto) {
    return await this.prisma.client.courseOffering.create({
      data: { ...dto, periodId },
    });
  }

  async createCourseSection(
    offeringId: string,
    createCourseSectionFullDto: CreateCourseSectionFullDto,
  ) {
    return await this.prisma.client.courseSection.create({
      data: { ...createCourseSectionFullDto, courseOfferingId: offeringId },
    });
  }

  async findAllEnrollments() {
    return await this.prisma.client.enrollmentPeriod.findMany();
  }

  async findAllCourseOfferings() {
    return await this.prisma.client.courseOffering.findMany();
  }

  async findOneEnrollment(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid Id format ${id}`);
    }

    return await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
      where: { id },
    });
  }

  async findOneCourseOffering(offeringId: string) {
    if (!isUUID(offeringId)) {
      throw new BadRequestException(`Invalid Id format ${offeringId}`);
    }

    return await this.prisma.client.courseOffering.findUniqueOrThrow({
      where: { id: offeringId },
    });
  }

  private validateUUID(...ids: string[]) {
    ids.forEach((id) => {
      if (!isUUID(id))
        throw new BadRequestException(`Invalid ID format: ${id}`);
    });
  }

  async findOneCourseSection(offeringId: string, sectionId: string) {
    this.validateUUID(offeringId, sectionId);

    return await this.prisma.client.courseSection.findUniqueOrThrow({
      where: { id: sectionId },
      include: {
        courseOffering: true,
      },
    });
  }

  async updateEnrollmentStatus(
    id: string,
    updateEnrollmentStatusDto: UpdateEnrollmentStatusDto,
  ) {
    return await this.prisma.client.enrollmentPeriod.update({
      where: { id },
      data: { ...updateEnrollmentStatusDto },
    });
  }

  async updateEnrollment(id: string, dto: UpdateEnrollmentDto) {
    this.validateUUID(id);

    const enrollment =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id },
      });

    if (enrollment.status === 'closed') {
      throw new BadRequestException(
        `Enrollment ${id} is closed and cannot be updated.`,
      );
    }

    return await this.prisma.client.enrollmentPeriod.update({
      where: { id },
      data: { ...dto },
    });
  }

  async updateCourseSection(
    offeringId: string,
    sectionId: string,
    dto: UpdateCourseSection,
  ) {
    this.validateUUID(offeringId, sectionId);

    const section = await this.prisma.client.courseSection.findFirstOrThrow({
      where: {
        id: sectionId,
        courseOfferingId: offeringId,
      },
      include: { courseOffering: { include: { enrollmentPeriod: true } } },
    });

    if (section.courseOffering.enrollmentPeriod.status === 'closed') {
      throw new BadRequestException(
        `Enrollment period for this course section is closed and cannot be updated.`,
      );
    }

    return await this.prisma.client.courseSection.update({
      where: { id: sectionId },
      data: { ...dto },
    });
  }

  async removeEnrollment(id: string) {
    this.validateUUID(id);

    const enrollment =
      await this.prisma.client.enrollmentPeriod.findUniqueOrThrow({
        where: { id },
      });

    if (enrollment.status === 'closed') {
      throw new BadRequestException(
        `Enrollment ${id} is closed and cannot be deleted.`,
      );
    }

    await this.prisma.client.enrollmentPeriod.delete({
      where: { id },
    });

    return { message: 'Enrollment removed successfully' };
  }

  async removeCourseOffering(periodId: string, courseOfferingId: string) {
    this.validateUUID(periodId, courseOfferingId);

    // Check if course offering exists
    const offering = await this.prisma.client.courseOffering.findFirstOrThrow({
      where: { id: courseOfferingId, periodId: periodId },
      include: {
        enrollmentPeriod: true,
      },
    });

    if (offering.enrollmentPeriod.status === 'closed') {
      throw new BadRequestException(
        `Enrollment ${periodId} is closed and cannot be deleted.`,
      );
    }

    await this.prisma.client.courseOffering.delete({
      where: { id: courseOfferingId },
    });

    return { message: 'Course offering removed successfully' };
  }

  async removeCourseSection(offeringId: string, sectionId: string) {
    this.validateUUID(offeringId, sectionId);

    const section = await this.prisma.client.courseSection.findFirstOrThrow({
      where: {
        id: sectionId,
        courseOfferingId: offeringId,
      },
      include: {
        courseOffering: {
          include: {
            enrollmentPeriod: true,
          },
        },
      },
    });

    if (section.courseOffering.enrollmentPeriod.status === 'closed') {
      throw new BadRequestException(
        'Cannot remove a course section from a closed enrollment period.',
      );
    }

    await this.prisma.client.courseSection.delete({
      where: { id: sectionId },
    });

    return { message: 'Section removed successfully' };
  }
}
