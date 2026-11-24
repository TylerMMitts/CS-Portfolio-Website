import { useRef, useState } from 'react';
import { ASSET, clamp, frameUrls, lerp, smooth, useFrames, useNear, useReducedMotion, useScrollProgress } from './hooks';

const LATENT = frameUrls('latent');

// The four models and how data moves between them, as one tall diagram. While the
// section is pinned, a "camera" (the SVG viewBox) follows the data from the DNA to the
// measured image, and each model lights up as it does its job.
const STAGES = [
  {
    at: 0,
    focus: [0, 230],
    title: 'SNP encoder',
    body: 'Turns the genome into 8 DNA tokens (chapter 02). It is trained together with the U-Net, so it learns which parts of the DNA matter for the picture.',
  },
  {
    at: 0.18,
    focus: [150, 560],
    title: 'Denoising U-Net',
    body: 'Generation starts from random noise in the compressed code. Fifty times over, the U-Net predicts a cleaner code. Inside it, cross-attention lets every part of the picture look up the DNA tokens, so the genome steers every step.',
  },
  {
    at: 0.5,
    focus: [470, 800],
    title: 'Image decoder',
    body: 'The decoder half of the autoencoder from chapter 03 turns the finished code back into a full root image.',
  },
  {
    at: 0.67,
    focus: [760, 1040],
    title: 'Segmentation model',
    body: 'A separate model (YOLO) outlines the root, the stele and every vessel, so traits are measured on a generated image the same way as on a photograph.',
  },
  {
    at: 0.86,
    focus: [0, 1040],
    title: 'Four models, one pipeline',
    body: 'DNA in, a measurable picture out. Only the first two ever see the DNA. In training, real roots are compressed, noise is added, and the U-Net learns to recover the clean code given the plant’s DNA.',
  },
];

const W = 400;
const GOLD = '#F1B82D';
const BLUE = '#4E7BE8';

function activeStage(p: number) {
  return STAGES.reduce((acc, s, i) => (p >= s.at ? i : acc), 0);
}

// camera window for progress p, easing between stage focuses
function focusAt(p: number): [number, number] {
  const i = activeStage(p);
  const s = STAGES[i];
  const next = STAGES[i + 1];
  const cur = s.focus as [number, number];
  if (!next) return cur;
  // move to the next stage's focus over the last 30% of this stage
  const t = smooth(p, lerp(s.at, next.at, 0.7), next.at);
  return [lerp(cur[0], next.focus[0], t), lerp(cur[1], next.focus[1], t)];
}

