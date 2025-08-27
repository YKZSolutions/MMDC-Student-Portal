import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<Request>();

    if (!user) throw new UnauthorizedException('Role: User data not found');

    const userRoles = Array.isArray(user.user_metadata.role)
      ? user.user_metadata.role
      : [user.user_metadata.role];

    if (!userRoles)
      throw new UnauthorizedException('Role of the user is not found');

    const hasRole = requiredRoles.some((role) =>
      userRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase()),
    );
    if (!hasRole)
      throw new ForbiddenException(
        "You don't have the necessary role to access this resource",
      );

    return true;
  }
}
