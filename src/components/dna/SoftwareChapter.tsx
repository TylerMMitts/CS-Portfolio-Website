import { useRef, useState } from 'react';
import { ASSET, useJson, useNear } from './hooks';

// Chapter 09: d2d, the software around the model. AI agents make the judgement calls when
// setting up a new image + genotype dataset; code does everything else.

interface Stage {
  stage: string;
  title: string;
  does: string;
  status: 'done' | 'pending';
  decided_by: string;
  result: string;
}
interface Setup {
  image_width_px: number;
  images: number;
  median_mouse_size_px: number;
  scale_factor: number;
  raw: string;
  prepared: string;
}
interface Drift {
  size_by_setup: Setup[];
  brightness_by_month: { month: string; images: number; subject_brightness: number; background_brightness: number }[];
}

const A = `${ASSET}agents/`;
const BASE = 560; // bar axis start, so the 1.2x difference is visible

const SCREENS = [
  ['01_pipeline', 'The pipeline, stage by stage, with who decided each'],
  ['03_new_dataset', 'Adding a dataset: a folder, an agent, a cluster'],
  ['02_images_drift', 'The image checks: drift, legends, flagged images'],
  ['04_results_overview', 'Results at a glance'],
  ['05_results_traits', 'Every trait, with the ideal y = x line'],
  ['06_results_memorisation', 'Does the model memorise? (no)'],
  ['07_results_baselines', 'How much of the accuracy is genetic'],
  ['08_results_matching', 'Can a mouse be recognised from its generated images?'],
  ['09_generate', 'Generate a new dataset of images from genotypes, with metadata'],
];

