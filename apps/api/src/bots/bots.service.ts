import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import { BillingService } from '../billing/billing.service';
import { BotsRepository } from './bots.repository';
import { generatePublicKey } from './public-key';
import type { CreateBotInput } from './schemas/create-bot.schema';
import type { UpdateBotInput } from './schemas/update-bot.schema';

// Widget-appearance fields are a Pro perk; changing any of them requires the Pro plan.
const PRO_FIELDS: ReadonlyArray<keyof UpdateBotInput> = [
  'color',
  'greeting',
  'launcherIcon',
  'iconColor',
  'showBadge',
];

@Injectable()
export class BotsService {
  constructor(
    private readonly repo: BotsRepository,
    private readonly billing: BillingService,
  ) {}

  async create(accountId: string, input: CreateBotInput): Promise<Bot> {
    await this.billing.assertCanCreateBot(accountId);
    return this.repo.create({ accountId, name: input.name, publicKey: generatePublicKey() });
  }

  list(accountId: string): Promise<Bot[]> {
    return this.repo.listByAccount(accountId);
  }

  /** Loads a bot and asserts the account owns it; the single tenant gate for bot resources. */
  async getOwned(accountId: string, botId: string): Promise<Bot> {
    const bot = await this.repo.findById(botId);
    if (!bot || bot.accountId !== accountId) {
      throw new NotFoundException('Bot not found');
    }
    return bot;
  }

  /** Resolves a bot by its public (embed) key — no account required. */
  async getByPublicKey(publicKey: string): Promise<Bot> {
    const bot = await this.repo.findByPublicKey(publicKey);
    if (!bot) {
      throw new NotFoundException('Bot not found');
    }
    return bot;
  }

  async update(accountId: string, botId: string, input: UpdateBotInput): Promise<Bot> {
    await this.getOwned(accountId, botId);
    await this.assertAppearanceAllowed(accountId, input);
    return this.repo.update(botId, input);
  }

  /** Widget customization (color, greeting, launcher icon, badge) is gated to the Pro plan. */
  private async assertAppearanceAllowed(accountId: string, input: UpdateBotInput): Promise<void> {
    const touchesAppearance = PRO_FIELDS.some((field) => input[field] !== undefined);
    if (!touchesAppearance) return;
    const plan = await this.billing.accountPlan(accountId);
    if (plan !== 'PRO') {
      throw new ForbiddenException('Widget customization is a Pro feature');
    }
  }

  async remove(accountId: string, botId: string): Promise<void> {
    await this.getOwned(accountId, botId);
    await this.repo.delete(botId);
  }
}
