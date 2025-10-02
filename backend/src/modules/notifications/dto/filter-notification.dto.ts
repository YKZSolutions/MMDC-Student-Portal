import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum NotificationType {
  READ = 'read',
  UNREAD = 'unread',
}

export class FilterNotificationDto extends BaseFilterDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
