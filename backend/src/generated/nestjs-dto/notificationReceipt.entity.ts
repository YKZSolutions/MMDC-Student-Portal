import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Notification,
  type Notification as NotificationAsType,
} from './notification.entity';
import { User, type User as UserAsType } from './user.entity';

export class NotificationReceipt {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  notificationId: string;
  @ApiProperty({
    type: () => Notification,
    required: false,
  })
  notification?: NotificationAsType;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiHideProperty()
  user?: UserAsType;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  content: string;
  @ApiProperty({
    type: 'boolean',
  })
  isRead: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}
