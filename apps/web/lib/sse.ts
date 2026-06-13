import type { ChatEvent } from './types';

function parseBlock(block: string): ChatEvent | null {
  const line = block.split('\n').find((l) => l.startsWith('data:'));
  if (!line) {
    return null;
  }
  const json = line.slice('data:'.length).trim();
  return json ? (JSON.parse(json) as ChatEvent) : null;
}

/** Parses a `data: {...}\n\n` SSE stream into typed chat events. */
export async function* parseSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';
      for (const block of blocks) {
        const event = parseBlock(block);
        if (event) {
          yield event;
        }
      }
    }
  } finally {
    // Release the lock if the consumer abandons the generator (unmount / abort).
    reader.releaseLock();
  }
}
