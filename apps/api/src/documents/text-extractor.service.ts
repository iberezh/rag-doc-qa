import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { PDF_TYPE, TEXT_MARKDOWN, TEXT_PLAIN } from './documents.constants';

const TEXT_TYPES = new Set<string>([TEXT_PLAIN, TEXT_MARKDOWN]);

@Injectable()
export class TextExtractorService {
  async extract(buffer: Buffer, contentType: string): Promise<string> {
    if (contentType === PDF_TYPE) {
      const result = await pdfParse(buffer);
      return result.text;
    }
    if (TEXT_TYPES.has(contentType)) {
      return buffer.toString('utf-8');
    }
    throw new UnsupportedMediaTypeException(`Unsupported content type: ${contentType}`);
  }
}
