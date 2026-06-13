import { Injectable } from '@nestjs/common';
import type { Bot, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateBotInput } from './schemas/update-bot.schema';

export interface NewBot {
  accountId: string;
  name: string;
  publicKey: string;
}

@Injectable()
export class BotsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: NewBot): Promise<Bot> {
    return this.prisma.bot.create({ data: input });
  }

  listByAccount(accountId: string): Promise<Bot[]> {
    return this.prisma.bot.findMany({ where: { accountId }, orderBy: { createdAt: 'desc' } });
  }

  findById(id: string): Promise<Bot | null> {
    return this.prisma.bot.findUnique({ where: { id } });
  }

  findByPublicKey(publicKey: string): Promise<Bot | null> {
    return this.prisma.bot.findUnique({ where: { publicKey } });
  }

  update(id: string, data: UpdateBotInput): Promise<Bot> {
    // Zod drops absent optionals at runtime; the cast reconciles exactOptionalPropertyTypes with Prisma.
    return this.prisma.bot.update({ where: { id }, data: data as Prisma.BotUpdateInput });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bot.delete({ where: { id } });
  }
}
