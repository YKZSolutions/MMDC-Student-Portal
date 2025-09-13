import { ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';

export class ModuleSectionProgress {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
  moduleSectionId: string;
  @ApiProperty({
    type: () => ModuleSection,
    required: false,
  })
  moduleSection?: ModuleSectionAsType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
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
