import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { RetrievalService } from './retrieval.service';
import { SearchController } from './search.controller';

@Module({
  imports: [DocumentsModule],
  controllers: [SearchController],
  providers: [RetrievalService],
  exports: [RetrievalService],
})
export class RetrievalModule {}
