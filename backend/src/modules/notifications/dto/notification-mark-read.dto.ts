import { IsArray, IsUUID } from 'class-validator';

export class NotificationMarkRead {
  @IsArray()
  @IsUUID('4', { each: true })
  notificationIds: string[];
}