export function ArchitectureChapter() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  useFrames(LATENT, near);
  const reduced = useReducedMotion();
  const [p, setP] = useState(0);
  useScrollProgress(trackRef, (v) => setP((old) => (Math.abs(old - v) > 0.001 || v === 0 || v === 1 ? v : old)));
  const P = reduced ? 1 : p;

  const stage = activeStage(P);
  const local = (i: number) => clamp((P - STAGES[i].at) / ((STAGES[i + 1]?.at ?? 1) - STAGES[i].at));
  const seen = (i: number) => (P >= STAGES[i].at ? 1 : 0);
  const on = (i: number) => stage === i || stage === 4;

  // camera: keep the container's aspect so the focus fills it
  const box = boxRef.current;
  const aspect = box ? box.clientHeight / Math.max(1, box.clientWidth) : 1.4;
  const [f0, f1] = reduced ? [0, 1040] : focusAt(P);
  const vh = Math.max(f1 - f0, W * aspect);
  const vy = (f0 + f1) / 2 - vh / 2;

  // denoising steps run during the U-Net stage
  const step = stage < 1 ? 0 : stage > 1 ? 50 : Math.round(50 * smooth(local(1), 0.05, 0.95));
  const pulse = (step % 1) + ((local(1) * 50) % 1); // position of the signal inside the U for this step
  const uBlock = Math.floor(pulse * 7) % 7;

  // a dot travelling along a list of points, t in 0..1
  const along = (pts: [number, number][], t: number) => {
    const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
    const u = t * (pts.length - 1) - seg;
    return [lerp(pts[seg][0], pts[seg + 1][0], u), lerp(pts[seg][1], pts[seg + 1][1], u)];
  };
  const dot0 = along(
    [
      [200, 44],
      [200, 74],
      [200, 120],
      [200, 146],
    ],
    smooth(local(0), 0.1, 0.8),
  );
  const dot2 = along(
    [
      [200, 520],
      [200, 560],
      [200, 600],
      [200, 630],
    ],
    smooth(local(2), 0.05, 0.6),
  );
  const dot3 = along(
    [
      [200, 770],
      [200, 800],
      [200, 840],
      [200, 870],
    ],
    smooth(local(3), 0.05, 0.55),
  );

  const nodeStyle = (i: number) => ({
    stroke: on(i) ? GOLD : 'rgb(var(--fg-rgb) / .35)',
    strokeWidth: on(i) ? 2.5 : 1.5,
    fill: on(i) ? 'rgb(241 184 45 / .12)' : 'rgb(var(--fg-rgb) / .04)',
    transition: 'stroke .3s, fill .3s',
  });

  const diagram = (
    <svg
      viewBox={`0 ${vy} ${W} ${vh}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Diagram: DNA goes through the SNP encoder into 8 tokens; the denoising U-Net turns noise into a clean compressed code over 50 steps, reading the tokens through cross-attention; the image decoder turns the code into a root image; a segmentation model outlines root, stele and vessels so traits can be measured."
      style={{ display: 'block', color: 'var(--fg)', fontFamily: 'var(--f-mono)' }}
    >
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* DNA */}
      <g>
        {Array.from({ length: 64 }, (_, i) => (
          <rect key={i} x={40 + i * 5} y={20} width={5} height={24} fill={[GOLD, BLUE, GOLD, BLUE, BLUE, GOLD, 'var(--fg)'][(i * 7 + (i >> 2)) % 7]} opacity={0.9} />
        ))}
        <text x={40} y={14} fontSize="11" fill="currentColor" opacity={0.8}>
          genotype · 10,000 SNPs
        </text>
      </g>
      <line x1={200} y1={46} x2={200} y2={72} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.6} />

      {/* SNP encoder */}
      <rect x={100} y={74} width={200} height={46} rx={8} style={nodeStyle(0)} />
      <text x={200} y={95} textAnchor="middle" fontSize="15" fontWeight={600} fill="currentColor" style={{ fontFamily: 'var(--f-poster)' }}>
        SNP encoder
      </text>
      <text x={200} y={111} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity={0.75}>
        windows + PCs → MLP
      </text>
      <line x1={200} y1={121} x2={200} y2={144} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.6} />

      {/* tokens */}
      <g>
        {Array.from({ length: 8 }, (_, r) => (
          <rect
            key={r}
            x={140}
            y={148 + r * 5.5}
            width={120 * (seen(0) ? smooth(local(0), 0.45 + r * 0.04, 0.75 + r * 0.03) || (stage > 0 ? 1 : 0) : 0)}
            height={4}
            fill={r % 2 ? BLUE : GOLD}
            opacity={0.9}
          />
        ))}
        <text x={268} y={172} fontSize="11" fill="currentColor" opacity={0.8}>
          8 DNA tokens
        </text>
      </g>

      {/* cross-attention: tokens into the U-Net */}
      <path
        d="M200 194 C 200 215, 200 225, 200 250"
        fill="none"
        stroke={on(1) ? GOLD : 'currentColor'}
        strokeWidth={on(1) ? 2.2 : 1.5}
        strokeDasharray="5 4"
        markerEnd="url(#arch-arrow)"
        className={on(1) && !reduced ? 'arch-flow' : undefined}
        style={{ color: on(1) ? GOLD : undefined }}
        opacity={0.85}
      />
      <text x={210} y={226} fontSize="11" fill={on(1) ? GOLD : 'currentColor'} opacity={0.9}>
        cross-attention
      </text>

      {/* U-Net */}
      <rect x={40} y={252} width={320} height={168} rx={10} style={nodeStyle(1)} />
      <text x={56} y={274} fontSize="15" fontWeight={600} fill="currentColor" style={{ fontFamily: 'var(--f-poster)' }}>
        Denoising U-Net
      </text>
      {/* the U: down blocks, bottleneck, up blocks, with skip connections */}
      {[
        [70, 290, 40, 22],
        [95, 320, 40, 20],
        [120, 350, 40, 18],
        [180, 375, 40, 16],
        [240, 350, 40, 18],
        [265, 320, 40, 20],
        [290, 290, 40, 22],
      ].map(([x, y, w, hh], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={hh}
          rx={3}
          fill={stage === 1 && uBlock === i ? GOLD : 'rgb(var(--fg-rgb) / .18)'}
          style={{ transition: 'fill .12s' }}
        />
      ))}
      {[
        [110, 301, 290, 301],
        [135, 330, 265, 330],
        [160, 359, 240, 359],
      ].map(([a, y, b], i) => (
        <line key={i} x1={a} y1={y} x2={b} y2={y} stroke="currentColor" strokeDasharray="2 4" opacity={0.35} />
      ))}
      <text x={200} y={410} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.6}>
        down · bottleneck · up, with skip connections
      </text>

      {/* the latent code, looping through the U-Net */}
      <path d="M150 470 C 20 470, 20 300, 40 300" fill="none" stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.55} />
      <path d="M200 421 L200 438" stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.55} />
      <image href={LATENT[step]} x={160} y={440} width={80} height={80} style={{ imageRendering: 'pixelated' }} />
      <rect x={160} y={440} width={80} height={80} fill="none" stroke="currentColor" opacity={0.4} />
      <text x={250} y={470} fontSize="11" fill="currentColor" opacity={0.85}>
        compressed code
      </text>
      <text x={250} y={486} fontSize="11" fill={GOLD}>
        step {step} / 50
      </text>
      <text x={14} y={392} fontSize="10.5" fill="currentColor" opacity={0.7} transform="rotate(-90 14 392)">
        × 50 steps
      </text>
      <line x1={200} y1={521} x2={200} y2={558} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.6} />

      {/* decoder */}
      <rect x={100} y={560} width={200} height={42} rx={8} style={nodeStyle(2)} />
      <text x={200} y={580} textAnchor="middle" fontSize="15" fontWeight={600} fill="currentColor" style={{ fontFamily: 'var(--f-poster)' }}>
        Image decoder
      </text>
      <text x={200} y={595} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity={0.75}>
        code → full image
      </text>
      <line x1={200} y1={603} x2={200} y2={628} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.6} />
      <rect x={130} y={630} width={140} height={140} fill="#000" />
      <image href={`${ASSET}denoise/step_50.webp`} x={130} y={630} width={140} height={140} opacity={stage >= 2 ? smooth(local(2), 0.4, 0.8) || (stage > 2 ? 1 : 0) : 0} />
      <text x={278} y={700} fontSize="11" fill="currentColor" opacity={0.85}>
        root image
      </text>
      <line x1={200} y1={771} x2={200} y2={798} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.6} />

      {/* segmentation */}
      <rect x={100} y={800} width={200} height={42} rx={8} style={nodeStyle(3)} />
      <text x={200} y={820} textAnchor="middle" fontSize="15" fontWeight={600} fill="currentColor" style={{ fontFamily: 'var(--f-poster)' }}>
        Segmentation model
      </text>
      <text x={200} y={835} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity={0.75}>
        YOLO · root, stele, vessels
      </text>
      <line x1={200} y1={843} x2={200} y2={868} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arch-arrow)" opacity={0.6} />
      <rect x={60} y={870} width={150} height={150} fill="#000" />
      <image
        href={`${ASSET}pipeline/gen_root_measured.webp`}
        x={60}
        y={870}
        width={150}
        height={150}
        opacity={stage >= 3 ? smooth(local(3), 0.35, 0.75) || (stage > 3 ? 1 : 0) : 0}
      />
      <g opacity={stage >= 3 ? smooth(local(3), 0.55, 0.9) || (stage > 3 ? 1 : 0) : 0} fontSize="11.5" fill="currentColor">
        <text x={224} y={900} fill={GOLD}>
          measure:
        </text>
        <text x={224} y={920}>stele width</text>
        <text x={224} y={938}>vessels: 14</text>
        <text x={224} y={956}>cortex width</text>
        <text x={224} y={974}>air channels</text>
        <text x={224} y={992} opacity={0.7}>
          …anything you can outline
        </text>
      </g>

      {/* travelling data */}
      {!reduced && stage === 0 && <circle cx={dot0[0]} cy={dot0[1]} r={5} fill={GOLD} />}
      {!reduced && stage === 2 && <circle cx={dot2[0]} cy={dot2[1]} r={5} fill={GOLD} />}
      {!reduced && stage === 3 && <circle cx={dot3[0]} cy={dot3[1]} r={5} fill={GOLD} />}
    </svg>
  );

  return (
    <section ref={ref} id="d2d-arch" aria-labelledby="d2d-arch-h">
      <div className="ch" style={{ paddingBottom: '4vh' }}>
        <div className="wrap narrow">
          <span className="kicker">04 · How the pieces fit</span>
          <h2 id="d2d-arch-h">Four models, working together</h2>
          <p>Follow one plant's DNA through the whole system, from genome to a picture you can measure.</p>
        </div>
      </div>

      <div ref={trackRef} className="pin-track" style={{ height: reduced ? 'auto' : '520vh' }}>
        <div className={reduced ? undefined : 'pin'}>
          <div className="arch-layout">
            <div className="arch-text" aria-live="polite">
              {STAGES.map((s, i) => (
                <div key={s.title} className="arch-stage" style={{ opacity: reduced || i === stage ? 1 : 0, position: reduced ? 'static' : undefined }}>
                  <span className="mono" style={{ color: 'var(--accent)' }}>
                    {i < 4 ? `Model ${i + 1} of 4` : 'All together'}
                  </span>
                  <h3 style={{ margin: '4px 0 6px' }}>{s.title}</h3>
                  <p style={{ margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>
            <div ref={boxRef} className="arch-diagram">
              {diagram}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
