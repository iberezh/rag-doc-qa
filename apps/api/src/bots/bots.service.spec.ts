import { NotFoundException } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { BillingService } from '../billing/billing.service';
import { BotsRepository } from './bots.repository';
import { BotsService } from './bots.service';

function buildBot(overrides: Partial<Bot> = {}): Bot {
  return {
    id: 'b1',
    accountId: 'a1',
    name: 'Docs bot',
    publicKey: 'pub_abc',
    allowedDomains: [],
    greeting: 'Hi',
    color: '#c0492c',
    showBadge: true,
    createdAt: new Date(),
    ...overrides,
  };
}

function buildService() {
  const repo = mockDeep<BotsRepository>();
  const billing = mockDeep<BillingService>();
  return { repo, billing, service: new BotsService(repo, billing) };
}

describe('BotsService', () => {
  it('create mints a public key and persists under the account', async () => {
    const { repo, service } = buildService();
    repo.create.mockResolvedValue(buildBot());

    await service.create('a1', { name: 'Docs bot' });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'a1',
        name: 'Docs bot',
        publicKey: expect.stringMatching(/^pub_/),
      }),
    );
  });

  it('getOwned returns the bot when it belongs to the account', async () => {
    const { repo, service } = buildService();
    repo.findById.mockResolvedValue(buildBot({ accountId: 'a1' }));

    await expect(service.getOwned('a1', 'b1')).resolves.toMatchObject({ id: 'b1' });
  });

  it('getOwned rejects a bot owned by another account (no cross-tenant access)', async () => {
    const { repo, service } = buildService();
    repo.findById.mockResolvedValue(buildBot({ accountId: 'other' }));

    await expect(service.getOwned('a1', 'b1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('getOwned rejects an unknown bot', async () => {
    const { repo, service } = buildService();
    repo.findById.mockResolvedValue(null);

    await expect(service.getOwned('a1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove enforces ownership before deleting', async () => {
    const { repo, service } = buildService();
    repo.findById.mockResolvedValue(buildBot({ accountId: 'other' }));

    await expect(service.remove('a1', 'b1')).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
