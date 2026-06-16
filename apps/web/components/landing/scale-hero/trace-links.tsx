import styles from './scale-hero.module.css';

// Step-1 threads: three descending flows from the front virtual (left, top) through the real
// centre to the back virtual (right, bottom), with amber pulse nodes at each crossing. Decorative.
// Owns the shared <marker id="arr"> arrowhead referenced by the front/back flow overlays.
export function TraceLinks() {
  return (
    <svg className={styles.trace} viewBox="0 0 620 392" preserveAspectRatio="none" fill="none" aria-hidden>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="5.2" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 z" fill="rgba(255,255,255,.7)" />
        </marker>
      </defs>
      <g className={styles.flow} stroke="rgba(255,255,255,.62)" strokeWidth="1.1">
        <path d="M92 116 C 210 124,255 140,310 150 C 370 160,440 176,528 188" />
        <path d="M92 178 C 210 186,255 198,310 206 C 370 214,440 228,528 240" />
        <path d="M96 240 C 210 246,255 260,310 270 C 370 280,440 294,524 304" />
      </g>
      <g fill="#fff">
        <circle cx="92" cy="116" r="2.6" />
        <circle cx="92" cy="178" r="2.6" />
        <circle cx="96" cy="240" r="2.6" />
        <circle cx="528" cy="188" r="2.6" />
        <circle cx="528" cy="240" r="2.6" />
        <circle cx="524" cy="304" r="2.6" />
      </g>
      <g fill="#ffcc33">
        <circle cx="310" cy="150" r="3">
          <animate attributeName="r" values="2.5;5;2.5" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="310" cy="206" r="3">
          <animate attributeName="r" values="2.5;5;2.5" dur="2.2s" begin=".6s" repeatCount="indefinite" />
        </circle>
        <circle cx="310" cy="270" r="3">
          <animate attributeName="r" values="2.5;5;2.5" dur="2.2s" begin="1.2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}
