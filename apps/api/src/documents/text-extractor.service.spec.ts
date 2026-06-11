import { UnsupportedMediaTypeException } from '@nestjs/common';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { TextExtractorService } from './text-extractor.service';

jest.mock('pdf-parse/lib/pdf-parse.js');

describe('TextExtractorService', () => {
  const service = new TextExtractorService();

  it('decodes plain text', async () => {
    const text = await service.extract(Buffer.from('hello', 'utf-8'), 'text/plain');
    expect(text).toBe('hello');
  });

  it('decodes markdown', async () => {
    const text = await service.extract(Buffer.from('# title', 'utf-8'), 'text/markdown');
    expect(text).toBe('# title');
  });

  it('routes PDFs through pdf-parse', async () => {
    jest.mocked(pdfParse).mockResolvedValue({ text: 'pdf text', numpages: 1, info: {} });

    const text = await service.extract(Buffer.from('%PDF'), 'application/pdf');

    expect(text).toBe('pdf text');
    expect(jest.mocked(pdfParse)).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported content types', async () => {
    await expect(service.extract(Buffer.from('x'), 'image/png')).rejects.toBeInstanceOf(
      UnsupportedMediaTypeException,
    );
  });
});
