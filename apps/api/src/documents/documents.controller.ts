import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentAccount } from '../auth/current-account.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthContext } from '../auth/auth.types';
import { IngestionService } from './ingestion.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { IngestTextSchema, type IngestTextInput } from './schemas/ingest-text.schema';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './documents.constants';
import type { IngestSummary } from './documents.types';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly ingestion: IngestionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  ingestFile(
    @CurrentAccount() { accountId }: AuthContext,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<IngestSummary> {
    return this.ingestion.ingestFile(accountId, file);
  }

  @Post('text')
  ingestText(
    @CurrentAccount() { accountId }: AuthContext,
    @Body(new ZodValidationPipe(IngestTextSchema)) body: IngestTextInput,
  ): Promise<IngestSummary> {
    return this.ingestion.ingestText(accountId, body);
  }
}
