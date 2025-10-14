import { AppointmentStatus } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';
import { User, type User as UserAsType } from './user.entity';

export class Appointment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  courseOfferingId: string;
  @ApiHideProperty()
  courseOffering?: CourseOfferingAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiHideProperty()
  student?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  mentorId: string;
  @ApiHideProperty()
  mentor?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  endAt: Date;
  @ApiProperty({
    enum: AppointmentStatus,
    enumName: 'AppointmentStatus',
  })
  status: AppointmentStatus;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  gmeetLink: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  cancelReason: string | null;
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
