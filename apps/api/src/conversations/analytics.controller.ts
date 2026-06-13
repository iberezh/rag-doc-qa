import { Controller, Get, UseGuards } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BotOwnerGuard } from '../bots/guards/bot-owner.guard';
import { CurrentBot } from '../bots/current-bot.decorator';
import { ConversationsService } from './conversations.service';
import type { BotAnalytics } from './conversations.types';

@Controller('bots/:botId/analytics')
@UseGuards(JwtAuthGuard, BotOwnerGuard)
export class AnalyticsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  get(@CurrentBot() bot: Bot): Promise<BotAnalytics> {
    return this.conversations.analytics(bot.id);
  }
}
