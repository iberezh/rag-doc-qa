export interface IngestSummary {
  id: string;
  filename: string;
  chunks: number;
}

export interface EmbeddedChunk {
  content: string;
  embedding: number[];
}

export interface RetrievedChunk {
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
}
