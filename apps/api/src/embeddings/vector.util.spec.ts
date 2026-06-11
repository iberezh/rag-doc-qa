import { cosineSimilarity, magnitude, normalize } from './vector.util';

describe('vector.util', () => {
  it('normalize returns a unit-length vector', () => {
    const result = normalize([3, 4]);
    expect(magnitude(result)).toBeCloseTo(1, 6);
  });

  it('normalize leaves a zero vector unchanged', () => {
    expect(normalize([0, 0])).toEqual([0, 0]);
  });

  it('cosineSimilarity is 1 for identical direction', () => {
    expect(cosineSimilarity([1, 0], [2, 0])).toBeCloseTo(1, 6);
  });

  it('cosineSimilarity is 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 6);
  });
});
