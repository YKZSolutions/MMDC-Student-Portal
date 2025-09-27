import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional } from 'class-validator';

export class UpdateSectionModuleDto {
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
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  classMeetings?: Prisma.InputJsonValue[];
}
