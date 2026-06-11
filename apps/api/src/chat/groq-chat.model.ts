import Groq from 'groq-sdk';
import type { ChatMessage, ChatModel } from './chat-model';
import { GROQ_MODEL, GROQ_TEMPERATURE } from './chat.constants';

/** Streams a real answer from a Groq-hosted LLM (OpenAI-compatible API). */
export class GroqChatModel implements ChatModel {
  private readonly client: Groq;

  constructor(
    apiKey: string,
    private readonly model: string = GROQ_MODEL,
  ) {
    this.client = new Groq({ apiKey });
  }

  async *stream(messages: ChatMessage[]): AsyncIterable<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: GROQ_TEMPERATURE,
      stream: true,
    });

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}
