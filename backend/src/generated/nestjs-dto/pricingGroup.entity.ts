import { Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Pricing, type Pricing as PricingAsType } from './pricing.entity';
import {
  EnrollmentPeriod,
  type EnrollmentPeriod as EnrollmentPeriodAsType,
} from './enrollmentPeriod.entity';

export class PricingGroup {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  prices?: PricingAsType[];
  @ApiHideProperty()
  enrollmentPeriods?: EnrollmentPeriodAsType[];
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  amount: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
  })
  enabled: boolean;
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
