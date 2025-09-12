import { PaginatedDto } from '@/common/dto/paginated.dto';
import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedCoursesDto extends PaginatedDto {
  @ApiProperty({
    type: () => CourseDto,
    isArray: true,
    description: 'List of courses for the current page',
  })
  courses: CourseDto[];
}
