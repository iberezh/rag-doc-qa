import { Injectable } from '@nestjs/common';
import type { Document } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface NewDocument {
  filename: string;
  contentType: string;
}

export interface NewChunk {
  documentId: string;
  index: number;
  content: string;
  embedding: number[];
}

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createDocument(input: NewDocument): Promise<Document> {
    return this.prisma.document.create({ data: input });
  }

  /** pgvector columns are an Unsupported type in Prisma, so chunks insert via raw SQL. */
  async addChunk(input: NewChunk): Promise<void> {
    const vector = `[${input.embedding.join(',')}]`;
    await this.prisma.$executeRaw`
      INSERT INTO chunks (id, document_id, chunk_index, content, embedding, created_at)
      VALUES (gen_random_uuid(), ${input.documentId}::uuid, ${input.index}, ${input.content}, ${vector}::vector, now())
    `;
  }

  countChunks(documentId: string): Promise<number> {
    return this.prisma.chunk.count({ where: { documentId } });
  }

  async deleteDocument(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}
