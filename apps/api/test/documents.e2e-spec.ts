import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DocumentsRepository } from '../src/documents/documents.repository';

describe('Document ingestion (e2e)', () => {
  let app: INestApplication;
  let repo: DocumentsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    repo = moduleRef.get(DocumentsRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/documents/text chunks and persists pasted text', async () => {
    const text = 'lorem ipsum '.repeat(300);
    const response = await request(app.getHttpServer())
      .post('/api/documents/text')
      .send({ text, filename: 'note.txt' });

    expect(response.status).toBe(201);
    expect(response.body.filename).toBe('note.txt');
    expect(response.body.chunks).toBeGreaterThan(1);

    const count = await repo.countChunks(response.body.id);
    expect(count).toBe(response.body.chunks);

    await repo.deleteDocument(response.body.id);
  });

  it('rejects empty text with 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/documents/text')
      .send({ text: '' });

    expect(response.status).toBe(400);
  });
});
