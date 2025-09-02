import { UpdateCurriculumDto } from '@/generated/nestjs-dto/update-curriculum.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class UpdateCurriculumWithCourseDto {
  @IsUUID()
  majorId?: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateCurriculumDto)
  curriculum: UpdateCurriculumDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCurriculumCourseItemDto)
  courses: UpdateCurriculumCourseItemDto[];
}

class UpdateCurriculumCourseItemDto {
  @IsUUID()
  courseId: string;

  @IsNumber()
  order: number;

  @IsPositive()
  year: number;

  @IsPositive()
  semester: number;
}
