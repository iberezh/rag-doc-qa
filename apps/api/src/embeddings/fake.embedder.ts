import { Injectable } from '@nestjs/common';
import { EMBEDDING_DIMENSION, type Embedder } from './embedder';
import { normalize } from './vector.util';

const MODULO = 1000;
const PRIME = 31;

/** Deterministic, dependency-free embedder for tests/CI — no model download, no network. */
@Injectable()
export class FakeEmbedder implements Embedder {
  readonly dimension = EMBEDDING_DIMENSION;

  embed(texts: string[]): Promise<number[][]> {
    return Promise.resolve(texts.map((text) => this.vectorFor(text)));
  }

  private vectorFor(text: string): number[] {
    const raw = Array.from({ length: this.dimension }, (_, position) =>
      this.component(text, position),
    );
    return normalize(raw);
  }

  private component(text: string, position: number): number {
    let hash = position + 1;
    for (const char of text) {
      hash = (hash * PRIME + char.charCodeAt(0)) % MODULO;
    }
    return hash / MODULO - 0.5;
  }
}
