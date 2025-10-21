import { PaginatedDto } from '@/common/dto/paginated.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CourseFullDto } from './course-full.dto';

export class PaginatedCoursesDto extends PaginatedDto {
  @ApiProperty({
    type: () => CourseFullDto,
    isArray: true,
    description: 'List of courses for the current page',
  })
  courses: CourseFullDto[];
}
