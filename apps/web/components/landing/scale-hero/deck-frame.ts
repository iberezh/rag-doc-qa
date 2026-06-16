// Pure scroll-progress → deck-geometry math. No DOM access, no side effects.
// `p` is 0→1 over the pinned hero "act"; each step fades the relevant layers in/out.

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// step-0 hero margins (full-bleed frame) + deck box geometry
export const DECK = { topM: 70, sideM: 22, botM: 22, gap: 30, navH: 64 } as const;

// Scroll-progress timeline — the p-values where each phase starts/spans. Single source of truth so
// computeBox / computePose / deckVars stay in lockstep.
const STOP = {
  openEnd: 0.24, // hero → centred deck box finishes settling
  darkStart: 0.04, darkSpan: 0.16, // paper → dark page theme
  dimStart: 0.16, dimSpan: 0.14, // deck layers fade in
  navStart: 0.05, navSpan: 0.13, // nav slides away
  seg1Start: 0.42, seg2Start: 0.7, segSpan: 0.22, // deck → segment → cited
} as const;

// Settled centre-panel geometry, relative to the viewport.
export const PANEL = { wRatio: 0.46, wMax: 940, aspect: 0.54, cyRatio: 0.44, seg2Drop: 0.1 } as const;
export const panelW = (vw: number): number => Math.min(vw * PANEL.wRatio, PANEL.wMax);

// per-phase eases derived from the timeline (kept here so the three frame fns don't duplicate them)
const easeOpen = (p: number): number => clamp01(p / STOP.openEnd);
const easeSeg1 = (p: number): number => clamp01((p - STOP.seg1Start) / STOP.segSpan);
const easeSeg2 = (p: number): number => clamp01((p - STOP.seg2Start) / STOP.segSpan);

type Rgb = readonly [number, number, number];
const PAPER: Rgb = [243, 239, 231];
const BLACK: Rgb = [5, 6, 6];
const INK_DARK: Rgb = [33, 28, 24];
const INK_LIGHT: Rgb = [244, 246, 245];

const ch = (a: number, b: number, t: number): number => Math.round(lerp(a, b, t));
const mix = (a: Rgb, b: Rgb, t: number): string =>
  `rgb(${ch(a[0], b[0], t)},${ch(a[1], b[1], t)},${ch(a[2], b[2], t)})`;

export type Step = '0' | '1' | '2' | '3';
// data-step boundaries (distinct from the geometry timeline above)
const STEP_EDGES: ReadonlyArray<readonly [number, Step]> = [[0.2, '0'], [0.46, '1'], [0.74, '2']];
const stepFor = (p: number): Step => STEP_EDGES.find(([edge]) => p < edge)?.[1] ?? '3';

export interface Box { w: number; h: number; cx: number; cy: number; }
export function computeBox(p: number, vw: number, vh: number): Box {
  const open = easeOpen(p);
  const seg2 = easeSeg2(p);
  const w0 = vw - DECK.sideM * 2;
  const h0 = vh - DECK.topM - DECK.botM;
  const w1 = panelW(vw);
  const cy0 = DECK.topM + h0 / 2;
  return {
    w: lerp(w0, w1, open),
    h: lerp(h0, w1 * PANEL.aspect, open),
    cx: vw / 2,
    cy: lerp(cy0, vh * PANEL.cyRatio, open) + seg2 * vh * PANEL.seg2Drop,
  };
}

// rotation/translation poses (deg / vw) at each phase
const POSE = { txMax: 11, rxDip: -0.5, ryOpen: -5, rySeg1: -2.4, rySeg2: 2.4 } as const;
export interface Pose { tx: number; rx: number; ry: number; }
export function computePose(p: number): Pose {
  const open = easeOpen(p);
  const seg1 = easeSeg1(p);
  const seg2 = easeSeg2(p);
  return {
    tx: lerp(lerp(0, POSE.txMax, seg1), -POSE.txMax, seg2),
    rx: lerp(lerp(0, POSE.rxDip, seg1), 0, seg2),
    ry: lerp(lerp(lerp(0, POSE.ryOpen, open), POSE.rySeg1, seg1), POSE.rySeg2, seg2),
  };
}

// brand vermilion (hsl(var(--primary)) ≈ this) — the accent's light-background style
const ACCENT = '#c14a2f';
const DARK_MIDPOINT = 0.5;
export interface Colors { pagebg: string; navfg: string; navbd: string; navcta: string; navctafg: string; }
function pageColors(dark: number): Colors {
  const d = dark > DARK_MIDPOINT;
  return {
    pagebg: mix(PAPER, BLACK, dark),
    navfg: mix(INK_DARK, INK_LIGHT, dark),
    navbd: `rgba(${d ? '255,255,255' : '0,0,0'},.2)`,
    // accent CTA stays vermilion with white text in both themes (never black-on-white)
    navcta: ACCENT,
    navctafg: '#fff',
  };
}

// depth (translateZ) + opacity envelope, and the plate that holds the step-0 hero
const DEPTH = { vfzNear: 90, vfzFar: 70, vbz: -90, realopMin: 0.8 } as const;
const PLATE = { end: 0.22, span: 0.12 } as const;
// copy-overlay fade windows: in/out p-edges + ramp span
const COPY = {
  t1: { in: 0.26, out: 0.4, span: 0.06 },
  t2: { in: 0.46, out: 0.68, span: 0.07 },
  t3: { in: 0.8, span: 0.08 },
} as const;
export interface DeckVars {
  plate: number; dimv: number; vfz: number; vbz: number; rz: number; realop: number;
  vfrontop: number; vbackop: number; bordop: number; bordbop: number; vbackvop: number;
  t1: number; t2: number; t3: number;
}
function deckVars(p: number): DeckVars {
  const dimv = clamp01((p - STOP.dimStart) / STOP.dimSpan);
  const seg1 = easeSeg1(p);
  const seg2 = easeSeg2(p);
  return {
    plate: clamp01((PLATE.end - p) / PLATE.span), dimv,
    vfz: lerp(DEPTH.vfzNear, DEPTH.vfzFar, seg1), vbz: DEPTH.vbz, rz: 0,
    realop: lerp(1, DEPTH.realopMin, seg2),
    vfrontop: dimv * (1 - seg2), vbackop: dimv * (1 - seg1),
    bordop: dimv * seg1 * (1 - seg2), bordbop: dimv * seg2, vbackvop: dimv * seg2,
    t1: clamp01(Math.min((p - COPY.t1.in) / COPY.t1.span, (COPY.t1.out - p) / COPY.t1.span, 1)),
    t2: clamp01(Math.min((p - COPY.t2.in) / COPY.t2.span, (COPY.t2.out - p) / COPY.t2.span, 1)),
    t3: clamp01((p - COPY.t3.in) / COPY.t3.span),
  };
}

export interface Frame extends Box, Pose {
  step: Step; navout: number; colors: Colors; vars: DeckVars;
}
export function computeFrame(p: number, vw: number, vh: number): Frame {
  return {
    ...computeBox(p, vw, vh),
    ...computePose(p),
    step: stepFor(p),
    navout: clamp01((p - STOP.navStart) / STOP.navSpan),
    colors: pageColors(clamp01((p - STOP.darkStart) / STOP.darkSpan)),
    vars: deckVars(p),
  };
}
