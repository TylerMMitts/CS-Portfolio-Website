import { RefObject, useEffect, useRef } from 'react';

// One swipe = one step, inside pinned scroll scenes.
//
// A scene is a .pin-track whose scroll progress (0..1) drives an animation. It is given a list
// of stops. While the page is inside a scene, a swipe, wheel turn or arrow key no longer scrolls
// by however far it went: the page glides to the next (or previous) stop at a fixed speed, and
// all input is held back until that gesture has ended, so the momentum of a hard swipe never
// skips a step. Past the first or last stop the page scrolls normally. If momentum carries the
// page into a scene from outside, it is caught at the scene's edge.

interface Scene {
  ref: RefObject<HTMLElement>;
  stops: number[];
  ms: number; // duration for moving through the whole scene (0 -> 1)
  ease: (t: number) => number;
}

const scenes = new Set<Scene>();
const coarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

let animating = false;
let raf = 0;
let holdY = -1; // while holding, the page is kept at this scroll position
let holdUntil = 0; // performance.now() before which the page is held
let wheelQuietAt = 0; // wheel input before this is swallowed (trackpad inertia)
let touchDown = false;
let mouseDown = false; // e.g. dragging the scrollbar
const onMouseDown = () => (mouseDown = true);
const onMouseUp = () => (mouseDown = false);
let touchHeld = false; // the current touch gesture is being swallowed
let lastY = 0;
let unlockTimer = 0;
let listeners = 0;

const geom = (s: Scene) => {
  const el = s.ref.current;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  if (span <= 0) return null;
  const start = r.top + window.scrollY;
  return { start, end: start + span, span };
};

const sceneAt = (y: number) => {
  for (const s of scenes) {
    const g = geom(s);
    if (g && y >= g.start - 2 && y <= g.end + 2) return { s, ...g, p: Math.min(1, Math.max(0, (y - g.start) / g.span)) };
  }
  return null;
};

const lock = () => {
  window.clearTimeout(unlockTimer);
  // on touch screens this also stops any momentum scroll already under way
  if (coarse()) document.documentElement.style.overflow = 'hidden';
};
const unlockLater = (ms: number) => {
  window.clearTimeout(unlockTimer);
  unlockTimer = window.setTimeout(() => {
    if (!animating) document.documentElement.style.overflow = '';
  }, ms);
};
const holdAt = (y: number, ms: number) => {
  holdY = y;
  holdUntil = Math.max(holdUntil, performance.now() + ms);
  lock();
  unlockLater(ms);
};
const holding = () => touchHeld || performance.now() < holdUntil || performance.now() < wheelQuietAt;

// starts slow and keeps speeding up until it lands
export const easeIn = (t: number) => Math.pow(t, 2.4);
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const glide = (to: number, ms: number, ease: (t: number) => number) => {
  cancelAnimationFrame(raf);
  const from = window.scrollY;
  const t0 = performance.now();
  animating = true;
  lock();
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / ms);
    const y = from + (to - from) * ease(t);
    window.scrollTo(0, y);
    lastY = y;
    if (t < 1) {
      raf = requestAnimationFrame(tick);
      return;
    }
    animating = false;
    holdAt(to, 250);
  };
  raf = requestAnimationFrame(tick);
};

// a push in direction d (1 down, -1 up); returns true when it was used for a step
const step = (d: 1 | -1): boolean => {
  if (animating) return true;
  const at = sceneAt(window.scrollY);
  if (!at) return false;
  const eps = 0.004;
  const target = d > 0 ? at.s.stops.find((v) => v > at.p + eps) : [...at.s.stops].reverse().find((v) => v < at.p - eps);
  if (target === undefined) return false;
  glide(at.start + target * at.span, Math.max(450, Math.abs(target - at.p) * at.s.ms), at.s.ease);
  return true;
};

const onWheel = (e: WheelEvent) => {
  if (e.ctrlKey || Math.abs(e.deltaY) < 1) return;
  const now = performance.now();
  if (animating || now < wheelQuietAt || now < holdUntil) {
    wheelQuietAt = now + 220;
    e.preventDefault();
    return;
  }
  if (step(e.deltaY > 0 ? 1 : -1)) {
    wheelQuietAt = now + 220;
    e.preventDefault();
  }
};

