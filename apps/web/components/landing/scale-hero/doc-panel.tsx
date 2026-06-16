import { cn } from '@/lib/utils';
import styles from './doc-panel.module.css';

// The "real" centre panel: help/returns.md shown as a plain doc, evolving with the deck's stops —
// hidden behind the wall (step 0), segmented (step 1), matched + scored (step 2), then highlighted
// + cited with a grounded-answer ribbon (step 3). Decorative; its text mirrors the deck's answer
// card so the [1] citation reads true.
export function DocPanel() {
  return (
    <div className={styles.editor} aria-hidden>
      <div className={styles.body}>
        <div className={styles.chunk}>
          <p className={cn(styles.ln, styles.h)}># Returns &amp; refunds</p>
          <p className={styles.ln}>Most items can be returned within</p>
          <p className={styles.ln}>30 days of delivery, unworn.</p>
          <p className={styles.ln} />
        </div>
        <div className={cn(styles.chunk, styles.hit)}>
          <span className={styles.score}>match 0.89</span>
          <span className={styles.cite}>[1]</span>
          <p className={cn(styles.ln, styles.h)}>## Start a return</p>
          <p className={styles.ln}>
            1. Go to <b>Orders → Return</b>
          </p>
          <p className={styles.ln}>2. Pick the items and a reason</p>
          <p className={styles.ln}>3. Print the prepaid label we email</p>
        </div>
        <div className={styles.chunk}>
          <p className={styles.ln} />
          <p className={cn(styles.ln, styles.h)}>## When your refund arrives</p>
          <p className={styles.ln}>Refunds land 5–7 days after the</p>
          <p className={styles.ln}>item reaches our warehouse.</p>
        </div>
        <div className={styles.chunk}>
          <p className={styles.ln} />
          <p className={cn(styles.ln, styles.h)}>## Exceptions</p>
          <p className={styles.ln}>Final-sale and used items can&apos;t</p>
          <p className={styles.ln}>be returned for a refund.</p>
        </div>
        <div className={styles.scan} />
        <div className={styles.ribbon}>grounded answer · cited</div>
      </div>
    </div>
  );
}