export function SoftwareChapter() {
  const ref = useRef<HTMLElement>(null);
  const near = useNear(ref);
  const pipeline = useJson<{ stages: Stage[] }>(`${A}pipeline.json`, near);
  const drift = useJson<Drift>(`${A}drift.json`, near);

  return (
    <section ref={ref} className="ch sw" id="d2d-software" aria-labelledby="d2d-sw-h">
      <div className="wrap">
        <span className="kicker">09 · The software</span>
        <p className="sw-lead">Getting a new dataset this far took weeks of fixing data by hand. So I built software that does it.</p>
        <h2 id="d2d-sw-h">Hand it a folder of images and a genotype file. It works out the rest.</h2>
        <p style={{ maxWidth: 680 }}>
          <b>d2d</b> takes any image + genotype dataset from upload to a trained model to results. Each stage runs ordinary,
          rule-based analysis first. Only when the rules aren't confident is an AI agent (Claude) asked to decide, and then code
          applies its answer.
        </p>

        <Timeline stages={pipeline?.stages ?? []} />

        <div className="sw-rule" />
        <span className="sw-label">The test</span>
        <h3>Raw mouse X-rays, nothing cleaned</h3>
        <p style={{ maxWidth: 680 }}>
          The mouse X-rays from chapter 08 went in exactly as published. Every problem I had fixed by hand, it found by itself,
          and it caught some I had missed.
        </p>
        <div className="sw-tiles mono">
          <div>
            <b>8,819</b>X-rays in
          </div>
          <div>
            <b>8,807</b>prepared
          </div>
          <div>
            <b>12</b>excluded
          </div>
        </div>

        <Beat n={1} title="Legends painted out">
          <p>68% of the X-rays carry a grey-scale legend panel. The check finds the mouse and the legend, and the legend is painted out.</p>
          <SeesToggle />
        </Beat>

        <Beat n={2} title="The magnification changed between imaging setups">
          <p>
            A mouse measured about 630 px on the older, wider X-rays and about 760 px on the newer ones: a 1.2× change that isn't
            biology. It was found from the image sizes alone, and every setup was scaled to match.
          </p>
          {drift && <Setups setups={drift.size_by_setup} />}
        </Beat>

        <Beat n={3} title="Exposure drifted month to month">
          <p>The brightness of the mouse and of the background wandered over the years. Each image is now stretched to its own range.</p>
          {drift && <BrightnessChart data={drift.brightness_by_month} />}
        </Beat>

        <Beat n={4} title="Batch effects became inputs">
          <p>
            It added sex and imaging month to the model's inputs (99 columns), so the date isn't mistaken for genetics. These are
            the same columns I had built by hand.
          </p>
        </Beat>

        <Beat n={5} title="Inverted and sideways X-rays rejected">
          <p>
            7 images with flipped polarity and one sideways mouse. A few images like these can throw an image model's training off.
            My own hand-built training set still had 4 of these 8. The software found all 8.
          </p>
          <div className="sw-reject">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <img key={i} src={`${A}caught/inverted_${i}.webp`} alt={`Inverted X-ray ${i}`} loading="lazy" style={{ transform: `rotate(${((i * 37) % 9) - 4}deg)` }} />
            ))}
            <img src={`${A}caught/sideways.webp`} alt="X-ray of a mouse lying sideways" loading="lazy" style={{ transform: 'rotate(3deg)' }} />
            <span className="sw-stamp" aria-hidden>
              rejected
            </span>
          </div>
        </Beat>

        <Beat n={6} title="Duplicates">
          <p>The same picture was filed under two different mice, twice. My pipeline had kept both copies.</p>
          <div className="sw-dupes">
            {[1, 2].map((d) => (
              <div key={d} className="sw-dupe">
                <img src={`${A}caught/duplicate_${d}_1.webp`} alt={`Duplicate pair ${d}, first mouse`} loading="lazy" />
                <span aria-label="is the same image as">=</span>
                <img src={`${A}caught/duplicate_${d}_2.webp`} alt={`Duplicate pair ${d}, second mouse`} loading="lazy" />
              </div>
            ))}
          </div>
        </Beat>

        <div className="sw-rule" />
        <span className="sw-label">The dashboard</span>
        <h3>Every step on one screen</h3>
        <p className="mono" style={{ opacity: 0.75 }}>
          swipe →  ·  tap to open full size
        </p>
      </div>
      <div className="sw-screens" role="list">
        {SCREENS.map(([f, cap]) => (
          <figure key={f} role="listitem">
            <a href={`${A}screens/${f}.webp`} target="_blank" rel="noopener noreferrer">
              <img src={`${A}screens/${f}.webp`} alt={`d2d dashboard: ${cap}`} loading="lazy" />
            </a>
            <figcaption className="mono">{cap}</figcaption>
          </figure>
        ))}
      </div>
      <div className="wrap">
        <p className="note-honest" style={{ maxWidth: 680, marginTop: 28, fontSize: 17, lineHeight: 1.45 }}>
          The run from the raw X-rays is still training on the university cluster, so the results screens come from the earlier run
          on the same mice. The mouse chapter's caveat still applies: sex and imaging month carry most of the predictable signal.
        </p>
      </div>
    </section>
  );
}

