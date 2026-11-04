import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideViewerProps {
  slides: string[];
  title: string;
  accent: string;
}

// Shows one slide at a time, scaled to fit the available space in full.
// Navigate with the arrow buttons, keyboard arrows, clicking the slide, or swiping.
export function SlideViewer({ slides, title, accent }: SlideViewerProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const last = slides.length - 1;

  const go = (next: number) => setIndex(Math.max(0, Math.min(last, next)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setIndex(i => Math.min(last, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'Home') {
        setIndex(0);
      } else if (e.key === 'End') {
        setIndex(last);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [last]);

  // Preload the neighbouring slides so flipping feels instant
  useEffect(() => {
    [index + 1, index + 2, index - 1].forEach(i => {
      if (i >= 0 && i <= last) {
        const img = new Image();
        img.src = slides[i];
      }
    });
  }, [index, last, slides]);

  const navButton = (dir: -1 | 1) => {
    const disabled = dir === -1 ? index === 0 : index === last;
    const Icon = dir === -1 ? ChevronLeft : ChevronRight;
    return (
      <button
        onClick={(e) => { e.stopPropagation(); go(index + dir); }}
        disabled={disabled}
        aria-label={dir === -1 ? 'Previous slide' : 'Next slide'}
        className="rounded-full pixel-border bg-cream/90 text-deep-slate"
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.35 : 1,
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 0 }}>
      <div
        style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: index < last ? 'pointer' : 'default' }}
        onClick={() => go(index + 1)}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        <img
          src={slides[index]}
          alt={`${title}, slide ${index + 1} of ${slides.length}`}
          className="pixel-border rounded-lg"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            aspectRatio: '16 / 9',
            objectFit: 'contain',
            background: '#0b1020',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 10, flexShrink: 0 }}>
        {navButton(-1)}
        <span className="text-deep-slate" style={{ fontSize: '0.85rem', minWidth: 64, textAlign: 'center' }}>
          {index + 1} / {slides.length}
        </span>
        {navButton(1)}
      </div>
      <div
        aria-hidden
        style={{ height: 3, marginTop: 8, background: 'rgba(61,64,91,0.12)', borderRadius: 2, flexShrink: 0 }}
      >
        <div style={{ height: '100%', width: `${((index + 1) / slides.length) * 100}%`, background: accent, borderRadius: 2, transition: 'width 0.2s' }} />
      </div>
    </div>
  );
}
