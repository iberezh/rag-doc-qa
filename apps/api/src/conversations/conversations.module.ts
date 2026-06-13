import { Module } from '@nestjs/common';
import { BotsModule } from '../bots/bots.module';
import { AnalyticsController } from './analytics.controller';
import { ConversationsRepository } from './conversations.repository';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [BotsModule],
  controllers: [AnalyticsController],
  providers: [ConversationsService, ConversationsRepository],
  exports: [ConversationsService],
})
export class ConversationsModule {}
