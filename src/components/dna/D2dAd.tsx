import { useLayoutEffect, useRef, useState } from 'react';
import { ASSET, clamp, useJson, useNear, useReducedMotion, useScrollProgress } from './hooks';
import { useStepScroll } from './useStepScroll';

// An animated "advert" for d2d, built from a replica of the real dashboard's components
// (d2d/dashboard/static/index.html: top bar, status LED, pipeline banner, step bar, stage
// cards with status chips, agent notes, KPI tiles, bar rows). Every message, note and number
// comes from the actual runs (public/d2d/agents/ad.json). One swipe plays one step.

interface Stage {
  key: string;
  title: string;
  status: string;
  source: string;
  message: string;
}
interface Ad {
  raw: { name: string; stages: Stage[] };
  finished: { name: string; stages: Stage[]; message: string };
  notes: Record<string, string>;
  qc_issues: string[];
  results: { mean_r: number; mean_gp: number; lines: number; images: number; traits: { label: string; r: number; gp: number }[] };
  sbatch: string[];
}

const A = `${ASSET}agents/`;
const N = 7; // steps
const STOPS = Array.from({ length: N + 1 }, (_, i) => i / N);

const COPY = [
  ['Drop in a folder.', 'Images plus a genotype file. Here: the mouse X-rays as downloaded, nothing cleaned.'],
  ['It sorts out the files.', 'Code matches every image to its line and finds the genotypes and the trait tables.'],
  ['An agent cleans the images.', 'When the rules aren’t sure, an AI agent decides. It caught legends, a zoom change, inverted X-rays and duplicates.'],
  ['It picks what to measure.', 'And how to read the DNA: eight body measurements, every genotype column read directly.'],
  ['It writes the training jobs.', 'It sizes the model and writes the job scripts for the university cluster.'],
  ['It checks the training.', 'On the finished chapter 08 run, it read the loss curves, explained a spike and picked the checkpoint.'],
  ['Results, ready to read.', 'Every trait scored on held-out mice against genomic prediction. From a folder to this, no code written.'],
];

// local progress of step i (0..1) at overall progress p
const local = (p: number, i: number) => clamp(p * N - i);
const at = (p: number, i: number, t: number) => p * N >= i + t; // has step i reached local time t?
const type = (s: string, k: number) => s.slice(0, Math.round(s.length * clamp(k)));

export function D2dAd() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  const ad = useJson<Ad>(`${A}ad.json`, near);
  const reduced = useReducedMotion();
  const [p, setP] = useState(0);
  useStepScroll(ref, STOPS, N * 1700, !reduced);
  useScrollProgress(ref, (v) => setP((o) => (Math.abs(o - v) > 0.0008 || v === 0 || v === 1 ? v : o)));
  const P = reduced ? 1 : p;
  const step = Math.min(N - 1, Math.max(0, Math.ceil(P * N - 0.02) - 1));

  return (
    <div ref={ref} className="pin-track" style={{ height: reduced ? 'auto' : `${N * 85 + 100}vh` }}>
      <div className={reduced ? 'da-stage' : 'pin da-stage'}>
        <div className="da-copy" aria-live="polite">
          <span className="da-count mono">
            d2d · {step + 1} / {N}
          </span>
          {COPY.map(([h, b], i) => (
            <div key={h} className="da-line" style={{ opacity: i === step ? 1 : 0, transform: `translateY(${i === step ? 0 : i < step ? -10 : 10}px)` }} aria-hidden={i !== step}>
              <p className="da-h">{h}</p>
              <p className="da-b">{b}</p>
            </div>
          ))}
        </div>
        {ad ? <Window ad={ad} p={P} step={step} /> : <div className="da-win" />}
      </div>
    </div>
  );
}

