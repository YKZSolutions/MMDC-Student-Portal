import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CurriculumCourseCurriculumIdCourseIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  curriculumId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;
}

@ApiExtraModels(CurriculumCourseCurriculumIdCourseIdUniqueInputDto)
export class ConnectCurriculumCourseDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CurriculumCourseCurriculumIdCourseIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurriculumCourseCurriculumIdCourseIdUniqueInputDto)
  curriculumId_courseId?: CurriculumCourseCurriculumIdCourseIdUniqueInputDto;
}
