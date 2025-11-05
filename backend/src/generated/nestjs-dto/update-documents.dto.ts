import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentsDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  metadata?: Prisma.InputJsonValue;
}
