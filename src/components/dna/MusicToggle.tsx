import { useEffect, useRef, useState } from 'react';
import { ASSET } from './hooks';

// Background music: OFF by default, fades over ~1.5 s, remembers mute per visitor,
// pauses when the tab is hidden. The toggle only appears once a licensed track has been
// added at public/d2d/audio/loop.mp3 (see MUSIC_CREDIT in DnaStory for the footer credit).
export const MUSIC_SRC = `${ASSET}audio/loop.mp3`;
const KEY = 'd2d-music-on';
const FADE_MS = 1500;
const VOLUME = 0.35;

const read = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
const write = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage blocked: fine, just don't remember */
  }
};

export function MusicToggle() {
  const [available, setAvailable] = useState(false);
  const [on, setOn] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef(0);

  // Show the toggle only if the track exists (an HTML fallback page doesn't count)
  useEffect(() => {
    fetch(MUSIC_SRC, { method: 'HEAD' })
      .then((r) => setAvailable(r.ok && (r.headers.get('content-type') || '').startsWith('audio')))
      .catch(() => {});
  }, []);

  const rampTo = (target: number, then?: () => void) => {
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(fade.current);
    const from = a.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / FADE_MS);
      a.volume = from + (target - from) * k;
      if (k < 1) fade.current = requestAnimationFrame(step);
      else then?.();
    };
    fade.current = requestAnimationFrame(step);
  };

  const start = () => {
    if (!audio.current) {
      audio.current = new Audio(MUSIC_SRC);
      audio.current.loop = true;
      audio.current.volume = 0;
    }
    audio.current.play().then(() => rampTo(VOLUME)).catch(() => setOn(false));
  };
  const stop = () => rampTo(0, () => audio.current?.pause());

  const toggle = () => {
    const next = !on;
    setOn(next);
    write(next);
    next ? start() : stop();
  };

  // A returning visitor who left music on: resume on their first tap
  // (browsers block audio before a user gesture). Muted visitors stay muted.
  useEffect(() => {
    if (!available || !read()) return;
    const resume = (e: PointerEvent) => {
      window.removeEventListener('pointerdown', resume);
      if ((e.target as Element | null)?.closest('[data-music]')) return; // the toggle handles itself
      setOn(true);
      start();
    };
    window.addEventListener('pointerdown', resume);
    return () => window.removeEventListener('pointerdown', resume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  useEffect(() => {
    const vis = () => {
      if (!audio.current) return;
      if (document.hidden) audio.current.pause();
      else if (on) audio.current.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [on]);

  useEffect(() => () => audio.current?.pause(), []);

  if (!available) return null;
  return (
    <button className="stamp" data-music onClick={toggle} aria-pressed={on} aria-label={on ? 'Turn music off' : 'Turn music on'} title="Music">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" />
        {on ? (
          <>
            <path d="M15.5 9c1.2 1.6 1.2 4.4 0 6" />
            <path d="M18 6.5c2.6 3 2.6 8 0 11" />
          </>
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
    </button>
  );
}
