/** DI token for the active chat model (Groq when a key is set, mock otherwise). */
export const CHAT_MODEL = Symbol('CHAT_MODEL');

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatModel {
  /** Yields answer token deltas as they are generated. */
  stream(messages: ChatMessage[]): AsyncIterable<string>;
}
