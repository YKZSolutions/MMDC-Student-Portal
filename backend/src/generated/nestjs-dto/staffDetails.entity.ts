import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';

export class StaffDetails {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiHideProperty()
  user?: UserAsType;
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
