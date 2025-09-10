import { ContentType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateModuleContentDto {
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
    required: false,
  })
  @IsOptional()
  content?: Prisma.InputJsonValue;
  @ApiProperty({
    enum: ContentType,
    enumName: 'ContentType',
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
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
}
