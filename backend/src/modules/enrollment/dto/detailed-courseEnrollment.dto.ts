import { CourseEnrollmentDto } from '@/generated/nestjs-dto/courseEnrollment.dto';
import { PickType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { DetailedCourseSectionDto } from './detailed-courseOffering.dto';
import { DetailedCourseOfferingDto } from './paginated-courseOffering.dto';

export class DetailedCourseOfferingSubsetDto extends PickType(
  DetailedCourseOfferingDto,
  ['course'],
) {}

export class DetailedCourseEnrollmentDto extends CourseEnrollmentDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseOfferingId: string;

  @IsUUID()
  courseSectionId: string;

  @IsOptional()
  courseSection?: DetailedCourseSectionDto;

  @IsOptional()
  courseOffering?: DetailedCourseOfferingSubsetDto;
}
