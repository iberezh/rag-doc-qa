import Link from 'next/link';
import { Logo } from '@/components/landing/logo';
import styles from './scale-hero.module.css';

// Shared nav markup for both the in-scene nav (slides away) and the sticky body nav. Colors come
// from --navfg/--navbd/--navcta/--navctafg, so the same markup themes itself to its background.
export function NavContent() {
  return (
    <>
      <div className={styles.navLeft}>
        <Link href="/" className={styles.brand}>
          <Logo />
          Helpbase
        </Link>
        <nav className={styles.navLinks} aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
      </div>
      <div className={styles.navRight}>
        <Link className={styles.login} href="/login">
          Log in
        </Link>
        <Link className={styles.demo} href="/signup">
          Start free
        </Link>
      </div>
    </>
  );
}
