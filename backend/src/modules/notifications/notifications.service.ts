import {
  Inject,
  Injectable,
  MessageEvent,
  NotFoundException,
} from '@nestjs/common';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { Prisma, Role } from '@prisma/client';
import { Observable, Subject } from 'rxjs';
import {
  NotificationItemDto,
  PaginatedNotificationDto,
} from './dto/paginated-notification.dto';
import { NotificationCountDto } from './dto/notification-count.dto';
import {
  FilterNotificationDto,
  NotificationType,
} from './dto/filter-notification.dto';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';

export interface NotificationMessageEvent<T extends object>
  extends MessageEvent {
  data: T;
}

@Injectable()
export class NotificationsService {
  private events$ = new Subject<
    NotificationMessageEvent<NotificationItemDto>
  >();

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  /**
   * Subscribes to the server-sent events for real-time notifications.
   *
   * @returns An Observable of `NotificationMessageEvent` objects.
   */
  subscribe(): Observable<NotificationMessageEvent<NotificationItemDto>> {
    return this.events$.asObservable();
  }

  /**
   * Creates a notification for a specific user and sends it as an SSE.
   *
   * @param userId - The ID of the user to notify.
   * @param title - The title of the notification.
   * @param content - The content of the notification.
   * @returns The created notification object.
   * @throws NotFoundException - If the user with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ userId, title }) =>
      `Creating notification for user ${userId} with title: "${title}"`,
    logSuccessMessage: (result) =>
      `Successfully notified user ${result.userId} with ID: ${result.id}`,
    logErrorMessage: (err, { userId }) =>
      `Failed to notify user ${userId}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { userId }) =>
      new NotFoundException(`User with ID ${userId} was not found.`),
  })
  async notifyUser(
    @LogParam('userId') userId: string,
    @LogParam('title') title: string,
    content: string,
  ) {
    const notification = await this.prisma.client.$transaction(async (tx) => {
      const notification = await tx.notification.create({
        data: {
          title,
          content,
        },
      });

      const receipt = await tx.notificationReceipt.create({
        data: {
          notificationId: notification.id,
          userId,
        },
      });

      return {
        ...notification,
        userId: receipt.userId,
        isRead: false,
      };
    });

    this.events$.next({
      data: notification,
    });

    return notification;
  }

  /**
   * Creates a notification for all users of a specific role.
   *
   * @param roles - An array of roles to notify.
   * @param title - The title of the notification.
   * @param content - The content of the notification.
   * @returns The created notification object.
   */
  @Log({
    logArgsMessage: ({ roles, title }) =>
      `Creating notification for roles ${roles.join(', ')} with title: "${title}"`,
    logSuccessMessage: (result) =>
      `Successfully notified roles with notification ID: ${result.id}`,
    logErrorMessage: (err, { roles }) =>
      `Failed to notify roles ${roles.join(', ')}. Error: ${err.message}`,
  })
  async notifyRole(
    @LogParam('roles') roles: Role[],
    @LogParam('title') title: string,
    content: string,
  ) {
    return this.prisma.client.notification.create({
      data: {
        title,
        content,
        role: roles,
      },
    });
  }

  /**
   * Creates a general notification for all users regardless of role.
   *
   * @param title - The title of the notification.
   * @param content - The content of the notification.
   * @returns The created notification object.
   */
  @Log({
    logArgsMessage: ({ title }) =>
      `Creating notification for all users with title: "${title}"`,
    logSuccessMessage: (result) =>
      `Successfully notified all users with notification ID: ${result.id}`,
    logErrorMessage: (err) =>
      `Failed to notify all users. Error: ${err.message}`,
  })
  async notifyAll(@LogParam('title') title: string, content: string) {
    return this.prisma.client.notification.create({
      data: {
        title,
        content,
        role: ['admin', 'mentor', 'student'],
      },
    });
  }

