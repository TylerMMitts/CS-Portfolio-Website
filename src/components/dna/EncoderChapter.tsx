import { useEffect, useMemo, useRef } from 'react';
import { ASSET, lerp, smooth, useJson, useNear, useReducedMotion, useScrollProgress } from './hooks';

// Real values for one line of the synthetic (RIL) population, from the trained window encoder:
// its SNP dosages, the 50 windows of 200 SNPs with each window's 4 learned features and gate,
// the 32 genome-wide PCs, and the 8 x 256 tokens the image model reads.
interface EncoderData {
  line: string;
  n_snps: number;
  window_size: number;
  n_pcs: number;
  window_dim: number;
  dosage: string; // one character per SNP: 0, 1, 2 (or - for missing)
  windows: { a: number; b: number; chr: number; gate: number; f: number[] }[];
  pcs: number[];
  tokens: number[][];
}

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const GOLD = hexRgb('#F1B82D');
const BLUE = hexRgb('#4E7BE8');
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;
// Colours follow the page: the diverging scale fades into the page background.
let BASE = [20, 18, 15];
let FG = [241, 230, 204];
function readTheme(el: Element) {
  const cs = getComputedStyle(el);
  const parse = (v: string) => v.trim().split(/\s+/).map(Number);
  const bg = parse(cs.getPropertyValue('--bg-rgb'));
  const fg = parse(cs.getPropertyValue('--fg-rgb'));
  if (bg.length === 3 && bg.every((n) => !Number.isNaN(n))) BASE = bg;
  if (fg.length === 3 && fg.every((n) => !Number.isNaN(n))) FG = fg;
}
// diverging blue <-> background <-> gold
const diverge = (t: number) => rgb(t < 0 ? mix(BASE, BLUE, Math.min(1, -t)) : mix(BASE, GOLD, Math.min(1, t)));
// dosage 0 = blue, 1 = text colour, 2 = gold; a binned average blends between them
const dosageColor = (m: number) => rgb(m <= 1 ? mix(BLUE, FG, m) : mix(FG, GOLD, m - 1));

interface Prepared {
  dos: Float32Array; // -1 = missing
  feat: number[][]; // window features after the gate
  featMax: number;
  pcMax: number;
  tokMax: number;
  chrStarts: { chr: number; at: number }[];
}

function prepare(d: EncoderData): Prepared {
  const dos = Float32Array.from(d.dosage, (ch) => (ch === '-' ? -1 : Number(ch)));
  const feat = d.windows.map((w) => w.f.map((v) => v * w.gate));
  let featMax = 0;
  feat.forEach((r) => r.forEach((v) => (featMax = Math.max(featMax, Math.abs(v)))));
  let tokMax = 0;
  d.tokens.forEach((r) => r.forEach((v) => (tokMax = Math.max(tokMax, Math.abs(v)))));
  const chrStarts: { chr: number; at: number }[] = [];
  d.windows.forEach((w) => {
    if (!chrStarts.length || chrStarts[chrStarts.length - 1].chr !== w.chr) chrStarts.push({ chr: w.chr, at: w.a });
  });
  return { dos, feat, featMax, pcMax: Math.max(...d.pcs.map(Math.abs)), tokMax, chrStarts };
}

