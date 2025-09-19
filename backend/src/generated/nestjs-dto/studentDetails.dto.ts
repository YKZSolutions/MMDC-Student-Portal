import { Prisma, StudentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class StudentDetailsDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  studentNumber: string;
  @ApiProperty({
    enum: StudentType,
    enumName: 'StudentType',
  })
  studentType: StudentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  admissionDate: Date;
  @ApiProperty({
    type: () => Object,
  })
  otherDetails: Prisma.JsonValue;
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
