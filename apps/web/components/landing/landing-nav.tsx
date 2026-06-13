import Link from 'next/link';
import { Button } from '@/components/ui/button';

const linkClass =
  'font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="inline-block h-3 w-3 rotate-45 bg-primary" aria-hidden />
          <span className="font-display text-xl font-semibold tracking-tight">Helpbase</span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          <a href="#how" className={linkClass}>
            How it works
          </a>
          <a href="#features" className={linkClass}>
            Features
          </a>
          <a href="#pricing" className={linkClass}>
            Pricing
          </a>
          <a href="#faq" className={linkClass}>
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className={linkClass}>
            Log in
          </Link>
          <Button asChild size="sm">
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
