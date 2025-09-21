import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  subtitle: string | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  content: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
  })
  url: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  duration: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  transcript: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}
