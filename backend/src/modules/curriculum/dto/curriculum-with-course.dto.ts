import { CurriculumCourseDto } from '@/generated/nestjs-dto/curriculumCourse.dto';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CurriculumItemDto } from './curriculum-item.dto';

export class CurriculumWithCoursesDto {
  @ValidateNested({ each: true })
  @Type(() => CurriculumItemDto)
  curriculum: CurriculumItemDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurriculumCourseDto)
  courses: CurriculumCourseDto[];
}
