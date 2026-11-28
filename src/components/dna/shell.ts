import { useEffect } from 'react';

// Shared by the story and the d2d page: fonts and the page shell outside the portfolio theme.

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap';

export function useFonts() {
  useEffect(() => {
    if (document.getElementById('d2d-fonts')) return;
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = 'https://fonts.gstatic.com';
    pre.crossOrigin = '';
    const link = document.createElement('link');
    link.id = 'd2d-fonts';
    link.rel = 'stylesheet';
    link.href = FONTS;
    document.head.append(pre, link);
  }, []);
}

// The page lives outside the portfolio's theme while mounted:
// - paint the overscroll area ink
// - the portfolio's global CSS pins html/body to 100% height with their own scrollbars,
//   which makes <body> the scroller; switch back to normal window scrolling so the
//   scroll-driven scenes, sticky pins and iOS Safari's toolbar behave.
export function usePageShell(bg: string) {
  useEffect(() => {
    const els = [document.documentElement, document.body];
    const saved = els.map((el) => el.getAttribute('style'));
    els.forEach((el) => {
      el.style.background = bg;
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    });
    return () => {
      els.forEach((el, i) => (saved[i] === null ? el.removeAttribute('style') : el.setAttribute('style', saved[i]!)));
    };
  }, [bg]);
}
