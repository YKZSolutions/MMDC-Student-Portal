import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class StaffDetailsDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  employee_number: number;
  @ApiProperty({
    type: 'string',
  })
  department: string;
  @ApiProperty({
    type: 'string',
  })
  position: string;
  @ApiProperty({
    type: () => Object,
  })
  other_details: Prisma.JsonValue;
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
