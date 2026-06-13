import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentAccount } from '../auth/current-account.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthContext } from '../auth/auth.types';
import { ChatService } from './chat.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { ChatSchema, type ChatInput } from './schemas/chat.schema';

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async stream(
    @CurrentAccount() { accountId }: AuthContext,
    @Body(new ZodValidationPipe(ChatSchema)) body: ChatInput,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const event of this.chat.streamAnswer(accountId, body.query)) {
        res.write(sse(event));
      }
    } catch {
      res.write(sse({ type: 'error', message: 'Generation failed' }));
    } finally {
      res.end();
    }
  }
}
