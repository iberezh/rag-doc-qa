import { FileText } from 'lucide-react';
import type { LibraryDoc } from '@/lib/types';

export function DocumentList({ docs }: { docs: LibraryDoc[] }) {
  if (docs.length === 0) {
    return (
      <p className="font-body text-sm italic text-muted-foreground">
        Your library is empty. Paste text, upload a file, or try the sample.
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
        </li>
      ))}
    </ul>
  );
}
