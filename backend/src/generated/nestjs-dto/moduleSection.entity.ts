import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';

export class ModuleSection {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  moduleId: string;
  @ApiHideProperty()
  module?: ModuleAsType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  parentSectionId: string | null;
  @ApiHideProperty()
  parentSection?: ModuleSection | null;
  @ApiHideProperty()
  subsections?: ModuleSection[];
  @ApiHideProperty()
  moduleContents?: ModuleContentAsType[];
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  order: number;
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
