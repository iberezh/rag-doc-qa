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

export interface DocumentOwner {
  accountId: string;
  botId: string;
}

interface PersistInput extends DocumentOwner {
  filename: string;
  contentType: string;
  text: string;
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

  async ingestFile(owner: DocumentOwner, file: UploadedFile): Promise<IngestSummary> {
    const text = await this.extractor.extract(file.buffer, file.mimetype);
    return this.persist({ ...owner, filename: file.originalname, contentType: file.mimetype, text });
  }

  ingestText(owner: DocumentOwner, input: IngestTextInput): Promise<IngestSummary> {
    const filename = input.filename ?? DEFAULT_TEXT_FILENAME;
    return this.persist({ ...owner, filename, contentType: TEXT_PLAIN, text: input.text });
  }

  private async persist(input: PersistInput): Promise<IngestSummary> {
    const chunks = chunkText(input.text);
    if (chunks.length === 0) {
      throw new BadRequestException('No extractable text found in the document');
    }
    const doc = await this.repo.createDocument({
      accountId: input.accountId,
      botId: input.botId,
      filename: input.filename,
      contentType: input.contentType,
    });
    const embeddings = await this.embedder.embed(chunks);
    await this.repo.saveChunks(doc.id, zipChunks(chunks, embeddings));
    await this.repo.setStatus(doc.id, DocumentStatus.READY);
    return { id: doc.id, filename: input.filename, chunks: chunks.length };
  }
}
