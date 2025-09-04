import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    type: () => ModuleContent,
    isArray: true,
    required: false,
  })
  moduleContents?: ModuleContentAsType[];
}
