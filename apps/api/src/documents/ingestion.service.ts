import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { DocumentsRepository } from './documents.repository';
import { TextExtractorService } from './text-extractor.service';
import { chunkText } from './chunker';
import { DEFAULT_TEXT_FILENAME, TEXT_PLAIN } from './documents.constants';
import { EMBEDDER, type Embedder } from '../embeddings/embedder';
import type { EmbeddedChunk, IngestSummary } from './documents.types';
import type { IngestTextInput } from './schemas/ingest-text.schema';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

function zipChunks(contents: string[], embeddings: number[][]): EmbeddedChunk[] {
  return contents.map((content, i) => {
    const embedding = embeddings[i];
    if (embedding === undefined) {
      throw new Error(`Missing embedding for chunk ${i}`);
    }
    return { content, embedding };
  });
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly repo: DocumentsRepository,
    private readonly extractor: TextExtractorService,
    @Inject(EMBEDDER) private readonly embedder: Embedder,
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
    const embeddings = await this.embedder.embed(chunks);
    await this.repo.saveChunks(doc.id, zipChunks(chunks, embeddings));
    await this.repo.setStatus(doc.id, DocumentStatus.READY);
    return { id: doc.id, filename, chunks: chunks.length };
  }
}
