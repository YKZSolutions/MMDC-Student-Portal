import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateDiscussionPostDto {
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  content?: Prisma.InputJsonValue;
}
