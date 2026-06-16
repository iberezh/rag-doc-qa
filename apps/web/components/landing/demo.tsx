import { EYEBROW } from '@/lib/landing-content';
import { LiveWidget } from '@/components/landing/live-widget';

export function Demo() {
  return (
    <section className="relative z-[2] border-y border-border bg-secondary/30">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div data-reveal="left">
          <p className={EYEBROW}>See it live</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            We dogfood Helpbase on this very page.
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-muted-foreground">
            The widget on the right answers from Helpbase&apos;s own documentation. Ask it about
            pricing, embedding, or how citations work — it replies from the same docs you&apos;re
            reading, and footnotes its sources.
          </p>
          <ul className="mt-6 flex flex-col gap-2 font-body text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">→</span> Answers stream in, with citations.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">→</span> Stumped questions ask for your email.
            </li>
          </ul>
        </div>
        <div data-reveal="right" data-reveal-delay="1" className="mx-auto w-full max-w-sm">
          <LiveWidget />
        </div>
      </div>
    </section>
  );
}