let ty = 0;
let decided = false;
const onTouchStart = (e: TouchEvent) => {
  touchDown = true;
  ty = e.touches[0].clientY;
  decided = false;
  touchHeld = animating || performance.now() < holdUntil;
};
const onTouchMove = (e: TouchEvent) => {
  if (touchHeld || animating) {
    touchHeld = true;
    if (e.cancelable) e.preventDefault();
    return;
  }
  if (decided) return;
  const dy = ty - e.touches[0].clientY; // > 0: finger moving up, page scrolling down
  if (dy === 0) return;
  decided = true;
  if (step(dy > 0 ? 1 : -1)) {
    touchHeld = true;
    if (e.cancelable) e.preventDefault();
  }
};
const onTouchEnd = (e: TouchEvent) => {
  if (e.touches.length) return;
  touchDown = false;
  if (touchHeld) {
    touchHeld = false;
    holdUntil = Math.max(holdUntil, performance.now() + 120);
  }
};

const KEYS_DOWN = ['ArrowDown', 'PageDown', ' '];
const KEYS_UP = ['ArrowUp', 'PageUp'];
const onKey = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName))) return;
  const down = KEYS_DOWN.includes(e.key) && !(e.key === ' ' && e.shiftKey);
  const up = KEYS_UP.includes(e.key) || (e.key === ' ' && e.shiftKey);
  if (!down && !up) return;
  if (step(down ? 1 : -1)) e.preventDefault();
};

const onScroll = () => {
  const y = window.scrollY;
  if (animating) return;
  if (holding() && holdY >= 0) {
    if (Math.abs(y - holdY) > 1) window.scrollTo(0, holdY);
    lastY = holdY;
    return;
  }
  // momentum (or a free drag) moved the page through a scene by itself: catch it at the last
  // stop it passed, i.e. the scene's edge when coming in from outside. Not while the mouse is
  // dragging the scrollbar, and not for big jumps (links, Home/End).
  const dist = Math.abs(y - lastY);
  if (!mouseDown && dist > 0.5 && dist < window.innerHeight * 1.5) {
    for (const s of scenes) {
      const g = geom(s);
      if (!g) continue;
      const crossesInterior = Math.max(y, lastY) > g.start + 1 && Math.min(y, lastY) < g.end - 1;
      if (!crossesInterior || y < g.start - 2 || y > g.end + 2) continue;
      const pAt = (v: number) => (v - g.start) / g.span;
      const from = pAt(lastY);
      const stop =
        y > lastY
          ? [...s.stops].reverse().find((v) => v <= from + 0.004) ?? s.stops[0]
          : s.stops.find((v) => v >= from - 0.004) ?? s.stops[s.stops.length - 1];
      const at = g.start + stop * g.span;
      if (Math.abs(y - at) <= 1) break;
      window.scrollTo(0, at);
      lastY = at;
      if (touchDown) touchHeld = true;
      wheelQuietAt = performance.now() + 220;
      holdAt(at, 350);
      return;
    }
  }
  lastY = y;
};

function attach() {
  if (listeners++ > 0) return;
  lastY = window.scrollY;
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('mousedown', onMouseDown, true);
  window.addEventListener('mouseup', onMouseUp, true);
}
function detach() {
  if (--listeners > 0) return;
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('touchcancel', onTouchEnd);
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('mousedown', onMouseDown, true);
  window.removeEventListener('mouseup', onMouseUp, true);
  cancelAnimationFrame(raf);
  window.clearTimeout(unlockTimer);
  animating = false;
  document.documentElement.style.overflow = '';
}

export function useStepScroll(ref: RefObject<HTMLElement>, stops: number[] | undefined, ms: number, enabled = true, ease: (t: number) => number = easeInOut) {
  const scene = useRef<Scene | null>(null);
  const key = stops?.join(',') ?? '';
  useEffect(() => {
    if (!enabled || !stops?.length) return;
    const s: Scene = { ref, stops: [...stops].sort((a, b) => a - b), ms, ease };
    scene.current = s;
    scenes.add(s);
    attach();
    return () => {
      scenes.delete(s);
      detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, key, ms, enabled]);
}
