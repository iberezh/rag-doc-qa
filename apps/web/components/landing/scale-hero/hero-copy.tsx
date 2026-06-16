import styles from './scale-hero.module.css';

// Per-step copy that fades in over the deck (opacity driven by --t1/--t2/--t3). Real headings
// and text so the hero's message is server-rendered and indexable, not baked into the canvas.
export function HeroCopy() {
  return (
    <>
      <div data-below className={styles.below}>
        <h2>Your documentation is already your best support tool.</h2>
        <p>
          Helpbase finds answers instantly, answers customers 24/7, and captures every question your docs miss.
        </p>
      </div>
      <div className={styles.copyL}>
        <span className={styles.eyebrow}>Speed</span>
        <h2>Seconds, not hours.</h2>
        <p>Customers get answers instantly. Your support team gets their time back.</p>
        <a className={styles.btn} href="#how">
          See it work
        </a>
      </div>
      <div className={styles.copyR}>
        <span className={styles.eyebrow}>Accuracy</span>
        <h2>Only cite answers it&apos;s confident&nbsp;about.</h2>
        <p>When uncertain, it captures the question as a lead for your team. No hallucinations, no guesses.</p>
        <a className={styles.btn} href="#features">
          How it works
        </a>
      </div>
    </>
  );
}
