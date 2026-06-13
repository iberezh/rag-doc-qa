import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import type { Request } from 'express';

/** Exposes the bot that BotOwnerGuard resolved and verified ownership of. */
export const CurrentBot = createParamDecorator((_data: unknown, ctx: ExecutionContext): Bot => {
  const req = ctx.switchToHttp().getRequest<Request & { bot: Bot }>();
  return req.bot;
});
