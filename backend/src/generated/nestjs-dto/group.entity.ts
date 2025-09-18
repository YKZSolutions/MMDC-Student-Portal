import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Module, type Module as ModuleAsType } from './module.entity';
import {
  GroupMember,
  type GroupMember as GroupMemberAsType,
} from './groupMember.entity';
import {
  AssignmentSubmission,
  type AssignmentSubmission as AssignmentSubmissionAsType,
} from './assignmentSubmission.entity';

export class Group {
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
    type: 'integer',
    format: 'int32',
  })
  groupNumber: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  groupName: string | null;
  @ApiHideProperty()
  members?: GroupMemberAsType[];
  @ApiHideProperty()
  submissions?: AssignmentSubmissionAsType[];
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
