import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpdateSectionModuleDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  @IsOptional()
  @IsInt()
  order?: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  toPublishAt?: Date | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  classMeetings?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}
