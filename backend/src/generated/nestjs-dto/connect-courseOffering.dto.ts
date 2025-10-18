import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseOfferingCourseIdPeriodIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  periodId: string;
}

@ApiExtraModels(CourseOfferingCourseIdPeriodIdUniqueInputDto)
export class ConnectCourseOfferingDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CourseOfferingCourseIdPeriodIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseOfferingCourseIdPeriodIdUniqueInputDto)
  courseId_periodId?: CourseOfferingCourseIdPeriodIdUniqueInputDto;
}
