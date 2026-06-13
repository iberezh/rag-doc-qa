import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('hashes a password into something other than the plaintext', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(hash).not.toBe('s3cret-pass');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('s3cret-pass');
    await expect(verifyPassword('s3cret-pass', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('s3cret-pass');
    await expect(verifyPassword('wrong-pass', hash)).resolves.toBe(false);
  });
});
