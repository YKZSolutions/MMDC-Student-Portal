import { PaginatedDto } from '@/common/dto/paginated.dto';
import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { ApiProperty } from '@nestjs/swagger';
import { DetailedCourseSectionDto } from './detailed-courseOffering.dto';

export class PaginatedCourseOfferingsDto extends PaginatedDto {
  @ApiProperty({
    type: () => DetailedCourseOfferingDto,
    isArray: true,
    description: 'List of course offerings for the current page',
  })
  courseOfferings: DetailedCourseOfferingDto[];
}

export class DetailedCourseOfferingDto extends CourseOfferingDto {
  course: CourseDto;
  courseSections: DetailedCourseSectionDto[];
}
