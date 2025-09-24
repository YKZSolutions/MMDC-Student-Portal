import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SectionModuleDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  publishedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  toPublishAt: Date | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  classMeetings: Prisma.JsonValue | null;
}
