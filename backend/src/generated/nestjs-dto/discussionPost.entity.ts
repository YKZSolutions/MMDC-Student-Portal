import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  Discussion,
  type Discussion as DiscussionAsType,
} from './discussion.entity';
import { User, type User as UserAsType } from './user.entity';
import { IsArray } from 'class-validator';

export class DiscussionPost {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  discussionId: string;
  @ApiProperty({
    type: () => Discussion,
    required: false,
  })
  discussion?: DiscussionAsType;
  @ApiProperty({
    type: 'string',
  })
  authorId: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  author?: UserAsType;

  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  @IsArray()
  content: Prisma.JsonValue;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  parentId: string | null;
  @ApiProperty({
    type: () => DiscussionPost,
    required: false,
    nullable: true,
  })
  parent?: DiscussionPost | null;
  @ApiProperty({
    type: () => DiscussionPost,
    isArray: true,
    required: false,
  })
  replies?: DiscussionPost[];
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
