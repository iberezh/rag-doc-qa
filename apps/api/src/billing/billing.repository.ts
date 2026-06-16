import { Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { BillingAccount } from './billing.types';

@Injectable()
export class BillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async loadAccount(accountId: string): Promise<BillingAccount | null> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { users: { take: 1, orderBy: { createdAt: 'asc' }, select: { email: true } } },
    });
    if (!account) {
      return null;
    }
    return {
      id: account.id,
      plan: account.plan,
      stripeCustomerId: account.stripeCustomerId,
      email: account.users[0]?.email ?? '',
    };
  }

  countBots(accountId: string): Promise<number> {
    return this.prisma.bot.count({ where: { accountId } });
  }

  async setStripeCustomer(accountId: string, stripeCustomerId: string): Promise<void> {
    await this.prisma.account.update({ where: { id: accountId }, data: { stripeCustomerId } });
  }

  async setPlan(accountId: string, plan: Plan): Promise<void> {
    await this.prisma.account.update({ where: { id: accountId }, data: { plan } });
  }

  async setPlanByCustomer(stripeCustomerId: string, plan: Plan): Promise<void> {
    await this.prisma.account.updateMany({ where: { stripeCustomerId }, data: { plan } });
  }

  async incrementUsage(accountId: string, period: string): Promise<void> {
    await this.prisma.usageCounter.upsert({
      where: { accountId_period: { accountId, period } },
      create: { accountId, period, count: 1 },
      update: { count: { increment: 1 } },
    });
  }

  async getUsage(accountId: string, period: string): Promise<number> {
    const row = await this.prisma.usageCounter.findUnique({
      where: { accountId_period: { accountId, period } },
      select: { count: true },
    });
    return row?.count ?? 0;
  }
}
