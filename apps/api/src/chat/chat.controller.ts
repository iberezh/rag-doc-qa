import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from '../billing/billing.service';
import { BotOwnerGuard } from '../bots/guards/bot-owner.guard';
import { CurrentBot } from '../bots/current-bot.decorator';
import { ChatService } from './chat.service';
import { MESSAGE_LIMIT_MESSAGE } from './chat.constants';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { ChatSchema, type ChatInput } from './schemas/chat.schema';

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

@Controller('bots/:botId/chat')
@UseGuards(JwtAuthGuard, BotOwnerGuard)
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly billing: BillingService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async stream(
    @CurrentBot() bot: Bot,
    @Body(new ZodValidationPipe(ChatSchema)) body: ChatInput,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (!(await this.billing.consumeMessage(bot.accountId))) {
      res.write(sse({ type: 'token', text: MESSAGE_LIMIT_MESSAGE }));
      res.write(sse({ type: 'done' }));
      res.end();
      return;
    }
    try {
      for await (const event of this.chat.streamAnswer(bot.id, body.query)) {
        res.write(sse(event));
      }
    } catch {
      res.write(sse({ type: 'error', message: 'Generation failed' }));
    } finally {
      res.end();
    }
  }
}
