import { Inject, Injectable } from '@nestjs/common';
import { isConfident } from '../retrieval/confidence';
import { RetrievalService } from '../retrieval/retrieval.service';
import { CHAT_MODEL, type ChatModel } from './chat-model';
import { buildMessages } from './prompt';
import { LOW_CONFIDENCE_MESSAGE } from './chat.constants';
import type { ChatEvent } from './chat.types';

@Injectable()
export class ChatService {
  constructor(
    private readonly retrieval: RetrievalService,
    @Inject(CHAT_MODEL) private readonly model: ChatModel,
  ) {}

  async *streamAnswer(botId: string, query: string): AsyncGenerator<ChatEvent> {
    const { sources, context } = await this.retrieval.retrieve(botId, query);
    yield { type: 'sources', sources };

    if (!isConfident(sources)) {
      yield { type: 'token', text: LOW_CONFIDENCE_MESSAGE };
      yield { type: 'done' };
      return;
    }

    for await (const token of this.model.stream(buildMessages(query, context))) {
      yield { type: 'token', text: token };
    }
    yield { type: 'done' };
  }
}
