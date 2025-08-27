import { PaginatedDto } from '@/common/dto/paginated.dto';
import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { ApiProperty } from '@nestjs/swagger';

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
  courseSections: CourseSectionDto[];
}
