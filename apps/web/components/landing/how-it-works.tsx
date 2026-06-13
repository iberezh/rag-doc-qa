import { EYEBROW, STEPS } from '@/lib/landing-content';

export function HowItWorks() {
  return (
    <section id="how" className="relative z-[2] border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className={EYEBROW}>How it works</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-4xl">
          Live on your site in three steps.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n}>
              <span className="font-mono text-sm text-primary">{step.n}</span>
              <div className="mt-2 h-px w-10 bg-primary/40" aria-hidden />
              <h3 className="mt-4 font-display text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 font-body leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
