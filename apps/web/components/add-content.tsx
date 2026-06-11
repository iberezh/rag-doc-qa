import { useRef, useState, type ChangeEvent } from 'react';
import { Plus, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SAMPLE_FILENAME, SAMPLE_TEXT } from '@/lib/sample';

interface AddContentProps {
  busy: boolean;
  error: string | null;
  onAddText: (text: string, filename?: string) => Promise<boolean>;
  onAddFile: (file: File) => Promise<boolean>;
}

export function AddContent({ busy, error, onAddText, onAddFile }: AddContentProps) {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function submitText() {
    if (!text.trim() || busy) {
      return;
    }
    const ok = await onAddText(text.trim());
    if (ok) {
      setText('');
    }
  }

  function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void onAddFile(file);
    }
    event.target.value = '';
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Paste text to add to your library…"
        rows={5}
        disabled={busy}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={submitText} disabled={busy || text.trim().length === 0} size="sm">
          <Plus /> Add text
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload /> Upload
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void onAddText(SAMPLE_TEXT, SAMPLE_FILENAME)}
          disabled={busy}
        >
          <Sparkles /> Try a sample
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={pickFile}
          className="hidden"
        />
      </div>
      {error && <p className="font-mono text-xs text-destructive">{error}</p>}
    </div>
  );
}
