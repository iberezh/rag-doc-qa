import { randomBytes } from 'node:crypto';

const KEY_PREFIX = 'pub_';
const KEY_BYTES = 18;

/** A url-safe public key embedded in widget snippets; opaque, not a secret on its own. */
export const generatePublicKey = (): string =>
  `${KEY_PREFIX}${randomBytes(KEY_BYTES).toString('base64url')}`;
