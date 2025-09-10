import { ContentType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateModuleContentDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  order: number;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
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
  })
  @IsNotEmpty()
  content: Prisma.InputJsonValue;
  @ApiProperty({
    enum: ContentType,
    enumName: 'ContentType',
  })
  @IsNotEmpty()
  @IsEnum(ContentType)
  contentType: ContentType;
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
