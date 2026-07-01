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
  | { type: 'conversation'; conversationId: string }
  | { type: 'done'; answered?: boolean }
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
  // false once the stream's `done` reports the bot couldn't answer — citations + sources are hidden then.
  answered?: boolean;
}

export type LibraryDoc = IngestSummary;

export type Plan = 'FREE' | 'STARTER' | 'PRO';

export interface Profile {
  user: { id: string; email: string };
  account: { id: string; name: string; plan: Plan };
}

export interface Bot {
  id: string;
  name: string;
  publicKey: string;
  allowedDomains: string[];
  greeting: string;
  color: string;
  launcherIcon: string;
  iconColor: string;
  showBadge: boolean;
  createdAt: string;
}

export interface ConversationView {
  id: string;
  question: string;
  answer: string;
  answered: boolean;
  visitorEmail: string | null;
  createdAt: string;
}

export interface BotAnalytics {
  totals: { total: number; answered: number; unanswered: number; deflectionRate: number };
  recent: ConversationView[];
  unanswered: ConversationView[];
}

export interface BillingStatus {
  plan: Plan;
  limits: { bots: number; messagesPerMonth: number; badgeRemoval: boolean };
  bots: number;
  messagesUsed: number;
  stripeEnabled: boolean;
}
