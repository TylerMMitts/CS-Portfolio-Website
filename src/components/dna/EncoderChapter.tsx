import { useEffect, useMemo, useRef } from 'react';
import { ASSET, lerp, smooth, useJson, useNear, useReducedMotion, useScrollProgress } from './hooks';

interface EncoderData {
  genotype: string;
  n_loci: number;
  founders: number[];
  founder_share: Record<string, number>;
  codes_base64_uint8: string;
  pca_scores: number[];
  tokens: number[][];
  steps: string[];
}

// One colour per founder line: gold, blue, cream and five muted print-ink tones
export const FOUNDER_COLORS = ['#F1B82D', '#4E7BE8', '#F1E6CC', '#C8553D', '#7E9A62', '#B07AA1', '#5FA3A3', '#A9875A'];

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const INK = hexRgb('#0E0D0B');
const GOLD = hexRgb('#F1B82D');
const BLUE = hexRgb('#4E7BE8');
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
// Canvas colours follow the page theme: the diverging scale fades into the page background,
// and the cream founder colour becomes the text colour (so it shows on a light page too).
let BASE = INK;
const FC = [...FOUNDER_COLORS];
function readTheme(el: Element) {
  const cs = getComputedStyle(el);
  const bg = cs.getPropertyValue('--bg-rgb').trim().split(/\s+/).map(Number);
  if (bg.length === 3 && bg.every((n) => !Number.isNaN(n))) BASE = bg;
  FC[2] = cs.getPropertyValue('--fg').trim() || FOUNDER_COLORS[2];
}
// diverging blue <-> background <-> gold
const diverge = (t: number) => {
  const c = t < 0 ? mix(BASE, BLUE, Math.min(1, -t)) : mix(BASE, GOLD, Math.min(1, t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

interface Prepared {
  codes: Uint8Array;
  pca: number[];
  pcaMax: number;
  tokens: number[][];
  tokMax: number;
}

function prepare(d: EncoderData): Prepared {
  const codes = Uint8Array.from(atob(d.codes_base64_uint8), (c) => c.charCodeAt(0));
  const pcaMax = Math.max(...d.pca_scores.map(Math.abs));
  let tokMax = 0;
  d.tokens.forEach((row) => row.forEach((v) => (tokMax = Math.max(tokMax, Math.abs(v)))));
  return { codes, pca: d.pca_scores, pcaMax, tokens: d.tokens, tokMax };
}

// Bin the markers to `cols` screen columns: per column, the share of each founder
function binCodes(codes: Uint8Array, cols: number) {
  const out: Float32Array[] = [];
  const per = codes.length / cols;
  for (let c = 0; c < cols; c++) {
    const a = Math.floor(c * per);
    const b = Math.max(a + 1, Math.floor((c + 1) * per));
    const counts = new Float32Array(8);
    for (let i = a; i < b; i++) counts[codes[i] - 1]++;
    for (let f = 0; f < 8; f++) counts[f] /= b - a;
    out.push(counts);
  }
  return out;
}

// Draws the whole encoder animation for progress p (0..1). Pure, so the
// reduced-motion version can render still panels from the same code.
function drawEncoder(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, time: number, d: Prepared, bins: Float32Array[], overlays = true) {
  ctx.clearRect(0, 0, w, h);
  readTheme(ctx.canvas);
  const mx = Math.max(16, w * 0.05);
  const fullW = w - mx * 2;
  const cols = bins.length;

  const split = smooth(p, 0.08, 0.3); // barcode -> 8 one-hot rows
  const squeeze = smooth(p, 0.38, 0.62); // rows -> 168 PCA bars
  const tok = smooth(p, 0.7, 0.9); // bars -> 8 x 256 token grid

  // drawing area between the stage text (top) and the founder legend (bottom)
  const top = overlays ? Math.min(h * 0.4, Math.max(200, h * 0.27)) : 12;
  // the founder legend wraps to three lines on phones
  const bottom = overlays ? h - (w < 600 ? 135 : Math.max(70, h * 0.1)) : h - 12;
  const avail = bottom - top;
  const mid = (top + bottom) / 2;
  const bandH = avail * 0.3;
  const bandY = mid - bandH / 2;
  const rowsTop = top;
  const rowH = avail / 8;

  // 1 + 2: barcode, then separating into colour layers
  if (squeeze < 1) {
    const regionW = lerp(fullW, fullW * 0.06, squeeze);
    const x0 = (w - regionW) / 2;
    const cw = regionW / cols;
    ctx.globalAlpha = 1 - squeeze;
    if (split < 1) {
      ctx.globalAlpha = (1 - split) * (1 - squeeze);
      for (let c = 0; c < cols; c++) {
        let best = 0;
        for (let f = 1; f < 8; f++) if (bins[c][f] > bins[c][best]) best = f;
        ctx.fillStyle = FC[best];
        ctx.fillRect(x0 + c * cw, bandY, Math.ceil(cw), bandH);
      }
    }
    if (split > 0) {
      for (let f = 0; f < 8; f++) {
        const y = lerp(bandY, rowsTop + f * rowH, split);
        const hh = lerp(bandH, rowH * 0.78, split);
        ctx.fillStyle = FC[f];
        for (let c = 0; c < cols; c++) {
          const v = bins[c][f];
          if (v <= 0) continue;
          ctx.globalAlpha = split * (1 - squeeze) * (0.15 + 0.85 * v);
          ctx.fillRect(x0 + c * cw, y, Math.ceil(cw), hh);
        }
      }
    }
  }

  // 3: 168 PCA scores as bars around the midline
  const nBars = d.pca.length;
  const barsW = Math.min(fullW, 900);
  const bx0 = (w - barsW) / 2;
  const bw = barsW / nBars;
  if (squeeze > 0 && tok < 1) {
    for (let i = 0; i < nBars; i++) {
      const v = d.pca[i] / d.pcaMax;
      // bars spring out of the squeezed stripe at the centre
      const grow = smooth(squeeze, 0.2 + (Math.abs(i - nBars / 2) / nBars) * 0.5, 1);
      const len = v * avail * 0.48 * grow;
      const x = lerp(w / 2, bx0 + i * bw, grow);
      ctx.globalAlpha = (1 - tok) * grow;
      ctx.fillStyle = v >= 0 ? '#F1B82D' : '#4E7BE8';
      ctx.fillRect(x, len >= 0 ? mid - len : mid, Math.max(1, bw * 0.7), Math.abs(len));
    }
  }

  // 4: 8 x 256 tokens, diverging colour, gently pulsing
  if (tok > 0) {
    const gridW = Math.min(fullW, 1000);
    const gx0 = (w - gridW) / 2;
    const cell = gridW / 256;
    const rowGap = Math.max(4, h * 0.012);
    const gridH = avail * 0.92;
    const th = (gridH - rowGap * 7) / 8;
    const gy0 = mid - gridH / 2;
    const pulse = p >= 0.9 ? 1 : 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 256; c++) {
        const appear = smooth(tok, (c / 256) * 0.6, (c / 256) * 0.6 + 0.4);
        if (appear <= 0) continue;
        let v = d.tokens[r][c] / d.tokMax;
        if (pulse) v *= 0.75 + 0.25 * Math.sin(time * 2.2 - c * 0.09 + r * 0.7);
        ctx.globalAlpha = appear;
        ctx.fillStyle = diverge(v * 1.6);
        ctx.fillRect(gx0 + c * cell, gy0 + r * (th + rowGap), Math.ceil(cell), th);
      }
    }
  }
  ctx.globalAlpha = 1;
}

const STAGES = [
  { at: 0, title: '43,788 markers', body: 'Each marker says which of 8 founder lines that stretch of DNA came from.' },
  { at: 0.3, title: 'One-hot', body: 'The barcode separates into 8 layers, one per founder, like a printing plate.' },
  { at: 0.55, title: '168 PCA scores', body: 'The layers are squeezed into 168 numbers.' },
  { at: 0.82, title: '8 tokens × 256 numbers', body: 'A small network turns them into the tokens the image model reads.' },
];

function useEncoderData(enabled: boolean) {
  const raw = useJson<EncoderData>(`${ASSET}encoder/encoder.json`, enabled);
  const prepared = useMemo(() => (raw ? prepare(raw) : null), [raw]);
  return { raw, prepared };
}

export function EncoderChapter() {
  const outerRef = useRef<HTMLDivElement>(null);
  const near = useNear(outerRef);
  const reduced = useReducedMotion();
  const { raw, prepared } = useEncoderData(near);

  return (
    <section ref={outerRef} id="d2d-encoder" aria-labelledby="d2d-encoder-h">
      <div className="ch" style={{ paddingBottom: '4vh' }}>
        <div className="wrap narrow">
          <span className="kicker">02 · Reading the genome</span>
          <h2 id="d2d-encoder-h">The DNA becomes <span className="underline-stroke">tokens</span></h2>
          <p>
            The model can't read DNA letters directly. So the genome of the hero plant, {raw?.genotype ?? 'MEMA042'},
            goes through four steps. These are its real values.
          </p>
        </div>
      </div>
      {prepared && raw ? (
        reduced ? <EncoderStills d={prepared} raw={raw} /> : <EncoderScroll d={prepared} raw={raw} />
      ) : (
        <div style={{ height: '100vh' }} />
      )}
      <div className="ch" style={{ paddingTop: '4vh' }}>
        <div className="wrap narrow">
          <p className="pull">
            “43,788 markers → 8 tokens of 256 numbers. The image model reads these at every step.”
          </p>
        </div>
      </div>
    </section>
  );
}

function Legend({ raw }: { raw: EncoderData }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }} aria-label="Founder lines and their share of this plant's DNA">
      {raw.founders.map((f, i) => (
        <li key={f} className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 16 }}>
          <span aria-hidden style={{ width: 14, height: 14, background: i === 2 ? 'var(--fg)' : FOUNDER_COLORS[i], display: 'inline-block', borderRadius: 2 }} />
          F{f} {Math.round(raw.founder_share[String(f)] * 100)}%
        </li>
      ))}
    </ul>
  );
}

