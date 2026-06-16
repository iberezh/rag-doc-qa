import { EYEBROW, FEATURES } from '@/lib/landing-content';

export function Features() {
  return (
    <section id="features" className="relative z-[2] mx-auto max-w-6xl px-6 py-20">
      <p data-reveal="left" className={EYEBROW}>
        Why Helpbase
      </p>
      <h2
        data-reveal="left"
        data-reveal-delay="1"
        className="text-flow mt-3 max-w-2xl font-display text-3xl font-semibold md:text-4xl"
      >
        Grounded answers, captured leads, no black box.
      </h2>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {/* outer = scroll reveal + hover group; inner = the card that lifts (keeps the two
            transforms on separate elements so they don't override each other) */}
        {FEATURES.map((feature, idx) => (
          <div
            key={feature.title}
            data-reveal="up"
            data-reveal-delay={idx + 1}
            className="group relative hover:z-10"
          >
            <div className="h-full rounded-xl border border-border bg-card p-7 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
              <span className="inline-block h-2.5 w-2.5 rotate-45 bg-primary" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 font-body leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
