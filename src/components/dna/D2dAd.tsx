import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ASSET, clamp, useJson, useNear, useReducedMotion } from './hooks';

// An animated "advert" for d2d, built from a replica of the real dashboard's components
// (d2d/dashboard/static/index.html: top bar, status LED, pipeline banner, step bar, stage
// cards with status chips, agent notes, KPI tiles, bar rows). Each dataset's run is a JSON
// file in public/d2d/agents/ad/: mouse.json is the real d2d run on the raw IMPC X-rays
// (built from the d2d workspace); root.json and seed.json are example runs ("real": false)
// used for their results only.
// It plays like a video once it is on screen.

interface Stage {
  key: string;
  title: string;
  source: string;
  message: string;
}
interface Caught {
  src: string;
  label: string;
  bad: boolean;
}
export interface AdRun {
  key: string;
  label: string;
  real: boolean;
  name: string;
  path: string;
  found: string;
  files: number;
  upload: number;
  unit: string;
  stages: Stage[];
  finished_message: string;
  notes: Record<string, string>;
  caught: Caught[];
  sbatch: string[];
  qc_issues: string[];
  results: { mean_r: number; mean_gp: number; base_label?: string; lines: number; images: number; traits: { label: string; r: number; gp: number }[] };
  copy: [string, string][];
  media?: Media;
}
interface Media {
  intake?: { title: string; items: { src: string }[] };
  legend?: { raw: string; mask: string };
  traits?: { legend: [string, string][]; items: { src: string }[] };
  qc?: { title: string; items: { src: string }[] };
  pairs?: { real: string; generated: string }[];
}

const A = `${ASSET}agents/`;
const N = 7; // steps

// local progress of step i (0..1) at overall progress p
const local = (p: number, i: number) => clamp(p * N - i);
const at = (p: number, i: number, t: number) => p * N >= i + t; // has step i reached local time t?
const type = (s: string, k: number) => s.slice(0, Math.round(s.length * clamp(k)));

// How long each step plays (ms), paced to be read like a video ad
const DUR = [4500, 5500, 9500, 8000, 6000, 8000, 7500];
const TOTAL = DUR.reduce((a, b) => a + b, 0);
const START = DUR.map((_, i) => DUR.slice(0, i).reduce((a, b) => a + b, 0));
// overall progress p (0..1, one Nth per step) at time t (ms)
const pAt = (t: number) => {
  let i = 0;
  while (i < N - 1 && t >= START[i + 1]) i++;
  return clamp((i + clamp((t - START[i]) / DUR[i])) / N);
};

