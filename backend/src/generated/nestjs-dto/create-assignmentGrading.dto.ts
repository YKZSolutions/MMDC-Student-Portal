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
    default: false,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  isCurved?: boolean | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  curveSettings?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}
