import { Body, Controller, Post } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { SearchSchema, type SearchInput } from './schemas/search.schema';
import type { RetrievalResult } from './retrieval.types';

@Controller('search')
export class SearchController {
  constructor(private readonly retrieval: RetrievalService) {}

  @Post()
  search(@Body(new ZodValidationPipe(SearchSchema)) body: SearchInput): Promise<RetrievalResult> {
    return this.retrieval.retrieve(body.query, body.limit);
  }
}
