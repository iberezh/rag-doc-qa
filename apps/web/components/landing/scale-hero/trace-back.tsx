import styles from './scale-hero.module.css';

// Back virtual layer overlay (step 3): "rank · connect" — two contours, three ranked flow lines
// with arrowheads, end dots, and travelling pulses riding toward the back. Decorative only.
export function TraceBack() {
  return (
    <svg className={styles.trace} viewBox="0 0 620 392" preserveAspectRatio="none" aria-hidden>
      <g className={styles.seg} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.1">
        <path d="M70 180 C 90 150,140 150,150 184 C 158 212,128 236,98 226 C 70 217,58 200,70 180 Z" />
        <path d="M120 280 C 134 268,158 276,156 296 C 154 312,130 316,118 304 C 108 294,110 288,120 280 Z" />
      </g>
      <g
        className={styles.flow}
        fill="none"
        stroke="rgba(255,255,255,.8)"
        strokeWidth="1.3"
        markerEnd="url(#arr)"
      >
        <path d="M70 140 C 210 100,320 200,470 150" />
        <path d="M70 210 C 220 175,330 270,480 206" />
        <path d="M70 292 C 210 256,330 350,486 286" />
      </g>
      <g fill="#fff">
        <circle cx="470" cy="150" r="2.4" />
        <circle cx="480" cy="206" r="2.4" />
        <circle cx="486" cy="286" r="2.4" />
      </g>
      <g className={styles.travel} fill="#8fd2ff">
        <circle r="3.6">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M70 140 C 210 100,320 200,470 150" />
        </circle>
        <circle r="3">
          <animateMotion dur="3.2s" begin=".7s" repeatCount="indefinite" path="M70 210 C 220 175,330 270,480 206" />
        </circle>
        <circle r="3" fill="#fff">
          <animateMotion dur="3.6s" begin="1.3s" repeatCount="indefinite" path="M70 292 C 210 256,330 350,486 286" />
        </circle>
      </g>
    </svg>
  );
}
