import { assembleContext } from './context';
import type { RetrievedChunk } from '../documents/documents.types';

function chunk(filename: string, content: string): RetrievedChunk {
  return { documentId: 'd', filename, chunkIndex: 0, content, score: 1 };
}

describe('assembleContext', () => {
  it('numbers sources with citation markers', () => {
    const context = assembleContext([chunk('a.txt', 'hello'), chunk('b.txt', 'world')]);
    expect(context).toContain('[1] (a.txt) hello');
    expect(context).toContain('[2] (b.txt) world');
  });

  it('returns an empty string when there are no sources', () => {
    expect(assembleContext([])).toBe('');
  });

  it('stops including sources once the budget is exceeded', () => {
    const big = 'x'.repeat(50);
    const context = assembleContext([chunk('a', big), chunk('b', big)], 60);
    expect(context).toContain('[1]');
    expect(context).not.toContain('[2]');
  });
});
