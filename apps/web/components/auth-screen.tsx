'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/landing/logo';
import { login, signup } from '@/lib/auth';

type Mode = 'login' | 'signup';

const COPY = {
  login: {
    title: 'Welcome back',
    cta: 'Log in',
    prompt: 'New to Helpbase?',
    href: '/signup',
    link: 'Create an account',
  },
  signup: {
    title: 'Create your workspace',
    cta: 'Start free',
    prompt: 'Already have an account?',
    href: '/login',
    link: 'Log in',
  },
} as const;

const labelClass = 'font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground';

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (mode === 'signup'
        ? signup({ accountName, email, password })
        : login({ email, password }));
      router.push('/app');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  };

  return (
    <main className="relative z-[2] flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex animate-in fade-in slide-in-from-top-4 items-center duration-500">
          <Link href="/" className="flex items-center gap-1.5">
            <Logo className="h-7 w-auto" />
            <span className="font-display text-2xl font-semibold tracking-tight">Helpbase</span>
          </Link>
        </div>
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="pt-5">
            <h1 className="mb-1 font-display text-xl font-semibold">{copy.title}</h1>
            <p className="mb-5 text-sm text-muted-foreground">
              {mode === "signup" ? "Cut support response time from hours to seconds." : "Welcome back to your workspace."}
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => void submit(e)}>
              {mode === 'signup' ? (
                <label className="flex flex-col gap-1">
                  <span className={labelClass}>Company / workspace</span>
                  <Input
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </label>
              ) : null}
              <label className="flex flex-col gap-1">
                <span className={labelClass}>Email</span>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={labelClass}>Password</span>
                <Input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={busy} className="mt-1">
                {busy ? 'Working…' : copy.cta}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="animate-in fade-in slide-in-from-bottom-4 mt-4 text-center text-sm text-muted-foreground duration-1000">
          {copy.prompt}{' '}
          <Link href={copy.href} className="text-primary underline-offset-4 hover:underline">
            {copy.link}
          </Link>
        </p>
      </div>
    </main>
  );
}
