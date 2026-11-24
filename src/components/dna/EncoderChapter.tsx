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

type Rect = [number, number, number, number];
const lerpRect = (a: Rect, b: Rect, t: number): Rect => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];

// Draws the whole encoder animation for progress p (0..1). Pure, so the
// reduced-motion version can render still panels from the same code.
//   1  the SNP strip
//   2  cut into 50 windows, which lift apart into a grid
//   3  each window becomes 4 numbers (times its gate)
//   4  the windows line up; PCA of the whole genome gives 32 more numbers
//   5  all of it is joined end to end: 32 + 50 x 4 = 232 numbers
//   6  a small network turns the list into 8 tokens of 256 numbers
function drawEncoder(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, time: number, raw: EncoderData, d: Prepared, overlays = true) {
  ctx.clearRect(0, 0, w, h);
  readTheme(ctx.canvas);
  const mono = getComputedStyle(ctx.canvas).getPropertyValue('--f-mono') || 'monospace';
  ctx.font = `12px ${mono}`;
  const mx = Math.max(16, w * 0.05);
  const fullW = Math.min(w - mx * 2, 1000);
  const x0 = (w - fullW) / 2;
  const n = raw.n_snps;
  const nw = raw.windows.length;
  const nf = raw.window_dim;
  const npc = raw.pcs.length;

  const split = smooth(p, 0.1, 0.24); // strip -> grid of windows
  const feat = smooth(p, 0.27, 0.4); // window barcode -> 4 numbers
  const line = smooth(p, 0.42, 0.52); // grid -> one row
  const pca = smooth(p, 0.5, 0.62); // whole genome -> 32 PCs
  const cat = smooth(p, 0.65, 0.77); // join into one list
  const tok = smooth(p, 0.81, 0.94); // -> tokens

  // drawing area between the stage text (top) and the legend (bottom)
  const top = overlays ? Math.min(h * 0.42, Math.max(240, h * 0.31)) : 12;
  const bottom = overlays ? h - Math.max(80, h * 0.11) : h - 12;
  const avail = bottom - top;

  // stage 1: the strip
  const bandH = Math.min(avail * 0.3, 140);
  const bandY = top + avail * 0.3 - bandH / 2;
  const stripRect = (i: number): Rect => [
    x0 + (raw.windows[i].a / n) * fullW,
    bandY,
    ((raw.windows[i].b - raw.windows[i].a + 1) / n) * fullW,
    bandH,
  ];
  // stage 2: grid of windows (5 per row on phones, 10 on wide screens)
  const C = fullW < 600 ? 5 : 10;
  const R = Math.ceil(nw / C);
  const g = Math.max(6, fullW * 0.014);
  const tileW = (fullW - g * (C - 1)) / C;
  const gridH = Math.min(avail * 0.62, R * 60);
  const tileH = (gridH - g * (R - 1)) / R;
  const gridRect = (i: number): Rect => [x0 + (i % C) * (tileW + g), top + Math.floor(i / C) * (tileH + g), tileW, tileH];
  // stage 3: a column of 4 numbers inside each tile
  const colInTile = (i: number): Rect => {
    const r = gridRect(i);
    const cw = Math.min(tileW * 0.34, 22);
    return [r[0] + (r[2] - cw) / 2, r[1] + r[3] * 0.08, cw, r[3] * 0.84];
  };
  // stage 4: one row of 50 columns
  const rg = Math.max(2, fullW * 0.005);
  const segW = (fullW - rg * (nw - 1)) / nw;
  const rowH = Math.min(avail * 0.24, 96);
  const rowY = top + avail * 0.08;
  const colInRow = (i: number): Rect => [x0 + i * (segW + rg), rowY, segW, rowH];
  // PCs below the row
  const pcW = Math.min(fullW, 520);
  const px0 = (w - pcW) / 2;
  const bw = pcW / npc;
  const pcMid = rowY + rowH + Math.min(avail * 0.3, 120);
  const pcH = Math.min(avail * 0.13, 50);
  // stage 5: one list of 232 cells
  const total = npc + nw * nf;
  const vw = fullW / total;
  const vecH = Math.min(avail * 0.16, 64);
  const vecY = top + avail * 0.36 - vecH / 2 - tok * avail * 0.2;
  const vecCell = (j: number): Rect => [x0 + j * vw, vecY, Math.max(1, vw), vecH];

  // window position at the current stage
  const winRect = (i: number) => (split < 1 ? lerpRect(stripRect(i), gridRect(i), split) : gridRect(i));

  // 1 + 2: barcode, moving from the strip into the grid
  if (feat < 1) {
    raw.windows.forEach((win, i) => {
      const [rx, ry, rw, rh] = winRect(i);
      const len = win.b - win.a + 1;
      const cols = Math.max(1, Math.round(rw));
      ctx.globalAlpha = 1 - feat;
      for (let c = 0; c < cols; c++) {
        // one SNP per column (a sample): averaging neighbours would blur 0s and 2s into grey
        const v = d.dos[Math.min(n - 1, win.a + Math.floor(((c + 0.5) / cols) * len))];
        ctx.fillStyle = dosageColor(v < 0 ? 1 : v);
        ctx.fillRect(rx + (c / cols) * rw, ry, Math.ceil(rw / cols) + 0.5, rh);
      }
      if (overlays && split > 0.6 && tileW > 44) {
        ctx.globalAlpha = (split - 0.6) * 2.5 * (1 - feat) * 0.85;
        ctx.fillStyle = rgb(FG);
        ctx.textAlign = 'left';
        ctx.fillText(`w${i + 1}`, rx + 3, ry - 4);
      }
    });
    // chromosome ticks under the strip
    if (overlays && split < 1) {
      ctx.fillStyle = rgb(FG);
      ctx.textAlign = 'left';
      d.chrStarts.forEach((c, k) => {
        const x = x0 + (c.at / n) * fullW;
        ctx.globalAlpha = (1 - split) * 0.7;
        ctx.fillRect(x, bandY + bandH + 4, 1, 8);
        if (fullW > 420 || k % 2 === 0) ctx.fillText(`chr ${c.chr}`, x + 3, bandY + bandH + 22);
      });
    }
  }

  // 3 + 4: 4 numbers per window (each times its gate), then the windows line up
  const cellOf = (i: number, k: number): Rect => {
    const col = line > 0 ? lerpRect(colInTile(i), colInRow(i), line) : colInTile(i);
    const ch = (col[3] - (nf - 1) * 2) / nf;
    return [col[0], col[1] + k * (ch + 2), col[2], ch];
  };
  if (feat > 0 && tok < 1) {
    raw.windows.forEach((win, i) => {
      for (let k = 0; k < nf; k++) {
        const r = cat > 0 ? lerpRect(cellOf(i, k), vecCell(npc + i * nf + k), cat) : cellOf(i, k);
        ctx.globalAlpha = feat * (1 - tok);
        ctx.fillStyle = diverge((d.feat[i][k] / d.featMax) * 1.4);
        ctx.fillRect(r[0], r[1], r[2], r[3]);
      }
      // gate: a dot above the column, filled by how open it is
      if (cat < 1) {
        const c0 = cellOf(i, 0);
        const rad = Math.max(1.8, Math.min(5, c0[2] * 0.35));
        ctx.globalAlpha = feat * (1 - cat);
        ctx.beginPath();
        ctx.arc(c0[0] + c0[2] / 2, c0[1] - rad - 5, rad, 0, Math.PI * 2);
        ctx.strokeStyle = rgb(FG);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = feat * (1 - cat) * win.gate;
        ctx.fillStyle = rgb(GOLD);
        ctx.fill();
      }
    });
  }

  // 4: PCA of the whole genome: a faint full strip condenses into 32 bars
  if (pca > 0 && tok < 1) {
    if (pca < 1) {
      ctx.globalAlpha = Math.sin(pca * Math.PI) * 0.6;
      const cols = Math.round(fullW / 2);
      for (let c = 0; c < cols; c++) {
        const v = d.dos[Math.floor(((c + 0.5) / cols) * n)];
        ctx.fillStyle = dosageColor(v < 0 ? 1 : v);
        const wcol = lerp(fullW / cols, 0.5, pca);
        ctx.fillRect(lerp(x0 + c * (fullW / cols), w / 2, pca * 0.8), pcMid - pcH, wcol + 0.5, pcH * 2);
      }
    }
    raw.pcs.forEach((v, i) => {
      const grow = smooth(pca, 0.35 + (i / npc) * 0.4, 1);
      const len = (v / d.pcMax) * pcH * grow;
      const bar: Rect = [px0 + i * bw, len >= 0 ? pcMid - len : pcMid, Math.max(1, bw * 0.7), Math.abs(len)];
      const r = cat > 0 ? lerpRect(bar, vecCell(i), cat) : bar;
      ctx.globalAlpha = grow * (1 - tok);
      ctx.fillStyle = cat > 0.5 ? diverge((v / d.pcMax) * 1.4) : v >= 0 ? rgb(GOLD) : rgb(BLUE);
      ctx.fillRect(r[0], r[1], r[2], r[3]);
    });
    if (overlays && cat < 1) {
      ctx.globalAlpha = pca * (1 - cat) * 0.85;
      ctx.fillStyle = rgb(FG);
      ctx.textAlign = 'center';
      ctx.fillText('whole genome → PCA → 32 numbers', w / 2, pcMid + pcH + 20);
    }
  }

  // 5: labels under the joined list
  if (overlays && cat > 0 && tok < 1) {
    ctx.globalAlpha = cat * (1 - tok) * 0.85;
    ctx.fillStyle = rgb(FG);
    ctx.strokeStyle = rgb(FG);
    ctx.lineWidth = 1;
    const y = vecY + vecH + 10;
    const seg = (a: number, b: number, label: string) => {
      ctx.beginPath();
      ctx.moveTo(a + 1, y);
      ctx.lineTo(a + 1, y + 5);
      ctx.lineTo(b - 1, y + 5);
      ctx.lineTo(b - 1, y);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(label, (a + b) / 2, y + 22);
    };
    seg(x0, x0 + npc * vw, '32 PCs');
    seg(x0 + npc * vw, x0 + fullW, '50 windows × 4 = 200');
    ctx.font = `600 14px ${mono}`;
    ctx.fillText(`${total} numbers`, w / 2, vecY - 12);
    ctx.font = `12px ${mono}`;
  }

  // 6: a small network turns the list into 8 x 256 tokens, gently pulsing
  if (tok > 0) {
    if (overlays && tok < 0.7) {
      ctx.globalAlpha = Math.sin((tok / 0.7) * Math.PI) * 0.9;
      ctx.fillStyle = rgb(FG);
      ctx.textAlign = 'center';
      ctx.fillText('↓ small neural network (MLP) ↓', w / 2, top + avail * 0.36);
    }
    const gridW2 = Math.min(fullW, 1000);
    const gx0 = (w - gridW2) / 2;
    const cell = gridW2 / 256;
    const rowGap = Math.max(4, h * 0.012);
    const gH = Math.min(avail * 0.55, 340);
    const th = (gH - rowGap * 7) / 8;
    const gy0 = top + avail * 0.42;
    const pulse = p >= 0.94 ? 1 : 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 256; c++) {
        const appear = smooth(tok, 0.2 + (c / 256) * 0.45, 0.2 + (c / 256) * 0.45 + 0.35);
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
    body: 'Each SNP is a spot where plants differ, written as 0, 1 or 2 copies of one version. Any genotyped population can be written this way.',
  },
  { at: 0.11, title: 'Cut into 50 windows', body: 'The SNPs are cut, in genome order, into 50 windows of 200 neighbours. No window crosses a chromosome.' },
  {
    at: 0.27,
    title: '4 numbers per window',
    body: "Each window has its own small learned map to 4 numbers, and a gate (the dot) that shuts it if it doesn't help. Here 49 of 50 stay open.",
  },
  {
    at: 0.47,
    title: '32 PCs for relatedness',
    body: 'Separately, principal components of the whole genome give 32 numbers that capture how this line is related to the others.',
  },
  { at: 0.64, title: 'Joined into one list', body: 'The 32 PCs and the 50 × 4 window numbers are joined end to end: 232 numbers.' },
  { at: 0.8, title: '8 tokens × 256 numbers', body: 'A small neural network turns those 232 numbers into the 8 tokens the image model reads.' },
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
          <p className="pull">10,000 SNPs become 8 tokens of 256 numbers. The image model reads these at every step.</p>
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
    <div ref={trackRef} className="pin-track" style={{ height: '600vh' }}>
      <div className="pin">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Animation: one line's 10,000 SNPs as a coloured strip, cut into 50 windows of 200 that separate into a grid; each window becomes 4 numbers behind a gate; PCA of the whole genome gives 32 more; all 232 numbers are joined into one list, and a small neural network turns it into 8 tokens of 256 numbers."
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div style={{ position: 'absolute', left: 20, right: 20, top: 'max(70px, 7vh)', maxWidth: 560, marginInline: 'auto' }}>
          {STAGES.map((s, i) => (
            <div key={s.title} ref={(el) => (stageRefs.current[i] = el)} style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : 0, transition: 'opacity 0.35s' }}>
              <span className="mono" style={{ color: 'var(--accent)' }}>
                Step {i + 1} of {STAGES.length}
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
  const ps = [0.05, 0.25, 0.41, 0.62, 0.78, 1];
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
