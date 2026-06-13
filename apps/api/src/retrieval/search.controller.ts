import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentAccount } from '../auth/current-account.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthContext } from '../auth/auth.types';
import { RetrievalService } from './retrieval.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { SearchSchema, type SearchInput } from './schemas/search.schema';
import type { RetrievalResult } from './retrieval.types';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly retrieval: RetrievalService) {}

  @Post()
  search(
    @CurrentAccount() { accountId }: AuthContext,
    @Body(new ZodValidationPipe(SearchSchema)) body: SearchInput,
  ): Promise<RetrievalResult> {
    return this.retrieval.retrieve(accountId, body.query, body.limit);
  }
}
