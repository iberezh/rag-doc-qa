export interface RetrievedChunk {
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
}

export type ChatEvent =
  | { type: 'sources'; sources: RetrievedChunk[] }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface IngestSummary {
  id: string;
  filename: string;
  chunks: number;
}

export type ExchangeStatus = 'streaming' | 'done' | 'error';

export interface Exchange {
  id: string;
  question: string;
  answer: string;
  sources: RetrievedChunk[];
  status: ExchangeStatus;
}

export type LibraryDoc = IngestSummary;