// Draws the whole encoder animation for progress p (0..1). Pure, so the
// reduced-motion version can render still panels from the same code.
function drawEncoder(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, time: number, raw: EncoderData, d: Prepared, overlays = true) {
  ctx.clearRect(0, 0, w, h);
  readTheme(ctx.canvas);
  const mx = Math.max(16, w * 0.05);
  const fullW = Math.min(w - mx * 2, 1000);
  const x0 = (w - fullW) / 2;
  const n = raw.n_snps;
  const nw = raw.windows.length;

  const split = smooth(p, 0.16, 0.34); // strip -> 50 windows
  const squeeze = smooth(p, 0.42, 0.6); // windows -> 4 numbers each (+ PCs)
  const tok = smooth(p, 0.72, 0.9); // -> 8 x 256 tokens

  // drawing area between the stage text (top) and the legend (bottom)
  const top = overlays ? Math.min(h * 0.42, Math.max(230, h * 0.3)) : 12;
  const bottom = overlays ? h - Math.max(80, h * 0.11) : h - 12;
  const avail = bottom - top;
  const mid = top + avail * 0.42;
  const bandH = Math.min(avail * 0.34, 150);
  const bandY = mid - bandH / 2;

  // window layout: gaps open up between windows as `split` grows
  const gap = Math.max(2, fullW * 0.006) * split;
  const segW = (fullW - gap * (nw - 1)) / nw;
  const winX = (i: number) => x0 + i * (segW + gap);

  // 1 + 2: dosage barcode, then cut into windows
  if (squeeze < 1) {
    ctx.globalAlpha = 1 - squeeze;
    raw.windows.forEach((win, i) => {
      const len = win.b - win.a + 1;
      const xs = winX(i);
      const cols = Math.max(1, Math.round(segW)); // about one column per pixel
      for (let c = 0; c < cols; c++) {
        // one SNP per column (a sample): averaging neighbours would blur 0s and 2s into grey
        const v = d.dos[Math.min(n - 1, win.a + Math.floor(((c + 0.5) / cols) * len))];
        ctx.fillStyle = dosageColor(v < 0 ? 1 : v);
        ctx.fillRect(xs + (c / cols) * segW, bandY, Math.ceil(segW / cols) + 0.5, bandH);
      }
    });
    // chromosome ticks under the strip
    if (overlays || split < 0.5) {
      ctx.fillStyle = rgb(FG);
      ctx.font = `12px ${getComputedStyle(ctx.canvas).getPropertyValue('--f-mono') || 'monospace'}`;
      ctx.textAlign = 'left';
      d.chrStarts.forEach((c, k) => {
        const wi = raw.windows.findIndex((x) => x.a === c.at);
        const x = winX(wi);
        ctx.globalAlpha = (1 - squeeze) * 0.7;
        ctx.fillRect(x, bandY + bandH + 4, 1, 8);
        if (fullW > 420 || k % 2 === 0) ctx.fillText(`chr ${c.chr}`, x + 3, bandY + bandH + 22);
      });
    }
  }

  // 3: each window -> 4 numbers (scaled by its gate), plus 32 PCs underneath
  if (squeeze > 0 && tok < 1) {
    const fade = squeeze * (1 - tok);
    const cellH = lerp(bandH, bandH / raw.window_dim, squeeze) * 0.92;
    const colH = cellH * raw.window_dim + (raw.window_dim - 1) * 2;
    const cy0 = mid - colH / 2;
    raw.windows.forEach((win, i) => {
      const xs = winX(i);
      for (let k = 0; k < raw.window_dim; k++) {
        ctx.globalAlpha = fade;
        ctx.fillStyle = diverge((d.feat[i][k] / d.featMax) * 1.4);
        ctx.fillRect(xs, cy0 + k * (cellH + 2), segW, cellH);
      }
      // gate: a dot above the column, filled by how open it is
      ctx.globalAlpha = fade;
      const r = Math.max(2, Math.min(5, segW * 0.35));
      ctx.beginPath();
      ctx.arc(xs + segW / 2, cy0 - r - 6, r, 0, Math.PI * 2);
      ctx.strokeStyle = rgb(FG);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = fade * win.gate;
      ctx.fillStyle = rgb(GOLD);
      ctx.fill();
    });
    // 32 PCs as bars around their own midline
    const pcW = Math.min(fullW, 520);
    const px0 = (w - pcW) / 2;
    const bw = pcW / raw.pcs.length;
    const pcMid = cy0 + colH + Math.min(avail * 0.24, 90);
    const pcH = Math.min(avail * 0.16, 60);
    raw.pcs.forEach((v, i) => {
      const grow = smooth(squeeze, 0.4 + (i / raw.pcs.length) * 0.3, 1);
      const len = (v / d.pcMax) * pcH * grow;
      ctx.globalAlpha = fade * grow;
      ctx.fillStyle = v >= 0 ? rgb(GOLD) : rgb(BLUE);
      ctx.fillRect(px0 + i * bw, len >= 0 ? pcMid - len : pcMid, Math.max(1, bw * 0.7), Math.abs(len));
    });
    if (overlays) {
      ctx.globalAlpha = fade * 0.8;
      ctx.fillStyle = rgb(FG);
      ctx.textAlign = 'center';
      ctx.fillText('32 PCs: how this line is related to the others', w / 2, pcMid + pcH + 18);
    }
  }

  // 4: 8 x 256 tokens, diverging colour, gently pulsing
  if (tok > 0) {
    const gridW = Math.min(fullW, 1000);
    const gx0 = (w - gridW) / 2;
    const cell = gridW / 256;
    const rowGap = Math.max(4, h * 0.012);
    const gridH = Math.min(avail * 0.85, 420);
    const th = (gridH - rowGap * 7) / 8;
    const gy0 = top + (avail - gridH) / 2;
    const pulse = p >= 0.9 ? 1 : 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 256; c++) {
        const appear = smooth(tok, (c / 256) * 0.6, (c / 256) * 0.6 + 0.4);
        if (appear <= 0) continue;
        let v = raw.tokens[r][c] / d.tokMax;
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
  {
    at: 0,
    title: '10,000 SNPs',
    body: "Each SNP is a spot where plants differ, written as 0, 1 or 2 copies of one version. Any genotyped population can be written this way.",
  },
  { at: 0.25, title: '50 windows of 200', body: 'The SNPs are cut, in genome order, into windows of 200 neighbours. No window crosses a chromosome.' },
  {
    at: 0.5,
    title: '4 numbers per window',
    body: "Each window has its own learned map to 4 numbers, and a gate that shuts it if it doesn't help. Here 49 of 50 stay open. 32 PCs of the whole genome add how lines are related.",
  },
  { at: 0.8, title: '8 tokens × 256 numbers', body: 'A small network turns all of it into the tokens the image model reads.' },
];

function useEncoderData(enabled: boolean) {
  const raw = useJson<EncoderData>(`${ASSET}encoder/encoder_windows.json`, enabled);
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
          <h2 id="d2d-encoder-h">
            The DNA becomes <span className="underline-stroke">tokens</span>
          </h2>
          <p>
            The model can't read DNA letters directly. So a plant's genome goes through four steps. These are the real
            values for one line of our synthetic population, {raw?.line ?? 'G0819'}, from the trained model.
          </p>
        </div>
      </div>
      {prepared && raw ? reduced ? <EncoderStills d={prepared} raw={raw} /> : <EncoderScroll d={prepared} raw={raw} /> : <div style={{ height: '100vh' }} />}
      <div className="ch" style={{ paddingTop: '4vh' }}>
        <div className="wrap narrow">
          <p className="pull">“10,000 SNPs → 8 tokens of 256 numbers. The image model reads these at every step.”</p>
        </div>
      </div>
    </section>
  );
}

