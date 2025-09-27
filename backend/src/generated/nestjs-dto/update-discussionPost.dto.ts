import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray } from 'class-validator';

export class UpdateDiscussionPostDto {
  @ApiProperty({
    type: () => Object,
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  content?: Prisma.InputJsonValue;
}
