import { forwardRef, useEffect, useRef } from 'react';
import './dna.css';
import { ASSET, frameUrls } from './hooks';
import { ScrubCanvas } from './ScrubCanvas';
import { Ripple } from './Ripple';
import { EncoderChapter } from './EncoderChapter';
import { DenoiseSlider } from './DenoiseSlider';
import { ArchitectureChapter } from './ArchitectureChapter';
import { AnswerKeyChapter } from './AccuracyChapter';
import { GeneHeatmaps } from './GeneHeatmaps';
import { MouseChapter } from './MouseChapter';
import { WhichIsReal } from './WhichIsReal';
import { MusicToggle } from './MusicToggle';

// Credit line for the background track, shown in the footer once a track is added.
// Fill in when a licensed track (CC0 / royalty-free / CC-BY) has been chosen.
const MUSIC_CREDIT = '';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap';
const PAGE_BG = '#14120F';

const DENOISE = frameUrls('denoise');

function useFonts() {
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
function usePageShell(bg: string) {
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

export function DnaStory({ onBack }: { onBack: () => void }) {
  useFonts();
  usePageShell(PAGE_BG);
  const titleRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="d2d">
      {/* shared filters: a light roughen for poster headings */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
        <filter id="d2d-rough" x="-2%" y="-5%" width="104%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="d2d-grain" aria-hidden />

      <div className="topbar">
        <a
          href="/"
          className="stamp"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          ← Portfolio
        </a>
        <MusicToggle />
      </div>

      <main>
        {/* 0 · Cold open */}
        <section aria-labelledby="d2d-title" style={{ position: 'relative' }}>
          <ScrubCanvas
            frames={DENOISE}
            load
            heightVh={320}
            startCover
            cutout={`${ASSET}denoise/cutout_bg.png`}
            endFraction={0.66}
            endOffset={-0.08}
            label="Random noise gradually denoising into a maize root cross-section generated from DNA"
            backdrop={<ColdBackdrop ref={backdropRef} />}
            // one swipe plays the whole denoise, from the title to the finished root
            stops={[0, 1]}
            stepMs={2600}
            onProgress={(p) => {
              // abstract shapes come up while the root's background is cut away (steps 33 to 44)
              const el = backdropRef.current;
              if (el) {
                const k = Math.max(0, Math.min(1, (p - 0.45) / 0.24));
                el.style.opacity = String(k * k * (3 - 2 * k));
                el.style.setProperty('--k', String(k));
              }
              if (titleRef.current) {
                titleRef.current.style.opacity = String(Math.max(0, 1 - p / 0.3));
                titleRef.current.style.transform = `translateY(${-p * 80}px)`;
              }
              if (endRef.current) {
                const k = Math.max(0, Math.min(1, (p - 0.78) / 0.18));
                endRef.current.style.opacity = String(k);
                endRef.current.style.transform = `translateY(${(1 - k) * 24}px)`;
              }
            }}
          >
            <div
              ref={titleRef}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 18px',
                textAlign: 'center',
                background: 'radial-gradient(ellipse at center, rgb(var(--bg-rgb) / .6), transparent 72%)',
              }}
            >
              <h1 id="d2d-title" style={{ margin: 0, textShadow: '0 4px 30px rgb(var(--bg-rgb) / .7)' }}>
                DNA to
                <br />
                Display
              </h1>
              <p className="pull" style={{ fontSize: 'clamp(1.25rem, 4.2vw, 1.9rem)', margin: '14px auto 0', maxWidth: '26ch', textShadow: '0 2px 18px rgb(var(--bg-rgb))' }}>
                Generating images of anatomy directly from DNA.
              </p>
            </div>
            <div
              ref={endRef}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: '48px 18px max(28px, 5vh)',
                textAlign: 'center',
                opacity: 0,
                background: 'linear-gradient(transparent, rgb(var(--bg-rgb) / .9) 38%)',
              }}
            >
              <p className="poster-font" style={{ fontSize: 'clamp(1.6rem, 5.6vw, 3rem)', lineHeight: 1.05, margin: '0 0 10px', filter: 'var(--head-filter)' }}>
                This root was never photographed.
              </p>
              <p className="pull" style={{ fontSize: 'clamp(1.1rem, 3.4vw, 1.45rem)', margin: '0 auto', maxWidth: '40ch', lineHeight: 1.35 }}>
                A maize root cross-section, drawn by an AI from nothing but the plant's DNA. The model never saw this plant during
                training.
              </p>
            </div>
          </ScrubCanvas>
        </section>

        {/* 1 · Why it matters */}
        <Ripple className="ch field-gold" id="d2d-why" ariaLabelledby="d2d-why-h">
          <div className="wrap">
            <span className="kicker">01 · Why it matters</span>
            <h2 id="d2d-why-h">
              An image, <span className="underline-stroke">not just a number</span>
            </h2>
            <div className="two-col" style={{ alignItems: 'start' }}>
              <div>
                <p>
                  Breeders predict traits from DNA every day. But genomic prediction gives back one number per trait, and only
                  for traits you decided to measure in advance.
                </p>
                <p>
                  <b>The idea:</b> predict the whole image instead. Then any trait can be measured on it later, including traits
                  nobody planned for.
                </p>
                <p>
                  <b>Why roots:</b> root anatomy (vessels, cortex, air channels) shapes how a plant handles drought and
                  nutrients, and imaging it means cutting and photographing thousands of roots by hand.
                </p>
              </div>
              <div style={{ display: 'grid', gap: 30 }}>
                <ComparisonRow label="Genomic prediction">
                  <div
                    className="mono"
                    style={{ border: '2px solid var(--ink)', padding: '14px 16px', fontSize: 18, fontWeight: 500, transform: 'rotate(calc(var(--tilt) * -1deg))', whiteSpace: 'nowrap', borderRadius: 4 }}
                  >
                    stele = 0.95 mm
                  </div>
                  <span className="scrawl ink">
                    one number, planned ahead
                  </span>
                </ComparisonRow>
                <ComparisonRow label="DNA to Display" nowrap>
                  <img
                    src={`${ASSET}denoise/step_50.webp`}
                    alt="A root cross-section generated from the plant's DNA"
                    loading="lazy"
                    style={{ width: THUMB, height: THUMB, objectFit: 'cover', boxShadow: '0 0 0 2px var(--ink)', borderRadius: 4, flexShrink: 0 }}
                  />
                  <Arrow />
                  <figure style={{ margin: 0, flexShrink: 0, position: 'relative' }}>
                    <img
                      src={`${ASSET}pipeline/gen_root_measured.webp`}
                      alt="The same generated root, segmented: root, stele and 14 vessels outlined so they can be measured"
                      loading="lazy"
                      style={{ width: THUMB, height: THUMB, objectFit: 'cover', boxShadow: '0 0 0 2px var(--ink)', borderRadius: 4 }}
                    />
                    <figcaption className="scrawl ink" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, whiteSpace: 'nowrap' }}>
                      measure anything
                    </figcaption>
                  </figure>
                </ComparisonRow>
              </div>
            </div>
          </div>
        </Ripple>

        {/* 2 · Reading the genome */}
        <EncoderChapter />

        {/* 3 · Learning to see */}
        <Ripple className="ch field-blue" id="d2d-see" ariaLabelledby="d2d-see-h">
          <div className="wrap">
            <span className="kicker">03 · Learning to see</span>
            <h2 id="d2d-see-h">Compress the picture first</h2>
            <p style={{ maxWidth: 620 }}>
              Before it generates anything, the model learns a compressed code for root images, 48× smaller than the image
              itself. Generating in that code is fast enough to run on a laptop.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'clamp(16px, 4vw, 40px)', marginTop: 36, alignItems: 'start' }}>
              {[
                { src: 'real_root.png', cap: 'real image', note: '3 × 256 × 256', rot: -2 },
                { src: 'wavelets.png', cap: 'wavelet bands', note: 'fixed transform', rot: 1.5 },
                { src: 'latent.png', cap: 'compressed code', note: '4 × 32 × 32 · 48× smaller', rot: -1, pix: true },
                { src: 'recon_root.png', cap: 'rebuilt image', note: 'decoded back', rot: 2 },
              ].map((s, i, arr) => (
                <figure key={s.src} className="tilt" style={{ margin: 0, position: 'relative', ['--r' as string]: `${s.rot}deg` }}>
                  <div className="plate">
                    <img src={`${ASSET}pipeline/${s.src}`} alt={s.cap} loading="lazy" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', imageRendering: s.pix ? 'pixelated' : 'auto' }} />
                  </div>
                  <figcaption style={{ marginTop: 10 }}>
                    <span className="poster-font" style={{ fontSize: 19 }}>{s.cap}</span>
                    <br />
                    <span className="mono" style={{ opacity: 0.8 }}>
                      {s.note}
                    </span>
                  </figcaption>
                  {i < arr.length - 1 && (
                    <span aria-hidden style={{ position: 'absolute', right: -24, top: '38%', fontSize: '1.8rem', opacity: 0.8, color: 'var(--gold)' }}>
                      →
                    </span>
                  )}
                </figure>
              ))}
            </div>
            <span className="scrawl" style={{ marginTop: 34 }}>
              the encoder compresses it, the decoder rebuilds it
            </span>
          </div>
        </Ripple>

        {/* 4 · How the models fit together */}
        <ArchitectureChapter />

        {/* 5 · Denoising slider */}
        <DenoiseSlider />

        {/* 5 · Known-answer test on the synthetic (RIL) population, with the gene dial */}
        <AnswerKeyChapter />

        {/* 6 · Where each gene shows up: heat maps on generated RIL roots */}
        <GeneHeatmaps />

        {/* 7 · Mouse */}
        <Ripple>
          <MouseChapter />
        </Ripple>

        {/* 8 · Game */}
        <Ripple>
          <WhichIsReal />
        </Ripple>

        {/* 9 · Close */}
        <section className="ch field-gold" aria-labelledby="d2d-close-h">
          <div className="wrap narrow">
            <span className="kicker">10 · That's the story</span>
            <h2 id="d2d-close-h" className="visually-hidden">
              Summary and credits
            </h2>
            <p className="pull" style={{ fontSize: 'clamp(1.8rem, 5.5vw, 3rem)', maxWidth: '22ch' }}>
              From DNA to an image you can measure, for traits you haven't thought of yet, in a plant root or a mouse.
            </p>
            <div style={{ marginTop: 40 }}>
              <p style={{ fontSize: 20, marginBottom: 6 }}>
                <b>Tyler Mitts</b>¹ · Jagdeep Sidhu¹ · Erik Amezquita¹ · Mo Akbar²
              </p>
              <p className="mono" style={{ margin: 0 }}>¹University of Missouri, Columbia, MO</p>
              <p className="mono">²Levity Turtle LLC</p>
              <p style={{ marginTop: 20 }}>
                <b>Acknowledgments:</b> Ruairidh Sawers (Penn State), Sergio Perez-Limon (Penn State / NC State), Alejandra Rougon
                (UNAM)
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <a className="stamp" href={`${ASSET}reference/poster.png`} target="_blank" rel="noopener noreferrer">
                See the poster ↗
              </a>
              <a className="stamp" href="mailto:tmitts0206@gmail.com">
                Email Tyler
              </a>
              <a className="stamp" href="https://www.linkedin.com/in/tyler-mitts-a67658375/" target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
              <a
                className="stamp"
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
              >
                More of my work
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '28px 20px 40px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <img src={`${ASSET}brand/mu_mark_reversed.png`} alt="University of Missouri" loading="lazy" style={{ height: 52, width: 'auto' }} />
        <span className="mono" style={{ opacity: 0.6 }}>
          tylermitts.com/dna-to-display{MUSIC_CREDIT ? ` · music: ${MUSIC_CREDIT}` : ''}
        </span>
      </footer>
    </div>
  );
}

