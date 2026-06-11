import { useCallback, useState } from 'react';
import { ingestFile, ingestText } from '@/lib/api';
import type { LibraryDoc } from '@/lib/types';

export interface LibraryState {
  docs: LibraryDoc[];
  busy: boolean;
  error: string | null;
  addText: (text: string, filename?: string) => Promise<boolean>;
  addFile: (file: File) => Promise<boolean>;
}

export function useLibrary(): LibraryState {
  const [docs, setDocs] = useState<LibraryDoc[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (task: Promise<LibraryDoc>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      const doc = await task;
      setDocs((prev) => [doc, ...prev]);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to add content');
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const addText = useCallback(
    (text: string, filename?: string) => run(ingestText(text, filename)),
    [run],
  );
  const addFile = useCallback((file: File) => run(ingestFile(file)), [run]);

  return { docs, busy, error, addText, addFile };
}
