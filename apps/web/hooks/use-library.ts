import { useCallback, useEffect, useState } from 'react';
import { deleteDocument, ingestFile, ingestText, listDocuments } from '@/lib/api';
import type { LibraryDoc } from '@/lib/types';

export interface LibraryState {
  docs: LibraryDoc[];
  busy: boolean;
  error: string | null;
  addText: (text: string, filename?: string) => Promise<boolean>;
  addFile: (file: File) => Promise<boolean>;
  remove: (docId: string) => Promise<void>;
}

export function useLibrary(botId: string): LibraryState {
  const [docs, setDocs] = useState<LibraryDoc[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listDocuments(botId)
      .then((loaded) => {
        if (active) setDocs(loaded);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Failed to load documents');
      });
    return () => {
      active = false;
    };
  }, [botId]);

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
    (text: string, filename?: string) => run(ingestText(botId, text, filename)),
    [run, botId],
  );
  const addFile = useCallback((file: File) => run(ingestFile(botId, file)), [run, botId]);
  const remove = useCallback(
    async (docId: string) => {
      setError(null);
      try {
        await deleteDocument(botId, docId);
        setDocs((prev) => prev.filter((doc) => doc.id !== docId));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Failed to delete document');
      }
    },
    [botId],
  );

  return { docs, busy, error, addText, addFile, remove };
}
