import { Module } from '@nestjs/common';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { AppConfigService } from '../config/app-config.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CHAT_MODEL, type ChatModel } from './chat-model';
import { GroqChatModel } from './groq-chat.model';
import { MockChatModel } from './mock-chat.model';

function createChatModel(config: AppConfigService): ChatModel {
  const apiKey = config.groqApiKey;
  return apiKey ? new GroqChatModel(apiKey) : new MockChatModel();
}

@Module({
  imports: [RetrievalModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    { provide: CHAT_MODEL, useFactory: createChatModel, inject: [AppConfigService] },
  ],
})
export class ChatModule {}
