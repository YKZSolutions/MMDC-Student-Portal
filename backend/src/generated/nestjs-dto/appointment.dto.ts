import { AppointmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AppointmentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
