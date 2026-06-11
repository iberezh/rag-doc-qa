import { FakeEmbedder } from './fake.embedder';
import { EMBEDDING_DIMENSION } from './embedder';
import { magnitude } from './vector.util';

describe('FakeEmbedder', () => {
  const embedder = new FakeEmbedder();

  it('produces one normalized vector of the right dimension per text', async () => {
    const [vector] = await embedder.embed(['hello']);
    expect(vector).toHaveLength(EMBEDDING_DIMENSION);
    expect(magnitude(vector ?? [])).toBeCloseTo(1, 6);
  });

  it('is deterministic for the same input', async () => {
    const [a] = await embedder.embed(['repeatable']);
    const [b] = await embedder.embed(['repeatable']);
    expect(a).toEqual(b);
  });

  it('produces different vectors for different inputs', async () => {
    const [a] = await embedder.embed(['alpha']);
    const [b] = await embedder.embed(['beta']);
    expect(a).not.toEqual(b);
  });
});
