import { EnrolledCourseStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateEnrolledCoursesDto {
  @ApiProperty({
    enum: EnrolledCourseStatus,
    enumName: 'EnrolledCourseStatus',
  })
  @IsNotEmpty()
  @IsEnum(EnrolledCourseStatus)
  status: EnrolledCourseStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  completedAt: Date;
}
