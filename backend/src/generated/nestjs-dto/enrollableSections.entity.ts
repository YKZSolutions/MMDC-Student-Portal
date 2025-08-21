import { Days } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';

export class EnrollableSections {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  mentorId: string;
  @ApiHideProperty()
  user?: UserAsType;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxSlot: number;
  @ApiProperty({
    type: 'string',
  })
  startSched: string;
  @ApiProperty({
    type: 'string',
  })
  endSched: string;
  @ApiProperty({
    isArray: true,
    enum: Days,
    enumName: 'Days',
  })
  days: Days[];
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
