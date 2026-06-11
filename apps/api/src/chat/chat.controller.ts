import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { ChatSchema, type ChatInput } from './schemas/chat.schema';

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async stream(
    @Body(new ZodValidationPipe(ChatSchema)) body: ChatInput,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const event of this.chat.streamAnswer(body.query)) {
        res.write(sse(event));
      }
    } catch {
      res.write(sse({ type: 'error', message: 'Generation failed' }));
    } finally {
      res.end();
    }
  }
}