  /**
   * Retrieves a paginated list of notifications for a specific user.
   *
   * @param filters - The filter and pagination options for the query.
   * @param userId - The ID of the user.
   * @param role - The role of the user.
   * @returns A paginated list of notifications.
   */
  @Log({
    logArgsMessage: ({ filters, userId, role }) =>
      `Fetching notifications for user ${userId} (${role}) with filters: ${JSON.stringify(
        filters,
      )}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.meta.totalCount} notifications for user.`,
    logErrorMessage: (err, { userId }) =>
      `Failed to fetch notifications for user ${userId}. Error: ${err.message}`,
  })
  async findAll(
    @LogParam('filters') filters: FilterNotificationDto,
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
  ): Promise<PaginatedNotificationDto> {
    const where: Prisma.NotificationWhereInput = {};
    const page = filters.page || 1;

    where.OR = [
      { receipts: { some: { userId } } },
      { role: { has: role } },
      { role: { hasEvery: ['admin', 'mentor', 'student'] } },
    ];

    if (filters.type) {
      const isRead = filters.type === NotificationType.READ;

      where.AND = [{ receipts: { some: { isRead } } }];
    }

    const [paginated, meta] = await this.prisma.client.notification
      .paginate({
        where,
        include: {
          receipts: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({ limit: 10, page, includePageCount: true });

    const notifications: NotificationItemDto[] = paginated.map((item) => {
      const { receipts, ...notification } = item;

      return {
        id: notification.id,
        title: notification.title,
        content: notification.content,
        userId: receipts.length > 0 ? receipts[0].userId : undefined,
        role: notification.role,
        isRead: receipts.length > 0 ? receipts[0].isRead : false,
        createdAt: notification.createdAt,
      };
    });

    return { notifications, meta };
  }

  /**
   * Retrieves a single notification by its ID.
   *
   * @param id - The ID of the notification to retrieve.
   * @param userId - The ID of the user attempting to access the notification.
   * @param role - The role of the user attempting to access the notification.
   * @returns The notification object if found.
   * @throws NotFoundException - If the notification with the specified ID is not found or the user is not authorized to view it.
   */
  @Log({
    logArgsMessage: ({ id, userId }) =>
      `Fetching notification with ID ${id} for user ${userId}`,
    logSuccessMessage: (result) =>
      `Successfully fetched notification with ID: ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to fetch notification with ID ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Notification with ID ${id} was not found.`),
  })
  async findOne(
    @LogParam('id') id: string,
    @LogParam('userId') userId: string,
    role: Role,
  ): Promise<NotificationItemDto> {
    const item = await this.prisma.client.notification.findFirstOrThrow({
      where: {
        id,
        OR: [
          { receipts: { some: { userId } } },
          { role: { has: role } },
          { role: { hasEvery: ['admin', 'mentor', 'student'] } },
        ],
      },
      include: {
        receipts: {
          where: {
            userId,
          },
        },
      },
    });

    const { receipts, ...notification } = item;

    return {
      id: notification.id,
      title: notification.title,
      content: notification.content,
      userId: receipts.length > 0 ? receipts[0].userId : undefined,
      role: notification.role,
      isRead: receipts.length > 0 ? receipts[0].isRead : false,
      createdAt: notification.createdAt,
    };
  }

  /**
   * Marks a list of notifications as read for a specific user.
   *
   * @param notificationIds - An array of notification IDs to mark as read.
   * @param userId - The ID of the user.
   * @returns Void.
   */
  @Log({
    logArgsMessage: ({ notificationIds, userId }) =>
      `Marking notifications ${notificationIds.join(', ')} as read for user ${userId}`,
    logSuccessMessage: () => 'Successfully marked notifications as read',
    logErrorMessage: (err, { userId }) =>
      `Failed to mark notifications as read for user ${userId}. Error: ${err.message}`,
  })
  async markAsRead(
    @LogParam('notificationIds') notificationIds: string[],
    @LogParam('userId') userId: string,
  ) {
    await this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.notificationReceipt.findMany({
        where: { notificationId: { in: notificationIds }, userId },
        select: { notificationId: true },
      });

      const existingIds = existing.map((r) => r.notificationId);

      await tx.notificationReceipt.updateMany({
        where: { userId, notificationId: { in: existingIds } },
        data: { isRead: true },
      });

      const toCreate = notificationIds
        .filter((id) => !existingIds.includes(id))
        .map((id) => ({
          userId,
          notificationId: id,
          isRead: true,
        }));

      if (toCreate.length > 0) {
        await tx.notificationReceipt.createMany({ data: toCreate });
      }
    });
  }

  /**
   * Marks all notifications as read for a specific user.
   *
   * @param userId - The ID of the user.
   * @returns Void.
   */
  @Log({
    logArgsMessage: ({ userId }) =>
      `Marking all notifications as read for user ${userId}`,
    logSuccessMessage: () => 'Successfully marked all notifications as read',
    logErrorMessage: (err, { userId }) =>
      `Failed to mark all notifications as read for user ${userId}. Error: ${err.message}`,
  })
  async markAllAsRead(@LogParam('userId') userId: string) {
    await this.prisma.client.$transaction(async (tx) => {
      const allNotificationIds = await tx.notification.findMany({
        select: { id: true },
      });
      const notificationIds = allNotificationIds.map((n) => n.id);

      const existing = await tx.notificationReceipt.findMany({
        where: { userId },
        select: { notificationId: true },
      });
      const existingIds = existing.map((r) => r.notificationId);

      if (existingIds.length > 0) {
        await tx.notificationReceipt.updateMany({
          where: { userId, notificationId: { in: existingIds } },
          data: { isRead: true },
        });
      }

      const toCreate = notificationIds
        .filter((id) => !existingIds.includes(id))
        .map((id) => ({
          userId,
          notificationId: id,
          isRead: true,
        }));

      if (toCreate.length > 0) {
        await tx.notificationReceipt.createMany({ data: toCreate });
      }
    });
  }

  /**
   * Retrieves the total count of notifications and the number of read/unread notifications for a user.
   *
   * @param userId - The ID of the user.
   * @param role - The role of the user.
   * @returns An object with total, read, and unread notification counts.
   */
  @Log({
    logArgsMessage: ({ userId, role }) =>
      `Getting notification counts for user ${userId} (${role})`,
    logSuccessMessage: (result) =>
      `Successfully retrieved notification counts: Total=${result.total}, Read=${result.read}, Unread=${result.unread}`,
    logErrorMessage: (err, { userId }) =>
      `Failed to get notification counts for user ${userId}. Error: ${err.message}`,
  })
  async getCount(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
  ): Promise<NotificationCountDto> {
    const directTotal = await this.prisma.client.notificationReceipt.count({
      where: { userId },
    });

    const roleTotal = await this.prisma.client.notification.count({
      where: {
        OR: [
          { role: { has: role } },
          { role: { hasEvery: ['admin', 'mentor', 'student'] } },
        ],
      },
    });

    const total = directTotal + roleTotal;

    const read = await this.prisma.client.notificationReceipt.count({
      where: { userId, isRead: true },
    });

    const unread = total - read;

    return { total, read, unread };
  }
}
