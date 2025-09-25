import { ApiProperty } from '@nestjs/swagger';
import { Group, type Group as GroupAsType } from './group.entity';
import { User, type User as UserAsType } from './user.entity';

export class GroupMember {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  groupId: string;
  @ApiProperty({
    type: () => Group,
    required: false,
  })
  group?: GroupAsType;
  @ApiProperty({
    type: 'string',
  })
  studentId: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: UserAsType;
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
