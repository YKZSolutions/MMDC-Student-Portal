import { CourseEnrollmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCourseEnrollmentDto {
  @ApiProperty({
    enum: CourseEnrollmentStatus,
    enumName: 'CourseEnrollmentStatus',
  })
  @IsNotEmpty()
  @IsEnum(CourseEnrollmentStatus)
  status: CourseEnrollmentStatus;
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
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  completedAt?: Date | null;
}