function Window({ ad, p, step }: { ad: Ad; p: number; step: number }) {
  const page = step === 0 ? 'new' : step === N - 1 && at(p, 6, 0.08) ? 'results' : 'pipeline';
  const finished = at(p, 5, 0.1);
  const ds = finished ? ad.finished.name : ad.raw.name;
  const ledCls = page === 'new' ? '' : finished ? (at(p, 5, 0.9) ? 'finished' : 'running') : 'running';
  const ledTxt = page === 'new' ? '' : finished ? (at(p, 5, 0.9) ? 'finished' : 'quality control') : phaseOf(p).toLowerCase();

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
  }, [focus, page, p]);

  return (
    <div className="da-win" role="img" aria-label="An animation of the d2d dashboard running a dataset from upload to results">
      <div className="da-chrome" aria-hidden>
        <i />
        <i />
        <i />
        <span>127.0.0.1:8765/#{page}</span>
      </div>
      <div className="da" aria-hidden>
        <header className="da-top">
          <span className="da-brand">
            <span className="da-mark">D2D</span>
            <span className="da-name">DNA to Display</span>
          </span>
          <span className="da-field">
            <span className="da-label">Dataset</span>
            <span className="da-select">{page === 'new' ? '—' : ds}</span>
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
              {page === 'new' && <NewPage p={p} />}
              {page === 'pipeline' && <PipelinePage ad={ad} p={p} finished={finished} />}
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
// (agent stages only) and when it is done.
const RAW_T: Record<string, { run: [number, number]; decide?: [number, number]; done: [number, number] }> = {
  intake: { run: [1, 0.15], done: [1, 0.7] },
  images: { run: [2, 0.05], decide: [2, 0.25], done: [2, 0.55] },
  traits: { run: [3, 0.05], decide: [3, 0.2], done: [3, 0.5] },
  genetics: { run: [3, 0.6], done: [3, 0.85] },
  training: { run: [4, 0.1], done: [4, 0.45] },
};
const FIN_T: Record<string, { run: [number, number]; decide?: [number, number]; done: [number, number] }> = {
  qc: { run: [5, 0.15], decide: [5, 0.3], done: [5, 0.6] },
  analysis: { run: [5, 0.65], done: [5, 0.9] },
};
const reached = (p: number, t: [number, number]) => at(p, t[0], t[1]);

function statusOf(p: number, s: Stage, finished: boolean): { status: string; source: string; message: string } {
  const t = (finished ? FIN_T : RAW_T)[s.key];
  if (finished && !t) return { status: 'done', source: s.source, message: s.message }; // already done in the finished run
  if (!t) return { status: 'pending', source: '', message: 'waiting for the models to finish training on the cluster' };
  if (reached(p, t.done)) return { status: 'done', source: s.source, message: s.message };
  if (t.decide && reached(p, t.decide)) return { status: 'deciding', source: '', message: 'the rules aren’t confident: asking the agent' };
  if (reached(p, t.run)) return { status: 'running', source: '', message: 'measuring…' };
  return { status: 'pending', source: '', message: '' };
}

function phaseOf(p: number) {
  const order = ['intake', 'images', 'traits', 'genetics', 'training'];
  const titles: Record<string, string> = { intake: 'Organize the dataset', images: 'Image preprocessing', traits: 'Segmentation and traits', genetics: 'Genetic encoding', training: 'Training setup' };
  if (reached(p, RAW_T.training.done)) return 'training the models';
  for (const k of order) if (!reached(p, RAW_T[k].done)) return titles[k];
  return 'training the models';
}

function focusKey(p: number, step: number) {
  if (step === 0) return 'form-go';
  if (step === 5) return at(p, 5, 0.62) ? 'analysis' : 'qc';
  if (step === 6) return 'traits-chart';
  if (step === 4) return 'training';
  if (step === 3) return at(p, 3, 0.58) ? 'genetics' : 'traits';
  if (step === 2) return 'images';
  return 'intake';
}

function NewPage({ p }: { p: number }) {
  const l = local(p, 0);
  const name = type('impc_bcm_raw', l / 0.25);
  const path = type('D:\\IMPC\\bcm_xray_download', (l - 0.25) / 0.2);
  const files = Math.round(8819 * clamp((l - 0.45) / 0.2));
  const pressed = l > 0.72;
  const up = clamp((l - 0.74) / 0.24);
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
        <div className="da-hint">{files > 0 ? `found ${files.toLocaleString()} images · knockouts_012.csv.gz · traits.csv` : 'Images plus a genotype file (0/1/2 table, VCF or HapMap), and any trait table. The agents work out the rest.'}</div>
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
            {pressed ? (up < 1 ? `uploading ${Math.round(up * 8822).toLocaleString()} of 8,822` : 'starting the pipeline') : ''}
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

function PipelinePage({ ad, p, finished }: { ad: Ad; p: number; finished: boolean }) {
  const run = finished ? ad.finished : ad.raw;
  const states = run.stages.map((s) => statusOf(p, s, finished));
  const done = finished && at(p, 5, 0.9);
  const cls = done ? 'finished' : 'running';
  const phase = done ? 'Finished' : finished ? `Running · ${at(p, 5, 0.62) ? 'Statistical analysis' : 'Quality control'}` : `Running · ${phaseOf(p)}`;
  const msg = done
    ? ad.finished.message
    : !finished && reached(p, RAW_T.training.done)
      ? 'job scripts written: submit them on the cluster, results come back here'
      : 'each stage measures first, then decides';
  const l2 = local(p, 2);
  const l3 = local(p, 3);
  const l4 = local(p, 4);
  const l5 = local(p, 5);

  const details: Record<string, React.ReactNode> = {};
  if (!finished && l2 > 0.3 && p * N < 3.25) {
    details.images = (
      <>
        <div className="da-notes">{type(ad.notes.images, (l2 - 0.3) / 0.55)}</div>
        <div className="da-grid">
          {['inverted_1', 'inverted_3', 'inverted_5', 'sideways', 'duplicate_1_1', 'duplicate_1_2'].map((f, i) => (
            <figure key={f} style={{ opacity: clamp((l2 - 0.5 - i * 0.05) / 0.1) }}>
              <img src={`${A}caught/${f}.webp`} alt="" />
              <figcaption>{f.startsWith('dup') ? 'duplicate' : f.startsWith('side') ? 'sideways' : 'inverted'} · excluded</figcaption>
            </figure>
          ))}
        </div>
      </>
    );
  }
  if (!finished && l3 > 0.3 && p * N < 4.1) details.traits = <div className="da-notes">{type(ad.notes.traits, (l3 - 0.3) / 0.35)}</div>;
  if (!finished && l3 > 0.85 && p * N < 4.1) details.genetics = <div className="da-notes">{ad.notes.genetics}</div>;
  if (!finished && l4 > 0.45)
    details.training = (
      <>
        <div className="da-notes">{type(ad.notes.training, (l4 - 0.45) / 0.25)}</div>
        <pre className="da-pre">{ad.sbatch.slice(0, Math.round(ad.sbatch.length * clamp((l4 - 0.6) / 0.3))).join('\n')}</pre>
      </>
    );
  if (finished && l5 > 0.32)
    details.qc = (
      <div>
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
          <h2>{run.name}</h2>
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
      {run.stages.map((s, i) => {
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

function ResultsPage({ ad, p }: { ad: Ad; p: number }) {
  const l = clamp((local(p, 6) - 0.08) / 0.8);
  const r = ad.results;
  const n = (v: number, d = 2) => (v * Math.min(1, l / 0.4)).toFixed(d);
  return (
    <>
      <div className="da-head">
        <div>
          <div className="da-eyebrow">Results · validation</div>
          <h2>{ad.finished.name}</h2>
        </div>
      </div>
      <div className="da-kpis">
        <div className="da-kpi">
          <div className="da-label">Generated images</div>
          <div className="da-v gold">
            {n(r.mean_r)}
            <small>mean r</small>
          </div>
          <div className="da-d">8 traits, true vs generated</div>
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
          <div className="da-label">Held-out lines</div>
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
    </>
  );
}
