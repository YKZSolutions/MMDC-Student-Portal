import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAssignmentGradingDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  weight: Prisma.Decimal;
  @ApiProperty({
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  isCurved: boolean;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  curveSettings?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}
