import { hostAllowed } from './host';

describe('hostAllowed', () => {
  it('allows any origin when the allowlist is empty (open embedding)', () => {
    expect(hostAllowed([], 'https://anywhere.com')).toBe(true);
    expect(hostAllowed([], undefined)).toBe(true);
  });

  it('allows an origin whose hostname is on the list', () => {
    expect(hostAllowed(['example.com'], 'https://example.com')).toBe(true);
  });

  it('ignores port and path when matching', () => {
    expect(hostAllowed(['example.com'], 'http://example.com:3000')).toBe(true);
  });

  it('rejects an origin not on the list', () => {
    expect(hostAllowed(['example.com'], 'https://evil.com')).toBe(false);
  });

  it('matches exactly — a non-listed subdomain is rejected', () => {
    expect(hostAllowed(['example.com'], 'https://evil.example.com')).toBe(false);
  });

  it('rejects a missing origin when the list is non-empty', () => {
    expect(hostAllowed(['example.com'], undefined)).toBe(false);
    expect(hostAllowed(['example.com'], '')).toBe(false);
  });

  it('matches a bare hostname candidate (not just a full origin URL)', () => {
    expect(hostAllowed(['example.com'], 'example.com')).toBe(true);
  });
});
