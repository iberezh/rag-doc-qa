import { Fragment } from 'react';
import { CitationChip } from './citation-chip';

interface AnswerTextProps {
  answer: string;
  streaming: boolean;
  activeCitation: number | null;
  onCite: (index: number) => void;
  showCitations?: boolean;
}

const CITATION = /\[(\d+)\]/g;

// When the bot couldn't answer, citations are suppressed: strip the [n] markers (and the
// comma-runs / dangling punctuation they leave) so customers never see refs to internal docs.
function stripCitations(text: string): string {
  return text
    .replace(/\s*\[\d+\]/g, '')
    .replace(/\s*,(?=\s*,)/g, '')
    .replace(/([.!?])\s*,/g, '$1')
    .replace(/,\s*(and\b)/gi, ' $1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function AnswerText({
  answer,
  streaming,
  activeCitation,
  onCite,
  showCitations = true,
}: AnswerTextProps) {
  if (!showCitations) {
    return (
      <p className="font-body text-[1.05rem] leading-[1.72] text-foreground">
        {stripCitations(answer)}
        {streaming && <span className="caret" aria-hidden />}
      </p>
    );
  }
  const parts = answer.split(CITATION);
  return (
    <p className="font-body text-[1.05rem] leading-[1.72] text-foreground">
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          return <Fragment key={i}>{part}</Fragment>;
        }
        const index = Number(part);
        return (
          <CitationChip
            key={i}
            index={index}
            active={activeCitation === index}
            onSelect={onCite}
          />
        );
      })}
      {streaming && <span className="caret" aria-hidden />}
    </p>
  );
}
