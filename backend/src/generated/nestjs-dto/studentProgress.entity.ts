import { ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  ModuleContent,
  type ModuleContent as ModuleContentAsType,
} from './moduleContent.entity';
import { Module, type Module as ModuleAsType } from './module.entity';

export class StudentProgress {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'boolean',
  })
  completed: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  progress: number;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  moduleContentId: string;
  @ApiProperty({
    type: () => ModuleContent,
    required: false,
  })
  moduleContent?: ModuleContentAsType;
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
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
