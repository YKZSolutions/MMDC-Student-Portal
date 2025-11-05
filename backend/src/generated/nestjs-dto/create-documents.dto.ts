import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentsDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  metadata: Prisma.InputJsonValue;
}
