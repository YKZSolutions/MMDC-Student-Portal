import { CourseEnrollmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CourseEnrollmentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: CourseEnrollmentStatus,
    enumName: 'CourseEnrollmentStatus',
  })
  status: CourseEnrollmentStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}
