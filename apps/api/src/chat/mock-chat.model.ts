import { Injectable } from '@nestjs/common';
import type { ChatModel } from './chat-model';

const MOCK_ANSWER =
  'Mock answer (no GROQ_API_KEY set): based on the retrieved context, the most relevant ' +
  'source is [1]. Set a Groq API key for a real, generated answer.';

/** Streams a fixed, citation-bearing answer so the flow works without a key (and in tests). */
@Injectable()
export class MockChatModel implements ChatModel {
  async *stream(): AsyncIterable<string> {
    for (const word of MOCK_ANSWER.split(' ')) {
      yield `${word} `;
    }
  }
}
