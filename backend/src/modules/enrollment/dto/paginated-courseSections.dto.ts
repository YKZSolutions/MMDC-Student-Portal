import { PaginatedDto } from '@/common/dto/paginated.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedCourseSectionsDto extends PaginatedDto {
  @ApiProperty({
    type: () => CourseSectionDto,
    isArray: true,
    description: 'List of course sections for the current page',
  })
  courseSections: CourseSectionDto[];
}
