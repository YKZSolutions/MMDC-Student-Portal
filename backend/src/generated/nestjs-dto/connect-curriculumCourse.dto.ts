import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CurriculumCourseCurriculumIdCourseIdDeletedAtUniqueInputDto {
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
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(CurriculumCourseCurriculumIdCourseIdDeletedAtUniqueInputDto)
export class ConnectCurriculumCourseDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CurriculumCourseCurriculumIdCourseIdDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurriculumCourseCurriculumIdCourseIdDeletedAtUniqueInputDto)
  curriculumId_courseId_deletedAt?: CurriculumCourseCurriculumIdCourseIdDeletedAtUniqueInputDto;
}
