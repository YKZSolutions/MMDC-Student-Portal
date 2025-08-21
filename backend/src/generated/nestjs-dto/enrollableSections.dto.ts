import { Days } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollableSectionsDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
