import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PricingNameDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(PricingNameDeletedAtUniqueInputDto)
export class ConnectPricingDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: PricingNameDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingNameDeletedAtUniqueInputDto)
  name_deletedAt?: PricingNameDeletedAtUniqueInputDto;
}
