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
