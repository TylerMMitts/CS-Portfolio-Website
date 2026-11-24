import { ReactNode, useEffect, useRef } from 'react';
import { clamp, lastPointer, useReducedMotion } from './hooks';

// "Denoising ripple": as this section scrolls in, it resolves out of noise inside a growing
// circular wavefront that starts from the visitor's last tap/click (or the centre).
// Lightweight, no WebGL: a radial mask on the section plus a grain ring at the front.
export function Ripple({ children, className, id, ariaLabelledby }: { children: ReactNode; className?: string; id?: string; ariaLabelledby?: string }) {
  const ref = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const front = frontRef.current;
    if (!el || !front) return;
    let raf = 0;
    const setMask = (m: string) => {
      el.style.maskImage = m;
      el.style.webkitMaskImage = m;
    };
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section's top touches the bottom of the screen, 1 when it reaches the top
      const p = clamp((vh - r.top) / (vh * 0.9));
      if (reduced) {
        el.style.opacity = String(0.2 + 0.8 * p);
        front.style.opacity = '0';
        return;
      }
      if (p >= 1 || r.top > vh) {
        setMask(p >= 1 ? 'none' : 'linear-gradient(transparent, transparent)');
        front.style.opacity = '0';
        return;
      }
      const x = lastPointer.x >= 0 ? lastPointer.x - r.left : r.width / 2;
      const maxR = Math.hypot(Math.max(x, r.width - x), vh) * 1.08;
      const R = maxR * (1 - Math.pow(1 - p, 2));
      const wv = Math.max(40, vh * 0.12);
      setMask(`radial-gradient(circle at ${x}px 0px, #000 ${Math.max(0, R - wv)}px, rgba(0,0,0,.45) ${R}px, transparent ${R + wv}px)`);
      const ring = `radial-gradient(circle at ${x}px 0px, transparent ${Math.max(0, R - wv * 1.3)}px, #000 ${R}px, transparent ${R + wv * 1.3}px)`;
      front.style.maskImage = ring;
      front.style.webkitMaskImage = ring;
      front.style.opacity = String(0.9 * (1 - p * 0.6));
      front.style.backgroundPosition = `${(Math.random() * 180) | 0}px ${(Math.random() * 180) | 0}px`;
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
  }, [reduced]);

  return (
    <section ref={ref} className={className} id={id} aria-labelledby={ariaLabelledby} style={{ position: 'relative' }}>
      <div ref={frontRef} className="ripple-front" aria-hidden />
      {children}
    </section>
  );
}
