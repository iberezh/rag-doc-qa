import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Plan } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import type { UserWithAccount } from './auth.types';
import { hashPassword } from './password';

function buildUser(overrides: Partial<UserWithAccount> = {}): UserWithAccount {
  return {
    id: 'u1',
    accountId: 'a1',
    email: 'owner@acme.com',
    passwordHash: 'hash',
    createdAt: new Date(),
    account: { id: 'a1', name: 'Acme', plan: Plan.FREE, createdAt: new Date() },
    ...overrides,
  };
}

function buildService() {
  const repo = mockDeep<AuthRepository>();
  const jwt = mockDeep<JwtService>();
  jwt.signAsync.mockResolvedValue('signed-token');
  return { repo, jwt, service: new AuthService(repo, jwt) };
}

describe('AuthService', () => {
  it('signup creates an account + user and returns a token + profile', async () => {
    const { repo, service } = buildService();
    repo.findUserByEmail.mockResolvedValue(null);
    repo.createAccountWithUser.mockResolvedValue(buildUser());

    const result = await service.signup({
      accountName: 'Acme',
      email: 'owner@acme.com',
      password: 'longpassword',
    });

    expect(repo.createAccountWithUser).toHaveBeenCalledWith(
      expect.objectContaining({
        accountName: 'Acme',
        email: 'owner@acme.com',
        passwordHash: expect.not.stringContaining('longpassword'),
      }),
    );
    expect(result.token).toBe('signed-token');
    expect(result.account).toEqual({ id: 'a1', name: 'Acme', plan: Plan.FREE });
    expect(result.user).toEqual({ id: 'u1', email: 'owner@acme.com' });
  });

  it('signup rejects a duplicate email with 409', async () => {
    const { repo, service } = buildService();
    repo.findUserByEmail.mockResolvedValue(buildUser());

    await expect(
      service.signup({ accountName: 'Acme', email: 'owner@acme.com', password: 'longpassword' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.createAccountWithUser).not.toHaveBeenCalled();
  });

  it('validateUser returns the user when the password matches', async () => {
    const { repo, service } = buildService();
    const passwordHash = await hashPassword('longpassword');
    repo.findUserByEmail.mockResolvedValue(buildUser({ passwordHash }));

    const user = await service.validateUser('owner@acme.com', 'longpassword');

    expect(user.id).toBe('u1');
  });

  it('validateUser rejects a wrong password', async () => {
    const { repo, service } = buildService();
    const passwordHash = await hashPassword('longpassword');
    repo.findUserByEmail.mockResolvedValue(buildUser({ passwordHash }));

    await expect(service.validateUser('owner@acme.com', 'nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('validateUser rejects an unknown email', async () => {
    const { repo, service } = buildService();
    repo.findUserByEmail.mockResolvedValue(null);

    await expect(service.validateUser('ghost@acme.com', 'whatever')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
