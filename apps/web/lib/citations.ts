// Strip inline [n] citation markers (and the comma/punctuation artifacts they leave) from an
// answer. Used for customer-facing replies in the embedded widget, where the source documents
// aren't accessible to the visitor — and as the fallback for non-answers in the dashboard.
const CITATION = /\s*\[\d+\]/g;

export function stripCitations(text: string): string {
  return text
    .replace(CITATION, '')
    .replace(/,(\s*,)+/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,(\s*[).:;!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
