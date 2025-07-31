import { Role } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  UserAccount,
  type UserAccount as UserAccountAsType,
} from './userAccount.entity';
import {
  UserDetails,
  type UserDetails as UserDetailsAsType,
} from './userDetails.entity';

export class User {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  userAccount?: UserAccountAsType | null;
  @ApiHideProperty()
  userDetails?: UserDetailsAsType | null;
  @ApiProperty({
    type: 'string',
  })
  firstName: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  middleName: string | null;
  @ApiProperty({
    type: 'string',
  })
  lastName: string;
  @ApiProperty({
    enum: Role,
    enumName: 'Role',
  })
  role: Role;
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
