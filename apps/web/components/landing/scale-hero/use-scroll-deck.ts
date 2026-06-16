'use client';

import { type RefObject, useEffect } from 'react';
import { clamp01, computeFrame, DECK, type DeckVars, type Frame, PANEL, panelW } from './deck-frame';

interface Els { act: HTMLElement; stage: HTMLElement; scene: HTMLElement; nav: HTMLElement; below: HTMLElement; }
interface Mouse { x: number; y: number; tx: number; ty: number; }
interface Viewport { vw: number; vh: number; }

const MOUSE_EASE = 0.05; // pointer-parallax smoothing applied per frame
const MOUSE_SETTLED = 0.0005; // |target − current| below which the pointer ease is "done"
const PARALLAX_X = 2; // deg of rotateY per unit of normalized pointer offset
const PARALLAX_Y = -1.5; // deg of rotateX per unit of normalized pointer offset
const NAV_SLIDE_GAP = 14; // extra px the nav travels past its own height when hiding
const BELOW_MIN_GAP = 170; // min px from the viewport bottom for the step-0 caption
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const STILL: Mouse = { x: 0, y: 0, tx: 0, ty: 0 };

function collect(root: HTMLElement): Els | null {
  const stage = root.querySelector<HTMLElement>('[data-stage]');
  const scene = root.querySelector<HTMLElement>('[data-scene]');
  const nav = root.querySelector<HTMLElement>('[data-nav]');
  const below = root.querySelector<HTMLElement>('[data-below]');
  if (!stage || !scene || !nav || !below) return null;
  return { act: root, stage, scene, nav, below };
}

function applyVars(act: HTMLElement, v: DeckVars): void {
  const s = act.style;
  s.setProperty('--plate', v.plate.toFixed(3));
  s.setProperty('--dimv', v.dimv.toFixed(3));
  s.setProperty('--vfz', v.vfz.toFixed(2));
  s.setProperty('--vbz', v.vbz.toFixed(2));
  s.setProperty('--rz', v.rz.toFixed(2));
  s.setProperty('--realop', v.realop.toFixed(3));
  s.setProperty('--vfrontop', v.vfrontop.toFixed(3));
  s.setProperty('--vbackop', v.vbackop.toFixed(3));
  s.setProperty('--bordop', v.bordop.toFixed(3));
  s.setProperty('--bordbop', v.bordbop.toFixed(3));
  s.setProperty('--vbackvop', v.vbackvop.toFixed(3));
  s.setProperty('--t1', v.t1.toFixed(3));
  s.setProperty('--t2', v.t2.toFixed(3));
  s.setProperty('--t3', v.t3.toFixed(3));
}

function applyColors(act: HTMLElement, c: Frame['colors']): void {
  const s = act.style;
  s.setProperty('--pagebg', c.pagebg);
  s.setProperty('--navfg', c.navfg);
  s.setProperty('--navbd', c.navbd);
  s.setProperty('--navcta', c.navcta);
  s.setProperty('--navctafg', c.navctafg);
}

function applyStage(els: Els, f: Frame, m: Mouse): void {
  const s = els.stage.style;
  s.width = `${f.w.toFixed(1)}px`;
  s.height = `${f.h.toFixed(1)}px`;
  s.left = `${f.cx.toFixed(1)}px`;
  s.top = `${f.cy.toFixed(1)}px`;
  const ry = (f.ry + m.x * PARALLAX_X).toFixed(2);
  const rx = (f.rx + m.y * PARALLAX_Y).toFixed(2);
  s.transform = `translate(-50%,-50%) translateX(${f.tx.toFixed(2)}vw) rotateX(${rx}deg) rotateY(${ry}deg)`;
  els.scene.style.perspectiveOrigin = `50% ${f.cy.toFixed(1)}px`;
  if (els.stage.dataset.step !== f.step) els.stage.dataset.step = f.step;
}

function applyNav(els: Els, f: Frame, vp: Viewport): void {
  els.nav.style.transform = `translateY(${(-f.navout * (DECK.navH + NAV_SLIDE_GAP)).toFixed(1)}px)`;
  els.nav.style.opacity = (1 - f.navout).toFixed(2);
  const w1 = panelW(vp.vw);
  els.below.style.top = `${Math.max(vp.vh * PANEL.cyRatio + (w1 * PANEL.aspect) / 2 + DECK.gap, vp.vh - BELOW_MIN_GAP).toFixed(1)}px`;
}

function render(els: Els, p: number, m: Mouse): void {
  const vp: Viewport = { vw: window.innerWidth, vh: window.innerHeight };
  const f = computeFrame(p, vp.vw, vp.vh);
  applyStage(els, f, m);
  applyVars(els.act, f.vars);
  applyColors(els.act, f.colors);
  applyNav(els, f, vp);
}

function readProgress(act: HTMLElement): number {
  return clamp01(-act.getBoundingClientRect().top / (act.offsetHeight - window.innerHeight));
}

export function useScrollDeck(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = rootRef.current;
    const els = root ? collect(root) : null;
    if (!els) return;

    const mql = matchMedia(REDUCED_MOTION);
    const m: Mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let p = readProgress(els.act);
    let lastP = Number.NaN; // forces the first frame (and post-resize frames) to render
    let raf = 0;
    let running = false;

    const moving = (): boolean =>
      Math.abs(m.tx - m.x) > MOUSE_SETTLED || Math.abs(m.ty - m.y) > MOUSE_SETTLED;

    // Only touch the DOM when the scroll position changed or the pointer ease is still settling —
    // the rAF keeps ticking (cheap) but idle frames skip all the layout writes.
    const tick = (): void => {
      if (p !== lastP || moving()) {
        m.x += (m.tx - m.x) * MOUSE_EASE;
        m.y += (m.ty - m.y) * MOUSE_EASE;
        render(els, p, m);
        lastP = p;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = (): void => {
      if (running || mql.matches) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = (): void => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onScroll = (): void => { p = readProgress(els.act); };
    const onResize = (): void => {
      p = readProgress(els.act);
      lastP = Number.NaN; // geometry depends on viewport size — force a re-render
      if (mql.matches) render(els, p, STILL);
    };
    const onPointer = (e: PointerEvent): void => {
      m.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      m.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    // Honour reduced-motion live: paint one static frame and idle, or resume if it's turned off.
    const syncMotion = (): void => {
      if (mql.matches) {
        stop();
        render(els, p, STILL);
        return;
      }
      start();
    };

    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? syncMotion() : stop()));
    io.observe(els.act);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    addEventListener('pointermove', onPointer, { passive: true });
    mql.addEventListener('change', syncMotion);
    return () => {
      stop();
      io.disconnect();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
      removeEventListener('pointermove', onPointer);
      mql.removeEventListener('change', syncMotion);
    };
  }, [rootRef]);
}
