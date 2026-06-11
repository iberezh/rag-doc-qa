import { cn } from '@/lib/utils';

interface CitationChipProps {
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
}

export function CitationChip({ index, active, onSelect }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Jump to source ${index}`}
      className={cn(
        'mx-0.5 inline-flex h-[1.2em] min-w-[1.2em] -translate-y-[0.32em] items-center justify-center rounded-[3px] px-1 align-baseline font-mono text-[0.62em] font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground',
      )}
    >
      {index}
    </button>
  );
}
