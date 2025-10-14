import { ContentType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateModuleContentDto {
  @ApiProperty({
    enum: ContentType,
    enumName: 'ContentType',
    default: 'LESSON',
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  subtitle?: string | null;
  @ApiProperty({
    type: () => Object,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  content?: Prisma.InputJsonValue[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 1,
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
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  unpublishedAt?: Date | null;
}
