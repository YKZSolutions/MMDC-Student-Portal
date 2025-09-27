import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray } from 'class-validator';

export class CreateDiscussionPostDto {
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  content: Prisma.InputJsonValue;
}
