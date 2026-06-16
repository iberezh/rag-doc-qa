import { NavContent } from './nav-content';
import styles from './scale-hero.module.css';

// In-scene nav — slides up and out as the deck zooms (driven by the engine via [data-nav]).
// Its colours transition paper→dark with the scene background.
export function HeroNav() {
  return (
    <header data-nav className={styles.nav}>
      <NavContent />
    </header>
  );
}
