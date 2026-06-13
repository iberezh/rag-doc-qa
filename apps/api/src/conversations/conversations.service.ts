import { Injectable } from '@nestjs/common';
import { MessageRole, type Prisma } from '@prisma/client';
import { ConversationsRepository, type ConversationWithMessages } from './conversations.repository';
import type { BotAnalytics, ConversationView } from './conversations.types';

const VIEW_LIMIT = 20;

export interface CompletedTurn {
  conversationId: string;
  answer: string;
  citations: Prisma.InputJsonValue;
  answered: boolean;
}

function toView(conversation: ConversationWithMessages): ConversationView {
  // Conversations are single-turn today: one USER + one ASSISTANT message.
  const user = conversation.messages.find((m) => m.role === MessageRole.USER);
  const assistant = conversation.messages.find((m) => m.role === MessageRole.ASSISTANT);
  return {
    id: conversation.id,
    question: user?.content ?? '',
    answer: assistant?.content ?? '',
    answered: assistant?.answered ?? false,
    visitorEmail: conversation.visitorEmail,
    createdAt: conversation.createdAt.toISOString(),
  };
}

@Injectable()
export class ConversationsService {
  constructor(private readonly repo: ConversationsRepository) {}

  start(botId: string, question: string): Promise<{ id: string }> {
    return this.repo.startConversation(botId, question);
  }

  complete(turn: CompletedTurn): Promise<void> {
    return this.repo.addAssistantMessage({
      conversationId: turn.conversationId,
      content: turn.answer,
      citations: turn.citations,
      answered: turn.answered,
    });
  }

  captureEmail(botId: string, conversationId: string, email: string): Promise<boolean> {
    return this.repo.setVisitorEmail(botId, conversationId, email);
  }

  async analytics(botId: string): Promise<BotAnalytics> {
    const [total, answered, recent, unanswered] = await Promise.all([
      this.repo.countAssistantMessages(botId),
      this.repo.countAnsweredMessages(botId),
      this.repo.listConversations(botId, VIEW_LIMIT),
      this.repo.listUnanswered(botId, VIEW_LIMIT),
    ]);
    return {
      totals: { total, answered, unanswered: total - answered, deflectionRate: rate(answered, total) },
      recent: recent.map(toView),
      unanswered: unanswered.map(toView),
    };
  }
}

function rate(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100) / 100;
}
