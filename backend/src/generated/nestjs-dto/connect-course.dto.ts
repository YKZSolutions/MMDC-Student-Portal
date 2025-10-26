import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseCourseCodeDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseCode: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}
export class CourseNameDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(
  CourseCourseCodeDeletedAtUniqueInputDto,
  CourseNameDeletedAtUniqueInputDto,
)
export class ConnectCourseDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CourseCourseCodeDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseCourseCodeDeletedAtUniqueInputDto)
  courseCode_deletedAt?: CourseCourseCodeDeletedAtUniqueInputDto;
  @ApiProperty({
    type: CourseNameDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseNameDeletedAtUniqueInputDto)
  name_deletedAt?: CourseNameDeletedAtUniqueInputDto;
}
