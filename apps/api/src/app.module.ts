import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigModule, PrismaModule, DocumentsModule, HealthModule],
})
export class AppModule {}
