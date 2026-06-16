import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/landing/logo';

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
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-8">
          <Logo className="h-5 w-auto" />
          <span className="font-display font-semibold">Helpbase</span>
        </div>
      </footer>
    </>
  );
}
