import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EYEBROW, PLANS } from '@/lib/landing-content';
import { cn } from '@/lib/utils';

export function Pricing() {
  return (
    <section id="pricing" className="relative z-[2] mx-auto max-w-6xl px-6 py-20">
      <p className={EYEBROW}>Pricing</p>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-4xl">
        Start free. Upgrade when it pays for itself.
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'flex flex-col rounded-xl border bg-card p-6',
              plan.featured ? 'border-primary shadow-lg' : 'border-border',
            )}
          >
            {plan.featured ? (
              <span className="mb-3 inline-block w-fit rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
                Most popular
              </span>
            ) : null}
            <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.tagline}</p>
            <p className="mt-4">
              <span className="font-display text-4xl font-semibold">{plan.price}</span>{' '}
              <span className="text-sm text-muted-foreground">{plan.cadence}</span>
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant={plan.featured ? 'default' : 'outline'} className="mt-6">
              <Link href="/signup">{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
        Paid tiers are illustrative in this demo — sign up free to use everything.
      </p>
    </section>
  );
}
