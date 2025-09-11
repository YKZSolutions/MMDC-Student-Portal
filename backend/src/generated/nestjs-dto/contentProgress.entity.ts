import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import { Module, type Module as ModuleAsType } from './module.entity';

export class ContentProgress {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiHideProperty()
  user?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
  @ApiHideProperty()
  moduleContent?: ModuleContentAsType;
  @ApiProperty({
    type: 'string',
  })
  moduleId: string;
  @ApiHideProperty()
  module?: ModuleAsType;
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
}
