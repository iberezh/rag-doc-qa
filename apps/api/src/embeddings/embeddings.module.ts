import { Global, Module } from '@nestjs/common';
import { EMBEDDER } from './embedder';
import { TransformersEmbedder } from './transformers.embedder';

@Global()
@Module({
  providers: [{ provide: EMBEDDER, useClass: TransformersEmbedder }],
  exports: [EMBEDDER],
})
export class EmbeddingsModule {}
