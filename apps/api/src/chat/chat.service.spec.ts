import { mockDeep } from 'jest-mock-extended';
import { ChatService } from './chat.service';
import { RetrievalService } from '../retrieval/retrieval.service';
import { MockChatModel } from './mock-chat.model';
import type { ChatEvent } from './chat.types';
import type { RetrievedChunk } from '../documents/documents.types';

async function collect(generator: AsyncGenerator<ChatEvent>): Promise<ChatEvent[]> {
  const events: ChatEvent[] = [];
  for await (const event of generator) {
    events.push(event);
  }
  return events;
}

describe('ChatService', () => {
  it('emits sources first, streams tokens, then done', async () => {
    const retrieval = mockDeep<RetrievalService>();
    const sources: RetrievedChunk[] = [
      { documentId: 'd', filename: 'a.txt', chunkIndex: 0, content: 'x', score: 0.9 },
    ];
    retrieval.retrieve.mockResolvedValue({ sources, context: '[1] (a.txt) x' });
    const service = new ChatService(retrieval, new MockChatModel());

    const events = await collect(service.streamAnswer('q'));

    expect(events[0]).toEqual({ type: 'sources', sources });
    expect(events.some((event) => event.type === 'token')).toBe(true);
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('returns a graceful message when nothing relevant is found', async () => {
    const retrieval = mockDeep<RetrievalService>();
    retrieval.retrieve.mockResolvedValue({ sources: [], context: '' });
    const service = new ChatService(retrieval, new MockChatModel());

    const events = await collect(service.streamAnswer('q'));

    expect(events[0]).toEqual({ type: 'sources', sources: [] });
    expect(events.some((event) => event.type === 'token')).toBe(true);
  });
});
