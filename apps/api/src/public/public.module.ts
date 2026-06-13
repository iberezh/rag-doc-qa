import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { BotsModule } from '../bots/bots.module';
import { ChatModule } from '../chat/chat.module';
import { PUBLIC_THROTTLE_LIMIT, PUBLIC_THROTTLE_TTL_MS } from './public.constants';
import { PublicController } from './public.controller';

@Module({
  imports: [
    BotsModule,
    ChatModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: PUBLIC_THROTTLE_TTL_MS, limit: PUBLIC_THROTTLE_LIMIT }],
    }),
  ],
  controllers: [PublicController],
})
export class PublicModule {}
