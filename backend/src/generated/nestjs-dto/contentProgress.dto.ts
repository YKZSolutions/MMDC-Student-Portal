import { ProgressStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ContentProgressDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: ProgressStatus,
    enumName: 'ProgressStatus',
  })
  status: ProgressStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  lastAccessedAt: Date | null;
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
}
