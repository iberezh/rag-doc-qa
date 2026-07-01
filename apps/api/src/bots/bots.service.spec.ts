import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { BillingService } from '../billing/billing.service';
import { IconsService } from '../icons/icons.service';
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
    launcherIcon: '💬',
    iconColor: '#ffffff',
    showBadge: true,
    createdAt: new Date(),
    ...overrides,
  };
}

function buildService() {
  const repo = mockDeep<BotsRepository>();
  const billing = mockDeep<BillingService>();
  const icons = mockDeep<IconsService>();
  return { repo, billing, icons, service: new BotsService(repo, billing, icons) };
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

  it('update allows non-appearance fields (name) without a plan check', async () => {
    const { repo, billing, service } = buildService();
    repo.findById.mockResolvedValue(buildBot({ accountId: 'a1' }));
    repo.update.mockResolvedValue(buildBot({ name: 'Renamed' }));

    await service.update('a1', 'b1', { name: 'Renamed' });

    expect(repo.update).toHaveBeenCalledWith('b1', { name: 'Renamed' });
    expect(billing.accountPlan).not.toHaveBeenCalled();
  });

  it('update rejects widget-appearance changes on a non-Pro plan', async () => {
    const { repo, billing, service } = buildService();
    repo.findById.mockResolvedValue(buildBot({ accountId: 'a1' }));
    billing.accountPlan.mockResolvedValue('FREE');

    await expect(service.update('a1', 'b1', { color: '#000000' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('update allows widget-appearance changes on Pro', async () => {
    const { repo, billing, service } = buildService();
    repo.findById.mockResolvedValue(buildBot({ accountId: 'a1' }));
    billing.accountPlan.mockResolvedValue('PRO');
    repo.update.mockResolvedValue(buildBot({ launcherIcon: '🤖' }));

    await service.update('a1', 'b1', { launcherIcon: '🤖' });

    expect(repo.update).toHaveBeenCalledWith('b1', { launcherIcon: '🤖' });
  });

  it('update rejects a Solar launcher icon that does not resolve', async () => {
    const { repo, billing, icons, service } = buildService();
    repo.findById.mockResolvedValue(buildBot({ accountId: 'a1' }));
    billing.accountPlan.mockResolvedValue('PRO');
    icons.resolves.mockReturnValue(false);

    await expect(
      service.update('a1', 'b1', { launcherIcon: 'solar:does-not-exist' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
