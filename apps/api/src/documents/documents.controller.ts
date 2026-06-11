import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestionService } from './ingestion.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { IngestTextSchema, type IngestTextInput } from './schemas/ingest-text.schema';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './documents.constants';
import type { IngestSummary } from './documents.types';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly ingestion: IngestionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  ingestFile(
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
    return this.ingestion.ingestFile(file);
  }

  @Post('text')
  ingestText(
    @Body(new ZodValidationPipe(IngestTextSchema)) body: IngestTextInput,
  ): Promise<IngestSummary> {
    return this.ingestion.ingestText(body);
  }
}
