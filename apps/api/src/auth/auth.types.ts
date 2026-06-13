import type { Account, User } from '@prisma/client';

export type UserWithAccount = User & { account: Account };

/** JWT body. `sub` is the user id; `accountId` is carried so guards never hit the DB. */
export interface JwtPayload {
  sub: string;
  accountId: string;
}

/** What the JWT strategy attaches to the request and `@CurrentAccount()` exposes. */
export interface AuthContext {
  userId: string;
  accountId: string;
}

export interface PublicProfile {
  user: { id: string; email: string };
  account: { id: string; name: string; plan: Account['plan'] };
}

export interface AuthResult extends PublicProfile {
  token: string;
}
