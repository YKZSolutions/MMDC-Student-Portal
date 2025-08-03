import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '@supabase/supabase-js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user }: { user: User } = context.switchToHttp().getRequest();

    const userRoles = user.user_metadata.role as Role[];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole)
      throw new ForbiddenException(
        "You don't have the necessary role to access this resource",
      );

    return true;
  }
}
