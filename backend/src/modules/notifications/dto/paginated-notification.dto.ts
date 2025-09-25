import { PaginatedDto } from '@/common/dto/paginated.dto';
import { NotificationDto } from '@/generated/nestjs-dto/notification.dto';
import { OmitType } from '@nestjs/swagger';

export class NotificationItemDto extends OmitType(NotificationDto, [
  'deletedAt',
] as const) {
  userId?: string;
  isRead: boolean;
}

export class PaginatedNotificationDto extends PaginatedDto {
  notifications: NotificationItemDto[];
}
