import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ApiProperty } from '@nestjs/swagger';

class CourseOfferingWithCourseAndPeriod extends CourseOfferingDto {
  @ApiProperty({ type: () => CourseDto })
  course: CourseDto;

  @ApiProperty({ type: () => EnrollmentPeriodDto })
  enrollmentPeriod: EnrollmentPeriodDto;
}

// A composed DTO that represents a CourseSection with its CourseOffering
// and nested Course + EnrollmentPeriod information.
export class CourseSectionWithCourseOfferingDto extends CourseSectionDto {
  @ApiProperty({ type: () => CourseOfferingWithCourseAndPeriod })
  courseOffering: CourseOfferingWithCourseAndPeriod;
}