export function D2dAd({ dataset = 'mouse' }: { dataset?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  const loaded = useJson<AdRun>(`${A}ad/${dataset}.json`, near);
  const last = useRef<AdRun | null>(null);
  if (loaded) last.current = loaded;
  const ad = loaded ?? last.current;
  const reduced = useReducedMotion();

  // playback: starts when the ad is mostly on screen, pauses when it leaves, like a video
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false); // paused by the viewer
  const [visible, setVisible] = useState(false);
  const tRef = useRef(0);
  tRef.current = t;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => setVisible(e.intersectionRatio >= 0.55)), { threshold: [0, 0.55, 0.8] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const playing = !reduced && !!ad && visible && !paused && t < TOTAL;
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const next = Math.min(TOTAL, tRef.current + Math.min(100, now - prev));
      prev = now;
      setT(next);
      if (next < TOTAL) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const P = reduced ? 1 : pAt(t);
  const step = Math.min(N - 1, Math.floor(P * N));
  const ended = t >= TOTAL;
  const seek = (i: number) => {
    setT(START[i]);
    setPaused(false);
  };

  return (
    <div ref={ref} className="da-stage da-video">
      <div className="da-copy" aria-live="polite">
        <span className="da-count mono">
          d2d · {step + 1} / {N}
        </span>
        {(ad?.copy ?? []).map(([h, b], i) => (
          <div key={i} className="da-line" style={{ opacity: i === step ? 1 : 0, transform: `translateY(${i === step ? 0 : i < step ? -10 : 10}px)` }} aria-hidden={i !== step}>
            <p className="da-h">{h}</p>
            <p className="da-b">{b}</p>
          </div>
        ))}
        {!reduced && (
          <div className="da-player">
            <button
              type="button"
              className="da-play"
              onClick={() => (ended ? seek(0) : setPaused((v) => !v))}
              aria-label={ended ? 'Replay the d2d demo' : paused ? 'Play the d2d demo' : 'Pause the d2d demo'}
            >
              {ended ? '↻' : paused || !visible ? '▶' : '❚❚'}
            </button>
            <div className="da-segs">
              {DUR.map((d, i) => (
                <button key={i} type="button" onClick={() => seek(i)} aria-label={`Jump to step ${i + 1}`} style={{ flexGrow: d }}>
                  <span style={{ width: `${clamp((t - START[i]) / d) * 100}%` }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {ad ? <Window ad={ad} p={P} step={step} /> : <div className="da-win" />}
    </div>
  );
}

function Window({ ad, p, step }: { ad: AdRun; p: number; step: number }) {
  const page = step === 0 ? 'new' : step === N - 1 && at(p, 6, 0.08) ? 'results' : 'pipeline';
  const allDone = reached(p, T.analysis.done);
  const ledCls = page === 'new' ? '' : allDone ? 'finished' : 'running';
  const ledTxt = page === 'new' ? '' : allDone ? 'finished' : phaseOf(p).toLowerCase();

  // keep the stage being worked on in view inside the window
  const bodyRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const focus = focusKey(p, step);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const el = body.querySelector<HTMLElement>(`[data-k="${focus}"]`);
    const inner = body.firstElementChild as HTMLElement | null;
    if (!el || !inner) return setShift(0);
    const room = body.clientHeight;
    const want = el.offsetTop + el.offsetHeight - room + 16;
    setShift(Math.max(0, Math.min(want, inner.scrollHeight - room)));
  }, [focus, page, p, ad]);

  return (
    <div className="da-win" role="img" aria-label={`An animation of the d2d dashboard running the ${ad.label.toLowerCase()} dataset from upload to results`}>
      <div className="da-chrome" aria-hidden>
        <span className="da-app">
          d2d
        </span>
        <span className="da-wc">
          <i className="min" />
          <i className="max" />
          <i className="x" />
        </span>
      </div>
      <div className="da" aria-hidden>
        <header className="da-top">
          <span className="da-brand">
            <span className="da-mark">D2D</span>
            <span className="da-name">DNA to Display</span>
          </span>
          <span className="da-field">
            <span className="da-label">Dataset</span>
            <span className="da-select">{page === 'new' ? '—' : ad.name}</span>
          </span>
          <span className={`da-led ${ledCls}`}>
            <i />
            {ledTxt}
          </span>
          <span className="da-spacer" />
          <span className="da-btn primary da-hide-s">+ Add dataset</span>
        </header>
        <div className="da-layout">
          <nav className="da-nav">
            <span className="da-label">Workspace</span>
            {['Pipeline', 'Images & traits', 'Genetics', 'Training', 'Results', 'Generate dataset'].map((l, i) => (
              <span key={l} className={(page === 'pipeline' && i === 0) || (page === 'results' && i === 4) ? 'on' : undefined}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                {l}
              </span>
            ))}
          </nav>
          <div className="da-main" ref={bodyRef}>
            <div style={{ transform: `translateY(${-shift}px)`, transition: 'transform .45s ease' }}>
              {page === 'new' && <NewPage ad={ad} p={p} />}
              {page === 'pipeline' && <PipelinePage ad={ad} p={p} />}
              {page === 'results' && <ResultsPage ad={ad} p={p} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- timeline of the pipeline ----------------------------------------------------------
// For each stage: [step, local time] when it starts running, when the agent starts deciding
// (only for stages an agent decided in the run) and when it is done.
type Tm = [number, number];
const T: Record<string, { run: Tm; decide: Tm; done: Tm }> = {
  intake: { run: [1, 0.15], decide: [1, 0.3], done: [1, 0.7] },
  images: { run: [2, 0.05], decide: [2, 0.25], done: [2, 0.55] },
  traits: { run: [3, 0.05], decide: [3, 0.2], done: [3, 0.5] },
  genetics: { run: [3, 0.6], decide: [3, 0.68], done: [3, 0.85] },
  training: { run: [4, 0.1], decide: [4, 0.22], done: [4, 0.45] },
  qc: { run: [5, 0.15], decide: [5, 0.3], done: [5, 0.6] },
  analysis: { run: [5, 0.65], decide: [5, 0.72], done: [5, 0.9] },
};
const ORDER = Object.keys(T);
const TITLES: Record<string, string> = {
  intake: 'Organize the dataset',
  images: 'Image preprocessing',
  traits: 'Segmentation and traits',
  genetics: 'Genetic encoding',
  training: 'Training setup',
  qc: 'Quality control',
  analysis: 'Statistical analysis',
};
const reached = (p: number, t: Tm) => at(p, t[0], t[1]);
const training = (p: number) => reached(p, T.training.done) && !reached(p, T.qc.run);

function statusOf(p: number, s: Stage): { status: string; source: string; message: string } {
  const t = T[s.key];
  if (!t) return { status: 'done', source: s.source, message: s.message };
  if (reached(p, t.done)) return { status: 'done', source: s.source, message: s.message };
  if (s.source === 'claude-code' && reached(p, t.decide)) return { status: 'deciding', source: '', message: 'the rules aren’t confident: asking the agent' };
  if (reached(p, t.run)) return { status: 'running', source: '', message: 'measuring…' };
  if ((s.key === 'qc' || s.key === 'analysis') && reached(p, T.training.done)) return { status: 'pending', source: '', message: 'waiting for the models to finish training on the cluster' };
  return { status: 'pending', source: '', message: '' };
}

function phaseOf(p: number) {
  if (training(p)) return 'training on the cluster';
  for (const k of ORDER) if (!reached(p, T[k].done)) return TITLES[k];
  return 'finished';
}

function focusKey(p: number, step: number) {
  if (step === 0) return 'form-go';
  if (step === 5) return at(p, 5, 0.62) ? 'analysis' : 'qc';
  if (step === 6) return at(p, 6, 0.55) ? 'pairs' : 'traits-chart';
  if (step === 4) return 'training';
  if (step === 3) return at(p, 3, 0.58) ? 'genetics' : 'traits';
  if (step === 2) return 'images';
  return 'intake';
}

function NewPage({ ad, p }: { ad: AdRun; p: number }) {
  const l = local(p, 0);
  const name = type(ad.name, l / 0.25);
  const path = type(ad.path, (l - 0.25) / 0.2);
  const files = Math.round(ad.files * clamp((l - 0.45) / 0.2));
  const pressed = l > 0.72;
  const up = clamp((l - 0.74) / 0.24);
  const count = files >= ad.files ? ad.found : `found ${files.toLocaleString()} images`;
  return (
    <>
      <div className="da-head">
        <div>
          <div className="da-eyebrow">New run</div>
          <h2>Add a dataset</h2>
        </div>
      </div>
      <div className="da-card">
        <div className="da-label">Name</div>
        <div className="da-input">
          {name}
          {l < 0.25 && <span className="da-caret" />}
        </div>
        <div className="da-label da-f">Data</div>
        <div className="da-input">
          {path || <span className="da-ph">a folder path on this computer</span>}
          {l >= 0.25 && l < 0.45 && <span className="da-caret" />}
        </div>
        <div className="da-hint">{files > 0 ? count : 'Images plus a genotype file (0/1/2 table, VCF or HapMap), and any trait table. The agents work out the rest.'}</div>
        <div className="da-label da-f">Agent</div>
        <div className="da-input da-sel">Claude Code (your Claude subscription)</div>
        <div className="da-label da-f">Training</div>
        <div className="da-row" style={{ flexWrap: 'nowrap' }}>
          <span className="da-check on" style={{ flexShrink: 0 }} />
          <span>Train on a cluster automatically (ssh key login)</span>
        </div>
        <div className="da-row" style={{ marginTop: 14 }} data-k="form-go">
          <span className={`da-btn primary${pressed ? ' pressed' : ''}`}>Upload and start</span>
          <span className="da-hint" style={{ margin: 0 }}>
            {pressed ? (up < 1 ? `uploading ${Math.round(up * ad.upload).toLocaleString()} of ${ad.upload.toLocaleString()}` : 'starting the pipeline') : ''}
          </span>
        </div>
        {pressed && (
          <div className="da-prog">
            <span style={{ width: `${up * 100}%` }} />
          </div>
        )}
      </div>
    </>
  );
}

function PipelinePage({ ad, p }: { ad: AdRun; p: number }) {
  const states = ad.stages.map((s) => statusOf(p, s));
  const done = reached(p, T.analysis.done);
  const cls = done ? 'finished' : 'running';
  const phase = done ? 'Finished' : training(p) ? 'Training · on the cluster' : `Running · ${phaseOf(p)}`;
  const msg = done
    ? ad.finished_message
    : training(p)
      ? 'job scripts submitted: the models train on the cluster and the results come back here'
      : 'each stage measures first, then decides';
  const l2 = local(p, 2);
  const l3 = local(p, 3);
  const l4 = local(p, 4);
  const l5 = local(p, 5);

  const l1 = local(p, 1);
  const md = ad.media ?? {};
  const details: Record<string, ReactNode> = {};
  if (md.intake && l1 > 0.25 && p * N < 2.2)
    details.intake = (
      <>
        <div className="da-label" style={{ marginBottom: 6 }}>
          {md.intake.title}
        </div>
        <div className="da-grid da-wide">
          {md.intake.items.map((c, i) => (
            <figure key={i} style={{ opacity: clamp((l1 - 0.3 - i * 0.06) / 0.1) }}>
              <img src={`${A}${c.src}`} alt="" />
            </figure>
          ))}
        </div>
      </>
    );
  if (l2 > 0.08 && p * N < 3.25) {
    details.images = (
      <>
        {md.legend && (
          <div className="da-sees">
            <div className="da-sees-img">
              <img src={`${A}${md.legend.raw}`} alt="" />
              <img src={`${A}${md.legend.mask}`} alt="" style={{ opacity: clamp((l2 - 0.18) / 0.1) }} />
            </div>
            <div className="da-hint" style={{ margin: 0 }}>
              <b style={{ color: 'var(--ink)' }}>what the check sees:</b> mouse in gold, the grey-scale legend in blue. The legend is
              painted out.
            </div>
          </div>
        )}
        <div className="da-notes">{type(ad.notes.images, (l2 - 0.3) / 0.5)}</div>
        <div className="da-grid">
          {ad.caught.map((c, i) => (
            <figure key={i} style={{ opacity: clamp((l2 - 0.5 - i * 0.05) / 0.1) }}>
              <img src={`${A}${c.src}`} alt="" />
              <figcaption className={c.bad ? undefined : 'ok'}>{c.label}</figcaption>
            </figure>
          ))}
        </div>
      </>
    );
  }
  if (l3 > 0.08 && p * N < 4.1)
    details.traits = (
      <>
        {md.traits && (
          <>
            <div className="da-grid da-seg">
              {md.traits.items.map((c, i) => (
                <figure key={i} style={{ opacity: clamp((l3 - 0.1 - i * 0.05) / 0.08) }}>
                  <img src={`${A}${c.src}`} alt="" style={{ clipPath: `inset(0 0 ${(1 - clamp((l3 - 0.12 - i * 0.05) / 0.2)) * 100}% 0)` }} />
                </figure>
              ))}
            </div>
            <div className="da-legend" style={{ margin: '6px 0 8px' }}>
              {md.traits.legend.map(([c, n]) => (
                <span key={n}>
                  <i style={{ background: c }} />
                  {n}
                </span>
              ))}
            </div>
          </>
        )}
        {l3 > 0.3 && <div className="da-notes">{type(ad.notes.traits, (l3 - 0.3) / 0.3)}</div>}
      </>
    );
  if (l3 > 0.85 && p * N < 4.1) details.genetics = <div className="da-notes">{ad.notes.genetics}</div>;
  if (l4 > 0.45 && p * N < 5.3)
    details.training = (
      <>
        <div className="da-notes">{type(ad.notes.training, (l4 - 0.45) / 0.25)}</div>
        <pre className="da-pre">{ad.sbatch.slice(0, Math.round(ad.sbatch.length * clamp((l4 - 0.6) / 0.3))).join('\n')}</pre>
      </>
    );
  if (l5 > 0.2)
    details.qc = (
      <div>
        {md.qc && (
          <>
            <div className="da-label" style={{ marginBottom: 6 }}>
              {md.qc.title}
            </div>
            <div className="da-grid da-seg" style={{ marginBottom: 8 }}>
              {md.qc.items.map((c, i) => (
                <figure key={i} style={{ opacity: clamp((l5 - 0.22 - i * 0.04) / 0.08) }}>
                  <img src={`${A}${c.src}`} alt="" />
                </figure>
              ))}
            </div>
          </>
        )}
        {ad.qc_issues.map((d, i) => (
          <div key={i} className="da-issue" style={{ opacity: clamp((l5 - 0.35 - i * 0.1) / 0.1) }}>
            <b>info</b> · {d}
          </div>
        ))}
      </div>
    );

  return (
    <>
      <div className="da-head">
        <div>
          <div className="da-eyebrow">Pipeline</div>
          <h2>{ad.name}</h2>
        </div>
      </div>
      <div className={`da-banner ${cls}`}>
        <span className={`da-led ${cls}`}>
          <i />
        </span>
        <div>
          <div className="da-phase">{phase}</div>
          <div className="da-hint" style={{ margin: 0 }}>
            {msg}
          </div>
        </div>
      </div>
      <div className="da-steps">
        {states.map((s, i) => (
          <div key={i} className={s.status} />
        ))}
      </div>
      {ad.stages.map((s, i) => {
        const st = states[i];
        return (
          <div key={s.key} className={`da-card${st.status === 'deciding' ? ' glow' : ''}`} data-k={s.key}>
            <div className="da-stage-head">
              <span className="da-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="da-title">{s.title}</span>
              <span className={`da-chip ${st.status}`}>
                {st.status}
                {st.status === 'done' && st.source ? ` · ${st.source}` : ''}
              </span>
            </div>
            {st.message && <div className="da-msg">{st.message}</div>}
            {details[s.key] && <div className="da-details">{details[s.key]}</div>}
          </div>
        );
      })}
    </>
  );
}

function ResultsPage({ ad, p }: { ad: AdRun; p: number }) {
  const l = clamp((local(p, 6) - 0.08) / 0.8);
  const r = ad.results;
  const n = (v: number, d = 2) => (v * Math.min(1, l / 0.4)).toFixed(d);
  return (
    <>
      <div className="da-head">
        <div>
          <div className="da-eyebrow">Results · validation</div>
          <h2>{ad.name}</h2>
        </div>
      </div>
      <div className="da-kpis">
        <div className="da-kpi">
          <div className="da-label">Generated images</div>
          <div className="da-v gold">
            {n(r.mean_r)}
            <small>mean r</small>
          </div>
          <div className="da-d">{r.traits.length} traits, true vs generated</div>
        </div>
        <div className="da-kpi">
          <div className="da-label">Genomic prediction</div>
          <div className="da-v">
            {n(r.mean_gp)}
            <small>mean r</small>
          </div>
          <div className="da-d">the standard baseline</div>
        </div>
        <div className="da-kpi">
          <div className="da-label">Held-out {ad.unit}</div>
          <div className="da-v">{Math.round(r.lines * Math.min(1, l / 0.4))}</div>
          <div className="da-d">{r.images.toLocaleString()} generated images</div>
        </div>
      </div>
      <div className="da-chart" data-k="traits-chart">
        <div className="da-t">
          Accuracy per trait <span>r with the truth</span>
        </div>
        <div className="da-legend">
          <span>
            <i style={{ background: '#f1b82d' }} />
            generated images
          </span>
          <span>
            <i style={{ background: '#9b988f' }} />
            genomic prediction
          </span>
        </div>
        {r.traits.map((t, i) => {
          const k = clamp((l - 0.3 - i * 0.05) / 0.3);
          return (
            <div key={t.label} className="da-barrow">
              <span className="da-bl">{t.label}</span>
              <span className="da-bars">
                <span style={{ width: `${t.r * 100 * k}%`, background: '#f1b82d' }} />
                <span style={{ width: `${t.gp * 100 * k}%`, background: '#9b988f' }} />
              </span>
              <span className="da-bv">{t.r.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      {ad.media?.pairs && (
        <div className="da-chart" style={{ marginTop: 10, marginBottom: 14 }} data-k="pairs">
          <div className="da-t">
            Held-out {ad.unit} <span>real · generated from DNA</span>
          </div>
          <div className="da-pairs">
            {ad.media.pairs.map((x, i) => {
              const v = clamp((l - 0.55 - i * 0.08) / 0.12);
              return (
                <div key={i} style={{ opacity: v }}>
                  <img src={`${A}${x.real}`} alt="" />
                  <img src={`${A}${x.generated}`} alt="" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
