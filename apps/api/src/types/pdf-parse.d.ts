// Minimal typings for the internal entry point (avoids pdf-parse's debug-mode wrapper
// that reads a test file when imported as the package root).
declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseResult {
    text: string;
    numpages: number;
    info: unknown;
  }
  function pdfParse(data: Buffer): Promise<PdfParseResult>;
  export default pdfParse;
}
