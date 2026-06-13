import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UserWithAccount } from './auth.types';

export interface CreateAccountUser {
  accountName: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserWithAccount | null> {
    return this.prisma.user.findUnique({ where: { email }, include: { account: true } });
  }

  findUserById(id: string): Promise<UserWithAccount | null> {
    return this.prisma.user.findUnique({ where: { id }, include: { account: true } });
  }

  /** Creates the tenant and its first user in one insert. */
  createAccountWithUser(input: CreateAccountUser): Promise<UserWithAccount> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        account: { create: { name: input.accountName } },
      },
      include: { account: true },
    });
  }
}
