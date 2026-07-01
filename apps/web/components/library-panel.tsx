import type { ReactNode } from 'react';
import { AddContent } from './add-content';
import { DocumentList } from './document-list';
import type { LibraryState } from '@/hooks/use-library';

const sectionLabel = 'mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground';

export function LibraryPanel({
  library,
  embed,
  appearance,
}: {
  library: LibraryState;
  embed?: ReactNode;
  appearance?: ReactNode;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-7 overflow-y-auto border-b border-border px-6 py-7 md:border-b-0 md:border-r">
      <div>
        <p className={sectionLabel}>01 — Add to library</p>
        <AddContent
          busy={library.busy}
          error={library.error}
          onAddText={library.addText}
          onAddFile={library.addFile}
        />
      </div>
      <div>
        <p className={sectionLabel}>02 — Knowledge · {library.docs.length}</p>
        <DocumentList docs={library.docs} onDelete={(id) => void library.remove(id)} />
      </div>
      {embed ? (
        <div>
          <p className={sectionLabel}>03 — Embed</p>
          {embed}
        </div>
      ) : null}
      {appearance ? (
        <div>
          <p className={sectionLabel}>04 — Widget appearance</p>
          {appearance}
        </div>
      ) : null}
    </aside>
  );
}
