import { mockDeep } from 'jest-mock-extended';
import { DocumentStatus, type Document } from '@prisma/client';
import { DocumentsRepository } from './documents.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('DocumentsRepository', () => {
  it('createDocument delegates to prisma.document.create', async () => {
    const prisma = mockDeep<PrismaService>();
    const repo = new DocumentsRepository(prisma);
    const doc: Document = {
      id: 'd1',
      accountId: 'a1',
      botId: 'b1',
      filename: 'a.txt',
      contentType: 'text/plain',
      status: DocumentStatus.PENDING,
      createdAt: new Date(),
    };
    prisma.document.create.mockResolvedValue(doc);

    const result = await repo.createDocument({
      accountId: 'a1',
      botId: 'b1',
      filename: 'a.txt',
      contentType: 'text/plain',
    });

    expect(result).toEqual(doc);
  });

  it('saveChunks issues a single batched raw insert', async () => {
    const prisma = mockDeep<PrismaService>();
    const repo = new DocumentsRepository(prisma);
    prisma.$executeRaw.mockResolvedValue(2);

    await repo.saveChunks('d1', [
      { content: 'a', embedding: [0.1, 0.2] },
      { content: 'b', embedding: [0.3, 0.4] },
    ]);

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('saveChunks is a no-op for an empty list', async () => {
    const prisma = mockDeep<PrismaService>();
    const repo = new DocumentsRepository(prisma);

    await repo.saveChunks('d1', []);

    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});
