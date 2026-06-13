import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import type { AuthResult, JwtPayload, PublicProfile, UserWithAccount } from './auth.types';
import { hashPassword, verifyPassword } from './password';
import type { SignupInput } from './schemas/signup.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
  ) {}

  async signup(input: SignupInput): Promise<AuthResult> {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.createAccountWithUser({
      accountName: input.accountName,
      email: input.email,
      passwordHash,
    });
    return this.toAuthResult(user);
  }

  async validateUser(email: string, password: string): Promise<UserWithAccount> {
    const user = await this.repo.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  async profile(userId: string): Promise<PublicProfile> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return this.toProfile(user);
  }

  async toAuthResult(user: UserWithAccount): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, accountId: user.accountId };
    const token = await this.jwt.signAsync(payload);
    return { token, ...this.toProfile(user) };
  }

  private toProfile(user: UserWithAccount): PublicProfile {
    return {
      user: { id: user.id, email: user.email },
      account: { id: user.account.id, name: user.account.name, plan: user.account.plan },
    };
  }
}
