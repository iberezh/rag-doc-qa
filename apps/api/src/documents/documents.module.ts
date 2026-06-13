import { Module } from '@nestjs/common';
import { BotsModule } from '../bots/bots.module';
import { DocumentsController } from './documents.controller';
import { DocumentsRepository } from './documents.repository';
import { IngestionService } from './ingestion.service';
import { TextExtractorService } from './text-extractor.service';

@Module({
  imports: [BotsModule],
  controllers: [DocumentsController],
  providers: [DocumentsRepository, IngestionService, TextExtractorService],
  exports: [DocumentsRepository],
})
export class DocumentsModule {}
