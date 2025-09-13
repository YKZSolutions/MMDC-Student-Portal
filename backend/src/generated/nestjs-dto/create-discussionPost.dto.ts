import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateDiscussionPostDto {
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  content: Prisma.InputJsonValue;
}
