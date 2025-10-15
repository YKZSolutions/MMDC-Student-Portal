import { GradeLetter, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';

export class Transcript {
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
    type: 'string',
  })
  courseOfferingId: string;
  @ApiHideProperty()
  courseOffering?: CourseOfferingAsType;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  grade: Prisma.Decimal;
  @ApiProperty({
    enum: GradeLetter,
    enumName: 'GradeLetter',
    nullable: true,
  })
  gradeLetter: GradeLetter | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  gradePoints: Prisma.Decimal;
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
