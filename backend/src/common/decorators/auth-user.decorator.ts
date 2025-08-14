import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common/decorators';
import { Request } from 'express';
import { UserMetadata } from '../interfaces/auth.user-metadata';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) throw new BadRequestException('User not found');

    const metadata = request.user.user_metadata;

    const requiredKeys: (keyof UserMetadata)[] = ['role', 'status', 'user_id'];
    requiredKeys.forEach((key) => {
      if (!metadata[key]) {
        throw new BadRequestException(`The user's ${key} is missing`);
      }
    });

    return request.user;
  },
);
