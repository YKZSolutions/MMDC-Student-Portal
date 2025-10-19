import { CreateCurriculumDto } from '@/generated/nestjs-dto/create-curriculum.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateCurriculumWithCoursesDto {
  @IsUUID()
  majorId: string;

  @ValidateNested({ each: true })
  @Type(() => CreateCurriculumDto)
  curriculum: CreateCurriculumDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCurriculumCourseItemDto)
  courses: CreateCurriculumCourseItemDto[];
}

class CreateCurriculumCourseItemDto {
  @IsUUID()
  courseId: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsUUID()
  yearLevelId?: string;

  @IsPositive()
  semester: number;
}
