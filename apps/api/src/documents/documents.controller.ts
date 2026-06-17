import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Bot } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BotOwnerGuard } from '../bots/guards/bot-owner.guard';
import { CurrentBot } from '../bots/current-bot.decorator';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './documents.constants';
import { DocumentsRepository } from './documents.repository';
import type { DocumentSummary, IngestSummary } from './documents.types';
import { IngestionService } from './ingestion.service';
import { IngestTextSchema, type IngestTextInput } from './schemas/ingest-text.schema';

@Controller('bots/:botId/documents')
@UseGuards(JwtAuthGuard, BotOwnerGuard)
export class DocumentsController {
  constructor(
    private readonly ingestion: IngestionService,
    private readonly repo: DocumentsRepository,
  ) {}

  @Get()
  list(@CurrentBot() bot: Bot): Promise<DocumentSummary[]> {
    return this.repo.listByBot(bot.id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  ingestFile(
    @CurrentBot() bot: Bot,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          // Validate the declared mimetype, not magic numbers: plain-text formats (.md/.txt)
          // have no binary signature, so the default magic-number check rejects them.
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<IngestSummary> {
    return this.ingestion.ingestFile({ accountId: bot.accountId, botId: bot.id }, file);
  }

  @Post('text')
  ingestText(
    @CurrentBot() bot: Bot,
    @Body(new ZodValidationPipe(IngestTextSchema)) body: IngestTextInput,
  ): Promise<IngestSummary> {
    return this.ingestion.ingestText({ accountId: bot.accountId, botId: bot.id }, body);
  }

  @Delete(':docId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentBot() bot: Bot, @Param('docId') docId: string): Promise<void> {
    const deleted = await this.repo.deleteForBot(bot.id, docId);
    if (!deleted) {
      throw new NotFoundException('Document not found');
    }
  }
}
