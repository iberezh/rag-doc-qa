import { EYEBROW, STEPS } from '@/lib/landing-content';

export function HowItWorks() {
  return (
    <section id="how" className="relative z-[2] border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p data-reveal="left" className={EYEBROW}>
          How it works
        </p>
        <h2
          data-reveal="left"
          data-reveal-delay="1"
          className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-4xl"
        >
          Live on your site in three steps.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <li
              key={step.n}
              data-reveal="up"
              data-reveal-delay={idx + 1}
              className="group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="relative rounded-lg border border-transparent p-6 transition-colors duration-300 group-hover:border-primary group-hover:bg-primary/5">
                <span className="font-mono text-sm text-primary">{step.n}</span>
                <div
                  className="mt-2 h-px w-10 bg-primary/40 transition-all duration-300 group-hover:w-16 group-hover:bg-primary"
                  aria-hidden
                />
                <h3 className="mt-4 font-display text-2xl font-semibold transition-colors duration-300 group-hover:text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 font-body leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
