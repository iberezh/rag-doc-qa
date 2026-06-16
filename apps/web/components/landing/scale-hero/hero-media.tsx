import { cn } from '@/lib/utils';
import { DocWall } from './doc-wall';
import { DocPanel } from './doc-panel';
import styles from './scale-hero.module.css';

// The "real" centre panel: at step 0 a full-bleed wall of help docs (the haystack), then the one
// document the deck reasons over. Holds the page's <h1>. DocWall = the problem; DocPanel = a pure-CSS
// doc that walks the pipeline with the deck's stops, revealed as the wall fades.
export function HeroMedia() {
  return (
    <div className={cn(styles.panel, styles.real)}>
      <DocPanel />
      <DocWall />
      <div className={styles.hgrad} />
      <div className={styles.tint} />
      <span className={styles.plabel}>your doc · help/returns.md</span>
      <div className={styles.htext}>
        <h1>Cut support response time from hours to seconds.</h1>
      </div>
      <div className={styles.hscroll}>
        Scroll to explore{' '}
        <span className={styles.scrollKey} aria-hidden>
          ↓
        </span>
      </div>
    </div>
  );
}
