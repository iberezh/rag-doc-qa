import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { BotsController } from './bots.controller';
import { BotsRepository } from './bots.repository';
import { BotsService } from './bots.service';
import { BotOwnerGuard } from './guards/bot-owner.guard';

@Module({
  imports: [BillingModule],
  controllers: [BotsController],
  providers: [BotsService, BotsRepository, BotOwnerGuard],
  exports: [BotsService, BotOwnerGuard],
})
export class BotsModule {}
