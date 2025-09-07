import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import { User, type User as UserAsType } from './user.entity';

export class ModuleSection {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  moduleId: string;
  @ApiProperty({
    type: () => Module,
    required: false,
  })
  module?: ModuleAsType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  parentSectionId: string | null;
  @ApiProperty({
    type: () => ModuleSection,
    required: false,
    nullable: true,
  })
  parentSection?: ModuleSection | null;
  @ApiProperty({
    type: () => ModuleSection,
    isArray: true,
    required: false,
  })
  subsections?: ModuleSection[];
  @ApiHideProperty()
  moduleContents?: ModuleContentAsType[];
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
    nullable: true,
  })
  publishedBy: string | null;
  @ApiProperty({
    type: () => User,
    required: false,
    nullable: true,
  })
  user?: UserAsType | null;
}
