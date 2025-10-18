import { EnrollmentStatus } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';
import {
  PricingGroup,
  type PricingGroup as PricingGroupAsType,
} from './pricingGroup.entity';
import {
  YearLevel,
  type YearLevel as YearLevelAsType,
} from './yearLevel.entity';

export class EnrollmentPeriod {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => CourseOffering,
    isArray: true,
    required: false,
  })
  courseOfferings?: CourseOfferingAsType[];
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  pricingGroupId: string | null;
  @ApiHideProperty()
  pricingGroup?: PricingGroupAsType | null;
  @ApiHideProperty()
  eligibleYearLevels?: YearLevelAsType[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  startYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  endYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  term: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  startDate: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  endDate: Date;
  @ApiProperty({
    enum: EnrollmentStatus,
    enumName: 'EnrollmentStatus',
  })
  status: EnrollmentStatus;
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
