export interface IngestSummary {
  id: string;
  filename: string;
  chunks: number;
}

export interface EmbeddedChunk {
  content: string;
  embedding: number[];
}
