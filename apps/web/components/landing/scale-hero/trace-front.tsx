import styles from './scale-hero.module.css';

// Front virtual layer overlay (steps 1–2): segmentation contours, flow lines, two dot layouts,
// and travelling pulses. Purely decorative — hidden from assistive tech.
export function TraceFront() {
  return (
    <svg className={styles.trace} viewBox="0 0 620 392" preserveAspectRatio="none" aria-hidden>
      <g className={styles.seg} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.2">
        <path d="M86 150 C 108 104,176 96,206 138 C 232 174,212 232,166 240 C 120 248,66 214,68 172 C 69 152,74 158,86 150 Z" />
        <path d="M348 120 C 404 100,462 130,462 176 C 462 222,418 244,372 232 C 332 222,312 180,326 146 C 333 130,340 124,348 120 Z" />
        <path d="M250 250 C 286 236,330 252,338 286 C 344 314,316 338,282 332 C 252 327,236 296,248 266 Z" />
        <path d="M120 300 C 132 292,150 298,150 312 C 150 324,134 330,124 322 C 116 316,114 306,120 300 Z" />
        <path d="M430 286 C 446 278,466 288,462 304 C 458 318,438 320,430 308 C 425 300,424 292,430 286 Z" />
        <path d="M300 322 C 312 316,326 322,324 334 C 322 344,308 346,300 338 C 295 332,295 326,300 322 Z" />
        <path d="M520 232 C 532 226,546 232,544 244 C 542 254,528 256,520 248 Z" />
      </g>
      <g fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1">
        <path className={styles.flow} d="M-20 120 C 150 70,320 180,500 110 S 700 80,700 130" />
        <path className={styles.flow} d="M-20 300 C 160 270,320 340,540 280" opacity=".7" />
      </g>
      <g className={styles.s1dots}>
        <circle cx="206" cy="138" r="2.5" fill="#fff" />
        <circle cx="462" cy="176" r="2.5" fill="#fff" />
        <circle cx="166" cy="200" r="3.5" fill="#ffcc33">
          <animate attributeName="r" values="3;6.5;3" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;.35;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>
      <g className={styles.s2dots}>
        <circle cx="300" cy="106" r="2.5" fill="#fff" />
        <circle cx="118" cy="252" r="2.5" fill="#fff" />
        <circle cx="384" cy="300" r="2.5" fill="#fff" />
        <circle cx="432" cy="184" r="3.5" fill="#ffcc33">
          <animate attributeName="r" values="3;6.5;3" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;.35;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
      <path
        className={styles.flow}
        d="M166 200 C 300 220,430 250,520 300"
        fill="none"
        stroke="rgba(255,204,51,.6)"
        strokeWidth="1.2"
      />
      <g className={styles.travel} fill="#8fd2ff">
        <circle r="3.6">
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M-20 120 C 150 70,320 180,500 110 S 700 80,700 130" />
        </circle>
        <circle r="3" fill="#fff">
          <animateMotion dur="3.2s" begin=".8s" repeatCount="indefinite" path="M-20 300 C 160 270,320 340,540 280" />
        </circle>
        <circle r="3" fill="#ffcc33">
          <animateMotion dur="2.3s" begin=".4s" repeatCount="indefinite" path="M166 200 C 300 220,430 250,520 300" />
        </circle>
      </g>
    </svg>
  );
}
