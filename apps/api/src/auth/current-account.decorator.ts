import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthContext } from './auth.types';

/** Exposes the `{ userId, accountId }` the JWT strategy attached to the request. */
export const CurrentAccount = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthContext }>();
    return request.user;
  },
);
