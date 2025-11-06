import {
  Controller,
  Get,
  Param,
  Sse,
  MessageEvent,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { filter, map, Observable } from 'rxjs';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { NotificationMarkRead } from './dto/notification-mark-read.dto';
import { FilterNotificationDto } from './dto/filter-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Subscribe to server-sent notifications
   * @remarks This endpoint provides a real-time stream of notifications for the authenticated user via Server-Sent Events (SSE).
   */
  @Sse('subscribe')
  async subscribe(
    @CurrentUser() currentUser: CurrentAuthUser,
  ): Promise<Observable<MessageEvent>> {
    const { role, user_id } = currentUser.user_metadata;

    return this.notificationsService.subscribe().pipe(
      filter((event) => {
        const data = event.data;

        return (
          data.userId === user_id ||
          data.role.includes(role) ||
          (!data.userId && !data.role)
        );
      }),
      map((event) => ({
        data: JSON.stringify(event.data),
      })),
    );
  }

  /**
   * Get notification counts
   * @remarks This operation returns the total, read, and unread notification counts for the authenticated user.
   */
  @Get('count')
  getCount(@CurrentUser() currentUser: CurrentAuthUser) {
    const { user_id, role } = currentUser.user_metadata;

    return this.notificationsService.getCount(user_id, role);
  }

  /**
   * Fetch notifications
   * @remarks This operation retrieves a paginated list of notifications for the authenticated user, with optional filtering.
   */
  @Get()
  findAll(
    @Query() filters: FilterNotificationDto,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id, role } = currentUser.user_metadata;

    return this.notificationsService.findAll(filters, user_id, role);
  }

  /**
   * Fetch a single notification
   * @remarks This operation retrieves a specific notification by its ID, ensuring it is accessible to the authenticated user.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id, role } = currentUser.user_metadata;

    return this.notificationsService.findOne(id, user_id, role);
  }

  /**
   * Mark notifications as read
   * @remarks This operation marks a list of specified notifications as read for the authenticated user.
   */
  @Post('mark-read')
  markAsRead(
    @Body() notificationMarkRead: NotificationMarkRead,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id } = currentUser.user_metadata;

    return this.notificationsService.markAsRead(
      notificationMarkRead.notificationIds,
      user_id,
    );
  }

  /**
   * Mark all notifications as read
   * @remarks This operation marks all notifications as read for the authenticated user.
   */
  @Post('mark-read/all')
  markAllAsRead(@CurrentUser() currentUser: CurrentAuthUser) {
    const { user_id, role } = currentUser.user_metadata;

    return this.notificationsService.markAllAsRead(user_id, role);
  }
}
