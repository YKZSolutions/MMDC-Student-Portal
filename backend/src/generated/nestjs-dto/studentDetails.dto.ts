import { Prisma, StudentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class StudentDetailsDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  student_number: number;
  @ApiProperty({
    enum: StudentType,
    enumName: 'StudentType',
  })
  student_type: StudentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  admission_date: Date;
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
