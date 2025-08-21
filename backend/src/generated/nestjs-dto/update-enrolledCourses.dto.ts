import { EnrolledCourseStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateEnrolledCoursesDto {
  @ApiProperty({
    enum: EnrolledCourseStatus,
    enumName: 'EnrolledCourseStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(EnrolledCourseStatus)
  status?: EnrolledCourseStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startedAt?: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
