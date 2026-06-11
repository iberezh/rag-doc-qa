import { Injectable } from '@nestjs/common';
import { DocumentStatus, Prisma, type Document } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { EmbeddedChunk } from './documents.types';

export interface NewDocument {
  filename: string;
  contentType: string;
}

function toVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createDocument(input: NewDocument): Promise<Document> {
    return this.prisma.document.create({ data: input });
  }

  /** Single batched insert. pgvector is an Unsupported Prisma type, so this uses raw SQL. */
  async saveChunks(documentId: string, chunks: EmbeddedChunk[]): Promise<void> {
    if (chunks.length === 0) {
      return;
    }
    const rows = chunks.map(
      (chunk, index) =>
        Prisma.sql`(gen_random_uuid(), ${documentId}::uuid, ${index}, ${chunk.content}, ${toVector(chunk.embedding)}::vector, now())`,
    );
    await this.prisma.$executeRaw`
      INSERT INTO chunks (id, document_id, chunk_index, content, embedding, created_at)
      VALUES ${Prisma.join(rows)}
    `;
  }

  async setStatus(id: string, status: DocumentStatus): Promise<void> {
    await this.prisma.document.update({ where: { id }, data: { status } });
  }

  countChunks(documentId: string): Promise<number> {
    return this.prisma.chunk.count({ where: { documentId } });
  }

  async deleteDocument(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}
