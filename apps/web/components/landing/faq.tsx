import { EYEBROW, FAQS } from '@/lib/landing-content';

export function Faq() {
  return (
    <section id="faq" className="relative z-[2] border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p data-reveal="left" className={EYEBROW}>
          FAQ
        </p>
        <h2
          data-reveal="left"
          data-reveal-delay="1"
          className="mt-3 font-display text-3xl font-semibold md:text-4xl"
        >
          Questions, answered.
        </h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {FAQS.map((item, idx) => (
            <details
              key={item.q}
              data-reveal="up"
              data-reveal-delay={Math.min(idx + 1, 4)}
              className="group rounded-lg px-4 py-4 transition-colors duration-300 hover:bg-primary/5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg transition-colors duration-300 group-hover:text-primary">
                {item.q}
                <span className="font-mono text-primary transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 font-body leading-relaxed text-muted-foreground group-open:text-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
