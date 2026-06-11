export function magnitude(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

export function normalize(vector: number[]): number[] {
  const length = magnitude(vector);
  if (length === 0) {
    return vector;
  }
  return vector.map((value) => value / length);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, value, i) => sum + value * (b[i] ?? 0), 0);
  const denominator = magnitude(a) * magnitude(b);
  return denominator === 0 ? 0 : dot / denominator;
}
