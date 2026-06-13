import { EYEBROW, FEATURES } from '@/lib/landing-content';

export function Features() {
  return (
    <section id="features" className="relative z-[2] mx-auto max-w-6xl px-6 py-20">
      <p className={EYEBROW}>Why Helpbase</p>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-4xl">
        Grounded answers, captured leads, no black box.
      </h2>
      <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="bg-card p-7">
            <span className="inline-block h-2.5 w-2.5 rotate-45 bg-primary" aria-hidden />
            <h3 className="mt-4 font-display text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2 font-body leading-relaxed text-muted-foreground">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
