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
      filename: 'a.txt',
      contentType: 'text/plain',
      status: DocumentStatus.PENDING,
      createdAt: new Date(),
    };
    prisma.document.create.mockResolvedValue(doc);

    const result = await repo.createDocument({ filename: 'a.txt', contentType: 'text/plain' });

    expect(result).toEqual(doc);
    expect(prisma.document.create).toHaveBeenCalledWith({
      data: { filename: 'a.txt', contentType: 'text/plain' },
    });
  });

  it('addChunk issues a parameterized raw vector insert', async () => {
    const prisma = mockDeep<PrismaService>();
    const repo = new DocumentsRepository(prisma);
    prisma.$executeRaw.mockResolvedValue(1);

    await repo.addChunk({ documentId: 'd1', index: 0, content: 'hi', embedding: [0.1, 0.2] });

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
