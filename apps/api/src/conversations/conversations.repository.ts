import { Injectable } from '@nestjs/common';
import { type Conversation, type Message, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AssistantMessage {
  conversationId: string;
  content: string;
  citations: Prisma.InputJsonValue;
  answered: boolean;
}

export type ConversationWithMessages = Conversation & { messages: Message[] };

@Injectable()
export class ConversationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  startConversation(botId: string, question: string): Promise<{ id: string }> {
    return this.prisma.conversation.create({
      data: { botId, messages: { create: { role: 'USER', content: question } } },
      select: { id: true },
    });
  }

  async addAssistantMessage(input: AssistantMessage): Promise<void> {
    await this.prisma.message.create({
      data: {
        conversationId: input.conversationId,
        role: 'ASSISTANT',
        content: input.content,
        citations: input.citations,
        answered: input.answered,
      },
    });
  }

  async setVisitorEmail(botId: string, conversationId: string, email: string): Promise<boolean> {
    const { count } = await this.prisma.conversation.updateMany({
      where: { id: conversationId, botId },
      data: { visitorEmail: email },
    });
    return count > 0;
  }

  countAssistantMessages(botId: string): Promise<number> {
    return this.prisma.message.count({ where: { role: 'ASSISTANT', conversation: { botId } } });
  }

  countAnsweredMessages(botId: string): Promise<number> {
    return this.prisma.message.count({
      where: { role: 'ASSISTANT', answered: true, conversation: { botId } },
    });
  }

  listConversations(botId: string, limit: number): Promise<ConversationWithMessages[]> {
    return this.prisma.conversation.findMany({
      where: { botId },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  listUnanswered(botId: string, limit: number): Promise<ConversationWithMessages[]> {
    return this.prisma.conversation.findMany({
      where: { botId, messages: { some: { role: 'ASSISTANT', answered: false } } },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
