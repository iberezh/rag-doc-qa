import { cn } from '@/lib/utils';
import type { RetrievedChunk } from '@/lib/types';

interface SourceCardProps {
  index: number;
  source: RetrievedChunk;
  active: boolean;
}

export function SourceCard({ index, source, active }: SourceCardProps) {
  const score = Math.round(source.score * 100);
  return (
    <div
      className={cn(
        'rounded-md border bg-card p-3 transition-colors',
        active ? 'border-primary ring-1 ring-primary/30' : 'border-border',
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="text-primary">[{index}]</span>
          <span className="truncate">{source.filename}</span>
        </span>
        <span className="shrink-0">{score}% match</span>
      </div>
      <p className="line-clamp-3 text-[0.9rem] leading-snug text-foreground/80">{source.content}</p>
    </div>
  );
}
