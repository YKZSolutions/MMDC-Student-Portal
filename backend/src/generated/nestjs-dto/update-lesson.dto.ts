import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateLessonDto {
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
}
