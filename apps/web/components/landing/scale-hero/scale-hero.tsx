import { DeckEngine } from './deck-engine';
import { HeroNav } from './hero-nav';
import { HeroCopy } from './hero-copy';
import { DeckStage } from './deck-stage';
import styles from './scale-hero.module.css';

// Full-bleed dark scroll "act": the deck pins and zooms from a full-screen hero through the
// retrieve → rank → answer steps, then hands straight off to the editorial body.
// Server-rendered tree; only DeckEngine hydrates to drive the scroll. SEO content lives in HeroNav,
// HeroCopy and DeckStage (real <h1>/<h2> text, anchor links), not in the canvas.
export function ScaleHero() {
  return (
    <DeckEngine>
      <div data-stick className={styles.stick}>
        <div data-scene className={styles.scene}>
          <HeroNav />
          <HeroCopy />
          <DeckStage />
        </div>
      </div>
    </DeckEngine>
  );
}
