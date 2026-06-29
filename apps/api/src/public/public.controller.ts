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
import type { Bot } from '@prisma/client';
import type { Request, Response } from 'express';
import { BillingService } from '../billing/billing.service';
import { limitsFor } from '../billing/plans';
import { BotsService } from '../bots/bots.service';
import { ChatService } from '../chat/chat.service';
import { MESSAGE_LIMIT_MESSAGE, isNonAnswer } from '../chat/chat.constants';
import { ChatSchema, type ChatInput } from '../chat/schemas/chat.schema';
import { ConversationsService } from '../conversations/conversations.service';
import { LeadSchema, type LeadInput } from '../conversations/schemas/lead.schema';
import type { RetrievedChunk } from '../documents/documents.types';
import { isConfident } from '../retrieval/confidence';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { hostAllowed } from './host';

interface PublicBotConfig {
  name: string;
  greeting: string;
  color: string;
  showBadge: boolean;
}

// A `type` (not interface) so it stays assignable to Prisma's InputJsonValue index signature.
type CitationRecord = { filename: string; chunkIndex: number };

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const sse = (data: unknown): string => `data: ${JSON.stringify(data)}\n\n`;

const slimCitations = (sources: RetrievedChunk[]): CitationRecord[] =>
  sources.map((source) => ({ filename: source.filename, chunkIndex: source.chunkIndex }));

function startSse(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
}

// Unauthenticated, rate-limited endpoints the embeddable widget calls from customer sites.
@Controller('public/bots/:publicKey')
@UseGuards(ThrottlerGuard)
export class PublicController {
  constructor(
    private readonly bots: BotsService,
    private readonly chat: ChatService,
    private readonly conversations: ConversationsService,
    private readonly billing: BillingService,
  ) {}

  // Public display config (no secrets). The "Powered by" badge can only be hidden on a paid plan.
  @Get()
  async config(@Param('publicKey') publicKey: string): Promise<PublicBotConfig> {
    const bot = await this.bots.getByPublicKey(publicKey);
    const plan = await this.billing.accountPlan(bot.accountId);
    const showBadge = limitsFor(plan).badgeRemoval ? bot.showBadge : true;
    return { name: bot.name, greeting: bot.greeting, color: bot.color, showBadge };
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

    startSse(res);
    if (!(await this.billing.consumeMessage(bot.accountId))) {
      res.write(sse({ type: 'token', text: MESSAGE_LIMIT_MESSAGE }));
      res.write(sse({ type: 'done', answered: false }));
      res.end();
      return;
    }
    await this.streamAnswer(res, bot, body.query);
  }

  private async streamAnswer(res: Response, bot: Bot, query: string): Promise<void> {
    const { id: conversationId } = await this.conversations.start(bot.id, query);
    res.write(sse({ type: 'conversation', conversationId }));
    let answer = '';
    let sources: RetrievedChunk[] = [];
    try {
      for await (const event of this.chat.streamAnswer(bot.id, query)) {
        if (event.type === 'sources') sources = event.sources;
        if (event.type === 'token') answer += event.text;
        if (event.type !== 'done') res.write(sse(event));
      }
      // Confident retrieval alone isn't enough: the model can still reply "not enough
      // information" on a near-miss chunk. Count that as unanswered so analytics are honest.
      const answered = isConfident(sources) && !isNonAnswer(answer);
      await this.conversations.complete({ conversationId, answer, citations: slimCitations(sources), answered });
      res.write(sse({ type: 'done', answered }));
    } catch {
      res.write(sse({ type: 'error', message: 'Generation failed' }));
    } finally {
      res.end();
    }
  }

  // No origin gate here: conversationId is an unguessable capability minted only by the
  // origin-checked chat endpoint, and captureEmail is already scoped to {conversationId, botId}.
  @Post('lead')
  @HttpCode(HttpStatus.OK)
  async lead(
    @Param('publicKey') publicKey: string,
    @Body(new ZodValidationPipe(LeadSchema)) body: LeadInput,
  ): Promise<{ ok: true }> {
    const bot = await this.bots.getByPublicKey(publicKey);
    const captured = await this.conversations.captureEmail(bot.id, body.conversationId, body.email);
    if (!captured) {
      throw new NotFoundException('Conversation not found');
    }
    return { ok: true };
  }
}
