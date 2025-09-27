import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsOptional, IsArray } from 'class-validator';

export class UpdateGradingConfigDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDecimal()
  weight?: Prisma.Decimal | null;
  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCurved?: boolean;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  curveSettings?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  rubricSchema?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  questionRules?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}
