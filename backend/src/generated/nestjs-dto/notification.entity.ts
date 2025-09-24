import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationReceipt,
  type NotificationReceipt as NotificationReceiptAsType,
} from './notificationReceipt.entity';

export class Notification {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => NotificationReceipt,
    isArray: true,
    required: false,
  })
  receipts?: NotificationReceiptAsType[];
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  content: string;
  @ApiProperty({
    isArray: true,
    enum: Role,
    enumName: 'Role',
  })
  role: Role[];
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
