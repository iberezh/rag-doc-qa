import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Bot } from '@prisma/client';
import type { Request } from 'express';
import type { AuthContext } from '../../auth/auth.types';
import { BotsService } from '../bots.service';

interface BotRequest extends Request {
  user?: AuthContext;
  bot?: Bot;
}

/** Resolves :botId, asserts the authenticated account owns it, and attaches it as req.bot. */
@Injectable()
export class BotOwnerGuard implements CanActivate {
  constructor(private readonly bots: BotsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<BotRequest>();
    const accountId = req.user?.accountId;
    if (!accountId) {
      throw new UnauthorizedException();
    }
    const botId = req.params.botId;
    if (typeof botId !== 'string') {
      throw new BadRequestException('Missing bot id');
    }
    req.bot = await this.bots.getOwned(accountId, botId);
    return true;
  }
}
