import { cn } from '@/lib/utils';
import { HeroMedia } from './hero-media';
import { TraceBack } from './trace-back';
import { TraceLinks } from './trace-links';
import { TraceFront } from './trace-front';
import styles from './scale-hero.module.css';

// The deck itself: every layer in back-to-front DOM order. The engine only morphs the stage box
// and toggles data-step — depth/opacity/transform per panel are pure CSS. Server-rendered so the
// step-0 full-bleed hero (and its <h1>) is in the initial HTML.
export function DeckStage() {
  return (
    <div data-stage className={styles.stage}>
      <div className={cn(styles.panel, styles.vback)}>
        <div className={styles.tickcol}>
          11<br />1<br />1100<br />1
        </div>
        <span className={cn(styles.mk, styles.mkA)}>◇</span>
        <span className={cn(styles.mk, styles.mkB)}>▽</span>
      </div>

      <div className={cn(styles.panel, styles.bordb)} />
      <div className={cn(styles.panel, styles.depthb, styles.depthbA)} />
      <div className={cn(styles.panel, styles.depthb, styles.depthbB)} />
      <div className={cn(styles.panel, styles.vbackv)}>
        <span className={styles.plabel}>rank · connect</span>
        <div className={styles.scan} />
        <TraceBack />
        <span className={cn(styles.mk, styles.mkC)}>◇</span>
        <span className={cn(styles.mk, styles.mkD)}>▽</span>
      </div>

      <div className={cn(styles.panel, styles.links)}>
        <TraceLinks />
      </div>

      <div className={cn(styles.panel, styles.depth1, styles.depthFront)} />
      <div className={cn(styles.panel, styles.depth1, styles.depthBack)} />

      <HeroMedia />

      <div className={cn(styles.panel, styles.bord2, styles.bordClose)} />
      <div className={cn(styles.panel, styles.bord)} />
      <div className={cn(styles.panel, styles.bord2)} />
      <div className={cn(styles.panel, styles.bord3)} />

      <div className={cn(styles.panel, styles.vfront)}>
        <span className={styles.plabel}>read · segment</span>
        <div className={styles.scan} />
        <TraceFront />
        <span className={styles.matchtag}>match 0.89</span>
        <span className={cn(styles.mk, styles.mkE)}>▽</span>
        <div className={styles.ans}>
          <div className={styles.ansK}>grounded answer · cited</div>
          Go to <b>Orders → Return</b>, pick your items, and print the prepaid label. Refunds arrive
          5–7 days after we get it.<sup>[1]</sup>
        </div>
      </div>
    </div>
  );
}
