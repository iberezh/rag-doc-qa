import { Injectable } from '@nestjs/common';
import { DocumentStatus, Prisma, type Document } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { DocumentSummary, EmbeddedChunk, RetrievedChunk } from './documents.types';

export interface NewDocument {
  accountId: string;
  botId: string;
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
      data: {
        accountId: input.accountId,
        botId: input.botId,
        filename: input.filename,
        contentType: input.contentType,
      },
    });
  }

  async listByBot(botId: string): Promise<DocumentSummary[]> {
    const rows = await this.prisma.document.findMany({
      where: { botId },
      select: { id: true, filename: true, _count: { select: { chunks: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({ id: row.id, filename: row.filename, chunks: row._count.chunks }));
  }

  /** Deletes a document only if it belongs to the given bot; returns false if nothing matched. */
  async deleteForBot(botId: string, id: string): Promise<boolean> {
    const { count } = await this.prisma.document.deleteMany({ where: { id, botId } });
    return count > 0;
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
   * Cosine top-k over the pgvector column, scoped to one bot (the tenant boundary).
   * score = 1 - distance (higher is closer).
   */
  findSimilarChunks(botId: string, embedding: number[], limit: number): Promise<RetrievedChunk[]> {
    const vector = toVector(embedding);
    // $queryRaw binds ${...} as parameters (not string-inlined); botId/limit are also validated upstream.
    return this.prisma.$queryRaw<RetrievedChunk[]>`
      SELECT c.document_id AS "documentId",
             d.filename AS "filename",
             c.chunk_index AS "chunkIndex",
             c.content AS "content",
             1 - (c.embedding <=> ${vector}::vector) AS "score"
      FROM chunks c
      JOIN documents d ON d.id = c.document_id
      WHERE d.bot_id = ${botId}::uuid AND c.embedding IS NOT NULL
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