function EncoderScroll({ d, raw }: { d: Prepared; raw: EncoderData }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progress = useRef(0);
  const binsRef = useRef<{ cols: number; bins: Float32Array[] } | null>(null);
  const visible = useRef(false);

  const render = (time: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const cols = Math.round(Math.max(16, w - Math.max(16, w * 0.05) * 2));
    if (!binsRef.current || binsRef.current.cols !== cols) binsRef.current = { cols, bins: binCodes(d.codes, cols) };
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawEncoder(ctx, w, h, progress.current, time / 1000, d, binsRef.current.bins);
  };

  useScrollProgress(trackRef, (p) => {
    progress.current = p;
    const active = STAGES.reduce((acc, s, i) => (p >= s.at ? i : acc), 0);
    stageRefs.current.forEach((el, i) => {
      if (el) el.style.opacity = i === active ? '1' : '0';
    });
    render(performance.now());
  });

  // keep the tokens pulsing while the scene is on screen
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(el);
    let raf = 0;
    const loop = (t: number) => {
      if (visible.current && progress.current >= 0.9) render(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={trackRef} className="pin-track" style={{ height: '420vh' }}>
      <div className="pin">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Animation: the plant's 43,788 DNA markers as a coloured barcode, separating into 8 founder layers, squeezing into 168 PCA scores, then reshaping into 8 tokens of 256 numbers."
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div style={{ position: 'absolute', left: 20, right: 20, top: 'max(70px, 7vh)', maxWidth: 560 }}>
          {STAGES.map((s, i) => (
            <div
              key={s.title}
              ref={(el) => (stageRefs.current[i] = el)}
              style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : 0, transition: 'opacity 0.35s' }}
            >
              <span className="mono" style={{ color: 'var(--accent)' }}>
                Step {i + 1} of 4
              </span>
              <h3 style={{ margin: '4px 0 6px' }}>{s.title}</h3>
              <p style={{ margin: 0, maxWidth: 420 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'max(24px, 5vh)' }}>
          <Legend raw={raw} />
        </div>
      </div>
    </div>
  );
}

// Reduced motion: the same drawing, as four still panels
function EncoderStills({ d, raw }: { d: Prepared; raw: EncoderData }) {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  const ps = [0.02, 0.32, 0.64, 1];
  useEffect(() => {
    refs.current.forEach((c, i) => {
      if (!c) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      const ctx = c.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawEncoder(ctx, w, h, ps[i], 0, d, binCodes(d.codes, Math.round(w * 0.9)), false);
    });
  }, [d]);
  return (
    <div className="ch" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="wrap" style={{ display: 'grid', gap: 24 }}>
        {STAGES.map((s, i) => (
          <figure key={s.title} style={{ margin: 0 }} className="card">
            <canvas
              ref={(el) => (refs.current[i] = el)}
              role="img"
              aria-label={`${s.title}: ${s.body}`}
              style={{ width: '100%', height: 220, display: 'block' }}
            />
            <figcaption>
              <span className="mono" style={{ color: 'var(--accent)' }}>
                Step {i + 1} · {s.title}
              </span>
              <p style={{ margin: '4px 0 0' }}>{s.body}</p>
            </figcaption>
          </figure>
        ))}
        <Legend raw={raw} />
      </div>
    </div>
  );
}

