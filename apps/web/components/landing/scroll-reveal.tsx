'use client';

import { useEffect } from 'react';

// One observer for the whole page: reveals every [data-reveal] element as it scrolls into view
// (once), and marks <html> reveal-ready so the hidden-until-revealed styles only apply with JS.
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);
  return null;
}
