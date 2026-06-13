export interface IngestSummary {
  id: string;
  filename: string;
  chunks: number;
}

/** A stored document as listed in a bot's library. */
export type DocumentSummary = IngestSummary;

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
