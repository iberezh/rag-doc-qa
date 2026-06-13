import { FileText, Trash2 } from 'lucide-react';
import type { LibraryDoc } from '@/lib/types';

interface DocumentListProps {
  docs: LibraryDoc[];
  onDelete?: (docId: string) => void;
}

export function DocumentList({ docs, onDelete }: DocumentListProps) {
  if (docs.length === 0) {
    return (
      <p className="font-body text-sm italic text-muted-foreground">
        This bot has no documents yet. Paste text, upload a file, or try the sample.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
        >
          <FileText className="shrink-0 text-primary" />
          <span className="flex-1 truncate text-sm">{doc.filename}</span>
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {doc.chunks} chunks
          </span>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(doc.id)}
              aria-label={`Delete ${doc.filename}`}
              className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
