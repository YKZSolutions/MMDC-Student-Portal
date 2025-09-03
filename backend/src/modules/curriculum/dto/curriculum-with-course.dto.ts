import { CurriculumCourseDto } from '@/generated/nestjs-dto/curriculumCourse.dto';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CurriculumItemDto } from './curriculum-item.dto';
import { CourseDto } from '@/generated/nestjs-dto/course.dto';

export class CurriculumWithCoursesDto {
  @ValidateNested({ each: true })
  @Type(() => CurriculumItemDto)
  curriculum: CurriculumItemDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurriculumCourseItemDto)
  courses: CurriculumCourseItemDto[];
}

export class CurriculumCourseItemDto extends CurriculumCourseDto {
  @ValidateNested({ each: true })
  @Type(() => CourseDto)
  course: CourseDto;
}