// thumbnails shrink on phones so the DNA to Display row (3 images, 2 arrows) fits on one line
const THUMB = 'clamp(64px, 19vw, 96px)';

function ComparisonRow({ label, nowrap, children }: { label: string; nowrap?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono" style={{ fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 12px)', flexWrap: nowrap ? 'nowrap' : 'wrap', marginBottom: nowrap ? 30 : 0 }}>
        <img
          src={`${ASSET}pipeline/genotype.png`}
          alt="The plant's genotype"
          loading="lazy"
          style={{ width: THUMB, height: `calc(${THUMB} * 0.77)`, objectFit: 'cover', boxShadow: '0 0 0 2px var(--ink)', borderRadius: 4, flexShrink: 0, alignSelf: 'center' }}
        />
        <Arrow />
        {children}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 40 18" aria-hidden style={{ flexShrink: 0, width: 'clamp(26px, 8vw, 40px)', height: 'auto', alignSelf: 'center' }}>
      <path d="M2 10 C 12 7, 22 12, 34 9" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M27 3 L 36 9 L 28 15" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One gold zig-zag behind the cut-out root: left, right, left, right, left, from the top of
// the root to the bottom, with uneven reach and spacing so it isn't symmetrical. It draws itself
// in from top to bottom as the root forms (driven by --k from the scroll position).
const ColdBackdrop = forwardRef<HTMLDivElement>(function ColdBackdrop(_, ref) {
  return (
    <div ref={ref} className="cold-backdrop" aria-hidden>
      <svg viewBox="-20 -20 140 140" width="100%" height="100%">
        <polyline
          className="cb-zig"
          points="4,4 96,22 2,50 94,74 6,96"
          pathLength={1}
          fill="none"
          stroke="#F1B82D"
          strokeWidth="6"
          strokeLinejoin="miter"
          strokeLinecap="square"
          strokeMiterlimit={12}
        />
      </svg>
    </div>
  );
});
