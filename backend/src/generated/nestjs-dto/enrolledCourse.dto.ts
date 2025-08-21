import { EnrolledCourseStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EnrolledCourseDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: EnrolledCourseStatus,
    enumName: 'EnrolledCourseStatus',
  })
  status: EnrolledCourseStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  completedAt: Date;
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
