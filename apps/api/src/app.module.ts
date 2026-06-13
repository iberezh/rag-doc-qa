import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BotsModule } from './bots/bots.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { DocumentsModule } from './documents/documents.module';
import { RetrievalModule } from './retrieval/retrieval.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    BotsModule,
    EmbeddingsModule,
    DocumentsModule,
    RetrievalModule,
    ChatModule,
    HealthModule,
  ],
})
export class AppModule {}
