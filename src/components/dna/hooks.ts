import { useEffect, useRef, useState, RefObject } from 'react';

export const ASSET = '/d2d/';

export const frameUrls = (dir: string, n = 51) =>
  Array.from({ length: n }, (_, i) => `${ASSET}${dir}/step_${String(i).padStart(2, '0')}.webp`);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Progress of p between a and b, smoothed
export const smooth = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

// True once the element comes within `margin` of the viewport (used to lazy-load chapters)
export function useNear(ref: RefObject<Element>, margin = '150% 0px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}

// Calls `cb(progress)` on every animation frame while scrolling, where progress is how far
// a tall "pinned" section has scrolled past (0 when its top hits the viewport top,
// 1 when its bottom reaches the viewport bottom). Writes go straight to the DOM in `cb`.
export function useScrollProgress(ref: RefObject<HTMLElement>, cb: (p: number) => void) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      cbRef.current(span > 0 ? clamp(-r.top / span) : r.top < 0 ? 1 : 0);
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    req();
    return () => {
      window.removeEventListener('scroll', req);
      window.removeEventListener('resize', req);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

const jsonCache = new Map<string, unknown>();

// Fetches JSON once enabled; refetches when the url changes (cached per url)
export function useJson<T>(url: string, enabled: boolean): T | null {
  const [got, setGot] = useState<{ url: string; data: T } | null>(() =>
    jsonCache.has(url) ? { url, data: jsonCache.get(url) as T } : null,
  );
  const have = got?.url === url;
  useEffect(() => {
    if (!enabled || have) return;
    if (jsonCache.has(url)) return setGot({ url, data: jsonCache.get(url) as T });
    let alive = true;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        jsonCache.set(url, d);
        if (alive) setGot({ url, data: d });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url, enabled, have]);
  return have ? got!.data : null;
}

// Loads a list of images; returns the HTMLImageElements (entries are null until loaded)
export function useFrames(urls: string[], enabled: boolean) {
  const [frames, setFrames] = useState<(HTMLImageElement | null)[]>(() => urls.map(() => null));
  const [loaded, setLoaded] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const out: (HTMLImageElement | null)[] = urls.map(() => null);
    let count = 0;
    urls.forEach((u, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!alive) return;
        out[i] = img;
        count++;
        setLoaded(count);
        setFrames([...out]);
      };
      img.src = u;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, urls.join('|')]);
  return { frames, loaded };
}

// Most recent tap/click position, used as the origin of the ripple transitions
export const lastPointer = { x: -1, y: -1 };
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
    },
    { passive: true },
  );
}

// Runs 0 → 1 over `ms` once the element is at least `threshold` visible (once only).
// Returns 1 straight away with reduced motion.
export function usePlayOnView(ref: RefObject<Element>, ms: number, threshold = 0.45, delay = 0) {
  const reduced = useReducedMotion();
  const [k, setK] = useState(0);
  useEffect(() => {
    if (reduced) return setK(1);
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let timer = 0;
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          const t0 = performance.now();
          const tick = (t: number) => {
            const v = clamp((t - t0) / ms);
            setK(v);
            if (v < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [ref, ms, threshold, delay, reduced]);
  return k;
}
