import { BadRequestException, Injectable } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { DocumentsRepository } from './documents.repository';
import { TextExtractorService } from './text-extractor.service';
import { chunkText } from './chunker';
import { DEFAULT_TEXT_FILENAME, TEXT_PLAIN } from './documents.constants';
import type { IngestSummary } from './documents.types';
import type { IngestTextInput } from './schemas/ingest-text.schema';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly repo: DocumentsRepository,
    private readonly extractor: TextExtractorService,
  ) {}

  async ingestFile(file: UploadedFile): Promise<IngestSummary> {
    const text = await this.extractor.extract(file.buffer, file.mimetype);
    return this.persist(file.originalname, file.mimetype, text);
  }

  ingestText(input: IngestTextInput): Promise<IngestSummary> {
    const filename = input.filename ?? DEFAULT_TEXT_FILENAME;
    return this.persist(filename, TEXT_PLAIN, input.text);
  }

  private async persist(
    filename: string,
    contentType: string,
    text: string,
  ): Promise<IngestSummary> {
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      throw new BadRequestException('No extractable text found in the document');
    }
    const doc = await this.repo.createDocument({ filename, contentType });
    await this.repo.saveChunks(doc.id, chunks);
    await this.repo.setStatus(doc.id, DocumentStatus.READY);
    return { id: doc.id, filename, chunks: chunks.length };
  }
}
