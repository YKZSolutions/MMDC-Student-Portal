import { PricingType, Prisma } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  PricingGroup,
  type PricingGroup as PricingGroupAsType,
} from './pricingGroup.entity';

export class Pricing {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  priceGroups?: PricingGroupAsType[];
  @ApiProperty({
    enum: PricingType,
    enumName: 'PricingType',
  })
  type: PricingType;
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
