import { generatePublicKey } from './public-key';

describe('generatePublicKey', () => {
  it('produces a prefixed, url-safe key', () => {
    const key = generatePublicKey();
    expect(key.startsWith('pub_')).toBe(true);
    expect(key.length).toBeGreaterThan(20);
    expect(key).toMatch(/^pub_[A-Za-z0-9_-]+$/);
  });

  it('produces a different key each time', () => {
    expect(generatePublicKey()).not.toBe(generatePublicKey());
  });
});