function Timeline({ stages }: { stages: Stage[] }) {
  return (
    <ol className="sw-timeline">
      {stages.map((s, i) => {
        const agent = s.decided_by === 'claude-code';
        const pending = s.status !== 'done';
        return (
          <li key={s.stage} className={pending ? 'pending' : agent ? 'agent' : undefined}>
            <span className="sw-num mono">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="sw-title">
                <b>{s.title}</b>
                <span className={`sw-badge mono${agent ? ' gold' : ''}`}>{pending ? 'still to run' : agent ? 'agent decided' : 'rules'}</span>
              </div>
              <p>{s.does}</p>
              {!pending && <p className="mono sw-result">{s.result.replace('scripts for large written (slurm)', 'cluster jobs written (Slurm), large model')}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Beat({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="sw-beat">
      <span className="sw-num mono">{n}</span>
      <div>
        <h4>{title}</h4>
        {children}
      </div>
    </div>
  );
}

function SeesToggle() {
  const [mask, setMask] = useState(true);
  return (
    <figure style={{ margin: 0, maxWidth: 460 }}>
      <div className="chips" role="tablist" aria-label="View">
        <button role="tab" className="chip" aria-selected={!mask} onClick={() => setMask(false)}>
          raw X-ray
        </button>
        <button role="tab" className="chip" aria-selected={mask} onClick={() => setMask(true)}>
          what it sees
        </button>
      </div>
      <div className="plate" style={{ aspectRatio: '640 / 524' }}>
        <img src={`${A}caught/sees_raw.webp`} alt="Raw mouse X-ray with a grey-scale legend panel on the right" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%' }} />
        <img
          src={`${A}caught/sees_mask.webp`}
          alt="The same X-ray as the check sees it: the mouse in gold, the legend in blue"
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: mask ? 1 : 0, transition: 'opacity .5s' }}
        />
      </div>
      <figcaption className="mono" style={{ marginTop: 6 }}>
        mouse in gold, legend in blue
      </figcaption>
    </figure>
  );
}

function Setups({ setups }: { setups: Setup[] }) {
  const [after, setAfter] = useState(false);
  const max = Math.max(...setups.map((s) => s.median_mouse_size_px * s.scale_factor), ...setups.map((s) => s.median_mouse_size_px));
  return (
    <div>
      <div className="chips" role="tablist" aria-label="Before or after">
        <button role="tab" className="chip" aria-selected={!after} onClick={() => setAfter(false)}>
          as published
        </button>
        <button role="tab" className="chip" aria-selected={after} onClick={() => setAfter(true)}>
          after d2d
        </button>
      </div>
      <div className="sw-setups">
        {setups.map((s) => {
          const size = after ? s.median_mouse_size_px * s.scale_factor : s.median_mouse_size_px;
          return (
            <figure key={s.image_width_px}>
              <div className="plate" style={{ aspectRatio: '1', background: after ? '#fff' : '#000' }}>
                <img
                  src={`${A}${after ? s.prepared : s.raw}`}
                  alt={`Mouse from the ${s.image_width_px} px imaging setup, ${after ? 'prepared' : 'as published'}`}
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className="sw-bar" aria-hidden>
                <div style={{ height: `${Math.max(4, ((size - BASE) / (max - BASE)) * 100)}%` }} />
              </div>
              <figcaption className="mono">
                {Math.round(size)} px
                <br />
                <span style={{ opacity: 0.65 }}>{s.image_width_px} wide</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className="mono" style={{ opacity: 0.75, marginTop: 6 }}>
        bars: median mouse size in each imaging setup (axis starts at {BASE} px)
      </p>
    </div>
  );
}

function BrightnessChart({ data }: { data: Drift['brightness_by_month'] }) {
  const W = 400;
  const H = 170;
  const M = { l: 8, r: 8, t: 10, b: 26 };
  const x = (i: number) => M.l + (i / (data.length - 1)) * (W - M.l - M.r);
  const y = (v: number) => H - M.b - v * (H - M.t - M.b);
  const line = (k: 'subject_brightness' | 'background_brightness') => data.map((d, i) => `${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join(' ');
  const years = data.map((d, i) => [d.month, i] as const).filter(([m], i, a) => i === 0 || m.slice(0, 4) !== a[i - 1][0].slice(0, 4));
  return (
    <figure style={{ margin: 0, maxWidth: 620 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mouse and background brightness by imaging month, 2013 to 2021: both drift over time" style={{ width: '100%', height: 'auto', display: 'block', color: 'var(--fg)' }}>
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="currentColor" strokeOpacity=".4" />
        {years.map(([m, i]) => (
          <g key={m}>
            <line x1={x(i)} x2={x(i)} y1={H - M.b} y2={H - M.b + 4} stroke="currentColor" strokeOpacity=".5" />
            <text x={x(i)} y={H - 8} fill="currentColor" opacity=".75" textAnchor="middle" style={{ font: '10px var(--f-mono)' }}>
              {m.slice(0, 4)}
            </text>
          </g>
        ))}
        <polyline points={line('subject_brightness')} fill="none" stroke="#F1B82D" strokeWidth="1.8" />
        <polyline points={line('background_brightness')} fill="none" stroke="currentColor" strokeOpacity=".7" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
      <figcaption className="mono" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 4 }}>
        <span>
          <span style={{ display: 'inline-block', width: 18, height: 2, background: '#F1B82D', verticalAlign: 'middle', marginRight: 6 }} />
          mouse brightness
        </span>
        <span style={{ opacity: 0.8 }}>
          <span style={{ display: 'inline-block', width: 18, borderTop: '2px dashed currentColor', verticalAlign: 'middle', marginRight: 6 }} />
          background
        </span>
      </figcaption>
    </figure>
  );
}
