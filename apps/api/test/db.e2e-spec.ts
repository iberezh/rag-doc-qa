import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DocumentsRepository } from '../src/documents/documents.repository';

const EMBEDDING_DIM = 384;

interface NearestRow {
  content: string;
  distance: number;
}

describe('Documents persistence (e2e)', () => {
  let prisma: PrismaService;
  let repo: DocumentsRepository;
  let accountId: string;
  let botId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    prisma = moduleRef.get(PrismaService);
    repo = moduleRef.get(DocumentsRepository);
    await prisma.$connect();
    accountId = (await prisma.account.create({ data: { name: 'db-e2e' } })).id;
    botId = (
      await prisma.bot.create({
        data: { accountId, name: 'db-e2e bot', publicKey: `pub_db_${Date.now()}` },
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: accountId } });
    await prisma.$disconnect();
  });

  it('stores a 384-dim chunk embedding and finds it by cosine distance', async () => {
    const doc = await repo.createDocument({
      accountId,
      botId,
      filename: 'sample.txt',
      contentType: 'text/plain',
    });
    const embedding = Array.from({ length: EMBEDDING_DIM }, (_, i) => (i === 0 ? 1 : 0));
    await repo.saveChunks(doc.id, [{ content: 'hello world', embedding }]);

    expect(await repo.countChunks(doc.id)).toBe(1);

    const vector = `[${embedding.join(',')}]`;
    const rows = await prisma.$queryRawUnsafe<NearestRow[]>(
      'SELECT content, embedding <=> $1::vector AS distance FROM chunks WHERE document_id = $2::uuid ORDER BY distance ASC LIMIT 1',
      vector,
      doc.id,
    );
    expect(rows[0]?.content).toBe('hello world');
    expect(Number(rows[0]?.distance)).toBeCloseTo(0, 5);

    await repo.deleteDocument(doc.id);
    expect(await repo.countChunks(doc.id)).toBe(0);
  });
});
