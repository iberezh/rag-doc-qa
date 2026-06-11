import { chunkText } from './chunker';

describe('chunkText', () => {
  it('returns an empty array for blank input', () => {
    expect(chunkText('   \n  ')).toEqual([]);
    expect(chunkText('')).toEqual([]);
  });

  it('returns a single chunk when text is shorter than the chunk size', () => {
    const result = chunkText('hello world', { size: 100, overlap: 10 });
    expect(result).toEqual(['hello world']);
  });

  it('splits long text into overlapping chunks', () => {
    const text = 'abcdefghij'; // length 10
    const result = chunkText(text, { size: 4, overlap: 2 });

    // step = 2 → starts at 0,2,4,6 → last chunk reaches the end
    expect(result).toEqual(['abcd', 'cdef', 'efgh', 'ghij']);
  });

  it('preserves overlap between consecutive chunks', () => {
    const result = chunkText('abcdefghij', { size: 4, overlap: 2 });
    const firstTail = result[0]?.slice(-2);
    const secondHead = result[1]?.slice(0, 2);
    expect(firstTail).toBe(secondHead);
  });

  it('does not emit a redundant trailing chunk', () => {
    const result = chunkText('abcdef', { size: 3, overlap: 1 });
    // step = 2 → 0,2,4 → 'abc','cde','ef'
    expect(result).toEqual(['abc', 'cde', 'ef']);
  });
});
