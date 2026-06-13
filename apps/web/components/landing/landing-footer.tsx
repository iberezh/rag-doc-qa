import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingFooter() {
  return (
    <>
      <section
        aria-label="Get started"
        className="relative z-[2] mx-auto max-w-6xl px-6 py-24 text-center"
      >
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Put a support chatbot on your site this afternoon.
        </h2>
        <p className="mt-4 font-body text-lg text-muted-foreground">
          Free to start. One line to embed. Cited answers from day one.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/signup">Start free</Link>
        </Button>
      </section>
      <footer className="relative z-[2] border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8">
          <div className="flex items-baseline gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rotate-45 bg-primary" aria-hidden />
            <span className="font-display font-semibold">Helpbase</span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Docs → chatbot → captured leads
          </p>
        </div>
      </footer>
    </>
  );
}
