import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { DocumentsModule } from './documents/documents.module';
import { RetrievalModule } from './retrieval/retrieval.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EmbeddingsModule,
    DocumentsModule,
    RetrievalModule,
    HealthModule,
  ],
})
export class AppModule {}
