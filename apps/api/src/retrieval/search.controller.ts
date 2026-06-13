import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BotOwnerGuard } from '../bots/guards/bot-owner.guard';
import { CurrentBot } from '../bots/current-bot.decorator';
import { RetrievalService } from './retrieval.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { SearchSchema, type SearchInput } from './schemas/search.schema';
import type { RetrievalResult } from './retrieval.types';

@Controller('bots/:botId/search')
@UseGuards(JwtAuthGuard, BotOwnerGuard)
export class SearchController {
  constructor(private readonly retrieval: RetrievalService) {}

  @Post()
  search(
    @CurrentBot() bot: Bot,
    @Body(new ZodValidationPipe(SearchSchema)) body: SearchInput,
  ): Promise<RetrievalResult> {
    return this.retrieval.retrieve(bot.id, body.query, body.limit);
  }
}
