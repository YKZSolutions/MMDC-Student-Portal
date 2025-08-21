import { EnrollmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  EnrollableCourses,
  type EnrollableCourses as EnrollableCoursesAsType,
} from './enrollableCourses.entity';

export class EnrollmentPeriod {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  startYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  endYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  term: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startDate: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  endDate: Date;
  @ApiProperty({
    enum: EnrollmentStatus,
    enumName: 'EnrollmentStatus',
  })
  status: EnrollmentStatus;
  @ApiProperty({
    type: () => EnrollableCourses,
    isArray: true,
    required: false,
  })
  enrollableCourses?: EnrollableCoursesAsType[];
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
