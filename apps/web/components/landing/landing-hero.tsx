import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  return (
    <section className="relative z-[2] mx-auto max-w-6xl px-6 pb-16 pt-20 md:pb-24 md:pt-28">
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
        Support chatbots, built from your docs
      </p>
      <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl">
        A chatbot that <span className="italic text-primary">answers</span> from your docs — and
        tells you what it <span className="italic text-primary">can’t</span>.
      </h1>
      <p className="mt-7 max-w-xl font-body text-lg leading-relaxed text-muted-foreground md:text-xl">
        Upload your documentation, paste one line of script, and Helpbase replies to your
        visitors with grounded, cited answers. Every question it can’t answer becomes a captured
        lead in your dashboard.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href="/signup">Start free — no card</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#how">See how it works</Link>
        </Button>
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Free forever · 1 bot · 100 messages / mo
      </p>
    </section>
  );
}
