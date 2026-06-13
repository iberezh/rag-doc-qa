import { Injectable, NotFoundException } from '@nestjs/common';
import type { Bot } from '@prisma/client';
import { BotsRepository } from './bots.repository';
import { generatePublicKey } from './public-key';
import type { CreateBotInput } from './schemas/create-bot.schema';
import type { UpdateBotInput } from './schemas/update-bot.schema';

@Injectable()
export class BotsService {
  constructor(private readonly repo: BotsRepository) {}

  create(accountId: string, input: CreateBotInput): Promise<Bot> {
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
    return this.repo.update(botId, input);
  }

  async remove(accountId: string, botId: string): Promise<void> {
    await this.getOwned(accountId, botId);
    await this.repo.delete(botId);
  }
}
