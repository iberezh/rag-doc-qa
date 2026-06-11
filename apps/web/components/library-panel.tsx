import { AddContent } from './add-content';
import { DocumentList } from './document-list';
import type { LibraryState } from '@/hooks/use-library';

export function LibraryPanel({ library }: { library: LibraryState }) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-7 overflow-y-auto border-b border-border px-6 py-7 md:border-b-0 md:border-r">
      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          01 — Add to library
        </p>
        <AddContent
          busy={library.busy}
          error={library.error}
          onAddText={library.addText}
          onAddFile={library.addFile}
        />
      </div>
      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          02 — Library · {library.docs.length}
        </p>
        <DocumentList docs={library.docs} />
      </div>
    </aside>
  );
}
