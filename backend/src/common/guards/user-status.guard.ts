import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserAccountStatus } from '../interfaces/auth.user-metadata';
import { IS_STATUS_BYPASS } from '../decorators/user-status.decorator';
import { Request } from 'express';

@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const statusBypass = this.reflector.getAllAndOverride<UserAccountStatus>(
      IS_STATUS_BYPASS,
      [context.getHandler(), context.getClass()],
    );

    if (statusBypass) return true;

    const { user } = context.switchToHttp().getRequest<Request>();

    if (!user) throw new UnauthorizedException('User data not found');

    const userStatus = user.user_metadata.status;

    if (userStatus === 'disabled')
      throw new ForbiddenException(
        "You're account is disabled, please contact your administrator for inqiuries",
      );

    if (userStatus === 'deleted')
      throw new ForbiddenException(
        "You're account is deleted, please contact your administrator for inqiuries",
      );

    return true;
  }
}
