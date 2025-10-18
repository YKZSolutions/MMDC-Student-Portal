import { Prisma, StudentType } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  YearLevel,
  type YearLevel as YearLevelAsType,
} from './yearLevel.entity';

export class StudentDetails {
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
  @ApiHideProperty()
  yearLevel?: YearLevelAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  yearLevelId: string | null;
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
