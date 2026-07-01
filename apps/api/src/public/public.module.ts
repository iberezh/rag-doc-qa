import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { BillingModule } from '../billing/billing.module';
import { BotsModule } from '../bots/bots.module';
import { ChatModule } from '../chat/chat.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { IconsModule } from '../icons/icons.module';
import { PUBLIC_THROTTLE_LIMIT, PUBLIC_THROTTLE_TTL_MS } from './public.constants';
import { PublicController } from './public.controller';

@Module({
  imports: [
    BillingModule,
    BotsModule,
    ChatModule,
    ConversationsModule,
    IconsModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: PUBLIC_THROTTLE_TTL_MS, limit: PUBLIC_THROTTLE_LIMIT }],
    }),
  ],
  controllers: [PublicController],
})
export class PublicModule {}
