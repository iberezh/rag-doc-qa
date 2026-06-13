import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = (plain: string): Promise<string> => hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hashed: string): Promise<boolean> =>
  compare(plain, hashed);
