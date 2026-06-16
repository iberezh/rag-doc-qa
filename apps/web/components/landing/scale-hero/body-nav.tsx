'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { NavContent } from './nav-content';
import styles from './scale-hero.module.css';

// Fixed nav for the editorial body — not part of the body layout. It slides + fades in once the
// dark act has scrolled past, and tucks away again when the scene comes back into view.
export function BodyNav() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const act = document.querySelector('[data-act]');
    if (!act) return;
    const io = new IntersectionObserver(([entry]) => setShown(entry?.isIntersecting === false));
    io.observe(act);
    return () => io.disconnect();
  }, []);
  return (
    <header className={cn(styles.bodyNav, shown && styles.bodyNavShown)}>
      <NavContent />
    </header>
  );
}
