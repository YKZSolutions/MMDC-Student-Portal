import { PricingType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdatePricingDto {
  @ApiProperty({
    enum: PricingType,
    enumName: 'PricingType',
    required: false,
  })
  @IsOptional()
  @IsEnum(PricingType)
  type?: PricingType;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  amount?: Prisma.Decimal;
}
