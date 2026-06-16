'use client';

import { type ReactNode, useRef } from 'react';
import { useScrollDeck } from './use-scroll-deck';
import styles from './scale-hero.module.css';

// Thin client shell: owns the scroll engine via a ref and renders the server-built markup as
// children, so all hero copy is server-rendered HTML (SEO) while only the behaviour hydrates.
export function DeckEngine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useScrollDeck(ref);
  return (
    <section ref={ref} data-act className={styles.act} aria-label="How Helpbase answers from your docs">
      {children}
    </section>
  );
}
