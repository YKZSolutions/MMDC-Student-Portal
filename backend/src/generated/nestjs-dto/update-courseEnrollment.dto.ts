import { CourseEnrollmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateCourseEnrollmentDto {
  @ApiProperty({
    enum: CourseEnrollmentStatus,
    enumName: 'CourseEnrollmentStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseEnrollmentStatus)
  status?: CourseEnrollmentStatus;
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
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  completedAt?: Date | null;
}
