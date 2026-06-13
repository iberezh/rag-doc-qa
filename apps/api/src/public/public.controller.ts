import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { BotsService } from '../bots/bots.service';
import { ChatService } from '../chat/chat.service';
import { ChatSchema, type ChatInput } from '../chat/schemas/chat.schema';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { hostAllowed } from './host';

interface PublicBotConfig {
  name: string;
  greeting: string;
  color: string;
  showBadge: boolean;
}

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Unauthenticated, rate-limited endpoints the embeddable widget calls from customer sites.
@Controller('public/bots/:publicKey')
@UseGuards(ThrottlerGuard)
export class PublicController {
  constructor(
    private readonly bots: BotsService,
    private readonly chat: ChatService,
  ) {}

  // Public display config (no secrets) — intentionally not origin-gated: the widget renders
  // these fields on customer sites, so they are already public.
  @Get()
  async config(@Param('publicKey') publicKey: string): Promise<PublicBotConfig> {
    const bot = await this.bots.getByPublicKey(publicKey);
    return { name: bot.name, greeting: bot.greeting, color: bot.color, showBadge: bot.showBadge };
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chatStream(
    @Req() req: Request,
    @Body(new ZodValidationPipe(ChatSchema)) body: ChatInput,
    @Res() res: Response,
  ): Promise<void> {
    const publicKey = asString(req.params.publicKey);
    if (!publicKey) {
      throw new NotFoundException('Bot not found');
    }
    const bot = await this.bots.getByPublicKey(publicKey);
    // The widget forwards its host page origin as ?o=; fall back to the Origin header.
    const candidate = asString(req.query.o) ?? asString(req.headers.origin);
    if (!hostAllowed(bot.allowedDomains, candidate)) {
      throw new ForbiddenException('This domain is not allowed to embed this bot');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
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
