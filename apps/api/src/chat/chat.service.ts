import { Inject, Injectable } from '@nestjs/common';
import { RetrievalService } from '../retrieval/retrieval.service';
import { CHAT_MODEL, type ChatModel } from './chat-model';
import { buildMessages } from './prompt';
import { NO_CONTEXT_MESSAGE } from './chat.constants';
import type { ChatEvent } from './chat.types';

@Injectable()
export class ChatService {
  constructor(
    private readonly retrieval: RetrievalService,
    @Inject(CHAT_MODEL) private readonly model: ChatModel,
  ) {}

  async *streamAnswer(query: string): AsyncGenerator<ChatEvent> {
    const { sources, context } = await this.retrieval.retrieve(query);
    yield { type: 'sources', sources };

    if (sources.length === 0) {
      yield { type: 'token', text: NO_CONTEXT_MESSAGE };
      yield { type: 'done' };
      return;
    }

    for await (const token of this.model.stream(buildMessages(query, context))) {
      yield { type: 'token', text: token };
    }
    yield { type: 'done' };
  }
}
