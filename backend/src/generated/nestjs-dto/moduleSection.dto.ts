import { ApiProperty } from '@nestjs/swagger';

export class ModuleSectionDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'boolean',
  })
  isPublished: boolean;
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
}
