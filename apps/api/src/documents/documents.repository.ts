import { Injectable } from '@nestjs/common';
import { DocumentStatus, Prisma, type Document } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { EmbeddedChunk, RetrievedChunk } from './documents.types';

export interface NewDocument {
  accountId: string;
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
    return this.prisma.document.create({
      data: { accountId: input.accountId, filename: input.filename, contentType: input.contentType },
    });
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

  /**
   * Cosine top-k over the pgvector column, scoped to one account (the tenant boundary).
   * score = 1 - distance (higher is closer).
   */
  findSimilarChunks(
    accountId: string,
    embedding: number[],
    limit: number,
  ): Promise<RetrievedChunk[]> {
    const vector = toVector(embedding);
    return this.prisma.$queryRaw<RetrievedChunk[]>`
      SELECT c.document_id AS "documentId",
             d.filename AS "filename",
             c.chunk_index AS "chunkIndex",
             c.content AS "content",
             1 - (c.embedding <=> ${vector}::vector) AS "score"
      FROM chunks c
      JOIN documents d ON d.id = c.document_id
      WHERE d.account_id = ${accountId}::uuid AND c.embedding IS NOT NULL
      ORDER BY c.embedding <=> ${vector}::vector
      LIMIT ${limit}
    `;
  }

  countChunks(documentId: string): Promise<number> {
    return this.prisma.chunk.count({ where: { documentId } });
  }

  async deleteDocument(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}
