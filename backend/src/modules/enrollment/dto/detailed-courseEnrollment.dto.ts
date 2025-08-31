import { CourseEnrollmentDto } from '@/generated/nestjs-dto/courseEnrollment.dto';
import { IsUUID } from 'class-validator';

export class DetailedCourseEnrollmentDto extends CourseEnrollmentDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseOfferingId: string;

  @IsUUID()
  courseSectionId: string;
}