function Legend() {
  const items: [string, string][] = [
    ['0 copies', '#4E7BE8'],
    ['1 copy', 'var(--fg)'],
    ['2 copies', '#F1B82D'],
  ];
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }} aria-label="SNP colours">
      {items.map(([label, c]) => (
        <li key={label} className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 14 }}>
          <span aria-hidden style={{ width: 14, height: 14, background: c, display: 'inline-block', borderRadius: 2 }} />
          {label}
        </li>
      ))}
      <li className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontSize: 14 }}>
        <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: '#F1B82D', border: '1px solid var(--fg)', display: 'inline-block' }} />
        gate open
      </li>
    </ul>
  );
}

function EncoderScroll({ d, raw }: { d: Prepared; raw: EncoderData }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progress = useRef(0);
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
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawEncoder(ctx, w, h, progress.current, time / 1000, raw, d);
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
          aria-label="Animation: one line's 10,000 SNPs as a coloured strip, cut into 50 windows of 200, each window reduced to 4 numbers behind a gate alongside 32 genome-wide PCs, then turned into 8 tokens of 256 numbers."
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div style={{ position: 'absolute', left: 20, right: 20, top: 'max(70px, 7vh)', maxWidth: 560, marginInline: 'auto' }}>
          {STAGES.map((s, i) => (
            <div key={s.title} ref={(el) => (stageRefs.current[i] = el)} style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : 0, transition: 'opacity 0.35s' }}>
              <span className="mono" style={{ color: 'var(--accent)' }}>
                Step {i + 1} of 4
              </span>
              <h3 style={{ margin: '4px 0 6px' }}>{s.title}</h3>
              <p style={{ margin: 0, maxWidth: 460 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'max(24px, 5vh)', maxWidth: 1000, marginInline: 'auto' }}>
          <Legend />
        </div>
      </div>
    </div>
  );
}

// Reduced motion: the same drawing, as four still panels
function EncoderStills({ d, raw }: { d: Prepared; raw: EncoderData }) {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  const ps = [0.05, 0.38, 0.66, 1];
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
      drawEncoder(ctx, w, h, ps[i], 0, raw, d, false);
    });
  }, [d, raw]);
  return (
    <div className="ch" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="wrap" style={{ display: 'grid', gap: 24 }}>
        {STAGES.map((s, i) => (
          <figure key={s.title} style={{ margin: 0 }} className="card">
            <canvas ref={(el) => (refs.current[i] = el)} role="img" aria-label={`${s.title}: ${s.body}`} style={{ width: '100%', height: 240, display: 'block' }} />
            <figcaption>
              <span className="mono" style={{ color: 'var(--accent)' }}>
                Step {i + 1} · {s.title}
              </span>
              <p style={{ margin: '4px 0 0' }}>{s.body}</p>
            </figcaption>
          </figure>
        ))}
        <Legend />
      </div>
    </div>
  );
}
