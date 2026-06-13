'use client';

import { type FormEvent, useState } from 'react';
import { captureLead } from '@/lib/public';

interface LeadFormProps {
  publicKey: string;
  conversationId: string;
  accent: string;
}

export function LeadForm({ publicKey, conversationId, accent }: LeadFormProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!email.trim()) return;
    setFailed(false);
    await captureLead(publicKey, conversationId, email.trim()).then(
      () => setSent(true),
      () => setFailed(true),
    );
  };

  if (sent) {
    return <p className="text-center text-xs text-black/50">Thanks — we’ll be in touch.</p>;
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-2 rounded-2xl bg-[#f1efe9] p-3">
      <label htmlFor="lead-email" className="text-xs text-black/60">
        Leave your email and the team will follow up.
      </label>
      <input
        id="lead-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
      />
      {failed ? <p className="text-xs text-red-600">Couldn’t save that — please try again.</p> : null}
      <button
        type="submit"
        className="rounded-md px-3 py-1.5 text-sm text-white"
        style={{ backgroundColor: accent }}
      >
        Notify me
      </button>
    </form>
  );
}
