import type { RetrievedChunk } from '../documents/documents.types';
import { CONFIDENCE_THRESHOLD, isConfident } from './confidence';

const chunk = (score: number): RetrievedChunk => ({
  documentId: 'd',
  filename: 'f.txt',
  chunkIndex: 0,
  content: 'c',
  score,
});

describe('isConfident', () => {
  it('is false when there are no sources', () => {
    expect(isConfident([])).toBe(false);
  });

  it('is true when the top score clears the threshold', () => {
    expect(isConfident([chunk(0.9), chunk(0.2)])).toBe(true);
  });

  it('is false when the top score is below the threshold', () => {
    expect(isConfident([chunk(0.1)])).toBe(false);
  });

  it('is true at exactly the threshold (inclusive)', () => {
    expect(isConfident([chunk(CONFIDENCE_THRESHOLD)])).toBe(true);
  });
});
