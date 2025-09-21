import { PricingType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreatePricingDto {
  @ApiProperty({
    enum: PricingType,
    enumName: 'PricingType',
  })
  @IsNotEmpty()
  @IsEnum(PricingType)
  type: PricingType;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  amount: Prisma.Decimal;
}
