import { Fragment } from 'react';
import { CitationChip } from './citation-chip';

interface AnswerTextProps {
  answer: string;
  streaming: boolean;
  activeCitation: number | null;
  onCite: (index: number) => void;
}

const CITATION = /\[(\d+)\]/g;

export function AnswerText({ answer, streaming, activeCitation, onCite }: AnswerTextProps) {
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
