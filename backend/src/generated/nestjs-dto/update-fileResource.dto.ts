import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateFileResourceDto {
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
    nullable: true,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  content?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  url?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  path?: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  size?: number | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  mimeType?: string | null;
}
