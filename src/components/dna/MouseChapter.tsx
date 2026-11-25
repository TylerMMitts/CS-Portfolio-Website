import { useMemo, useRef, useState } from 'react';
import { ASSET, frameUrls, useJson, useNear } from './hooks';
import { ScrubCanvas } from './ScrubCanvas';
import { Scatter, ScatterTrait } from './Scatter';

interface MouseData {
  n_mice: number;
  n_knockout_genes: number;
  genotype_columns: number;
  validation_mice: number;
  hero_mouse: string;
  pairs: { mouse: string; sex: string; genotype: string; real: string; generated: string }[];
  traits: {
    trait: string;
    label: string;
    n_mice: number;
    r_generated: number;
    r_genomic_prediction: number;
    points: { mouse: string; true_z: number; generated_z: number; gp_z: number }[];
  }[];
  breakdown: { trait: string; sex_and_month: number; knockouts_only: number; all_columns: number }[];
}

const FRAMES = frameUrls('mouse/denoise');
const INVERT = 'invert(1)'; // radiograph-film look; applied identically to real and generated images

export function MouseChapter() {
  const ref = useRef<HTMLElement>(null);
  const near = useNear(ref, '200% 0px');
  const data = useJson<MouseData>(`${ASSET}mouse/mouse.json`, near);
  const [pair, setPair] = useState(0);
  const [split, setSplit] = useState(50);
  const endRef = useRef<HTMLParagraphElement>(null);

  const traits: ScatterTrait[] = useMemo(
    () =>
      (data?.traits ?? []).map((t) => ({
        key: t.trait,
        label: t.label,
        rModel: t.r_generated,
        rBase: t.r_genomic_prediction,
        points: t.points.map((p) => ({ id: p.mouse, x: p.true_z, yModel: p.generated_z, yBase: p.gp_z })),
      })),
    [data],
  );
  const labelOf = (key: string) => data?.traits.find((t) => t.trait === key)?.label ?? key;
  const pr = data?.pairs[pair];

  return (
    <section ref={ref} className="field-blue" id="d2d-mouse" aria-labelledby="d2d-mouse-h">
      <div className="ch" style={{ paddingBottom: '6vh' }}>
        <div className="wrap">
          <span className="kicker">08 · Not just maize</span>
          <h2 id="d2d-mouse-h">The method doesn't know it's looking at plants</h2>
          <p style={{ maxWidth: 640 }}>
            Same pipeline, different organism, different kind of image: skeletal X-rays of mice.
          </p>
          <span className="scrawl" style={{ marginTop: 8 }}>same code. new animal.</span>
        </div>
      </div>

      <ScrubCanvas
        frames={FRAMES}
        load={near}
        heightVh={340}
        endFraction={0.78}
        invert
        label="Noise turning into a mouse X-ray generated for held-out mouse M01151, shown film-negative"
        onProgress={(p) => {
          if (endRef.current) endRef.current.style.opacity = String(Math.max(0, (p - 0.8) / 0.2));
        }}
      >
        <p
          ref={endRef}
          className="mono"
          style={{ position: 'absolute', left: 20, right: 20, bottom: 'max(24px, 5vh)', margin: 0, textAlign: 'center', opacity: 0, color: 'var(--paper)' }}
        >
          Mouse M01151, a held-out Fez2 knockout female, drawn from its genotype alone.
        </p>
      </ScrubCanvas>

      <div className="ch" style={{ paddingTop: '8vh' }}>
        <div className="wrap">
          <h3>Real or drawn? Drag to compare</h3>
          <p style={{ maxWidth: 620 }}>
            Six held-out mice. Left of the line is the real X-ray; right is the model's drawing of that mouse from its genotype
            alone. None of these mice was used in training.
          </p>
          <div className="chips" role="tablist" aria-label="Mouse">
            {(data?.pairs ?? []).map((p, i) => (
              <button key={p.mouse} role="tab" className="chip" aria-selected={i === pair} onClick={() => setPair(i)}>
                {p.mouse}
              </button>
            ))}
          </div>
          {pr && (
            <figure style={{ margin: 0, maxWidth: 520 }}>
              <div style={{ position: 'relative', aspectRatio: '1', background: '#000', overflow: 'hidden' }}>
                <img src={`${ASSET}mouse/${pr.real}`} alt={`Real X-ray of mouse ${pr.mouse}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: INVERT }} />
                <img
                  src={`${ASSET}mouse/${pr.generated}`}
                  alt={`Generated X-ray of mouse ${pr.mouse}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: INVERT, clipPath: `inset(0 0 0 ${split}%)` }}
                />
                <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: `${split}%`, width: 2, background: 'var(--gold)' }} />
                <span className="mono" style={{ position: 'absolute', left: 10, top: 8, background: 'rgba(14,13,11,.7)', padding: '1px 8px' }}>
                  real
                </span>
                <span className="mono" style={{ position: 'absolute', right: 10, top: 8, background: 'var(--gold)', color: 'var(--ink)', padding: '1px 8px' }}>
                  generated
                </span>
              </div>
              <label htmlFor="d2d-split" className="visually-hidden">
                Compare real and generated X-ray
              </label>
              <input id="d2d-split" type="range" min={0} max={100} value={split} onChange={(e) => setSplit(Number(e.target.value))} aria-valuetext={`${split}% real`} />
              <figcaption className="mono">
                {pr.genotype} · {pr.sex}
              </figcaption>
            </figure>
          )}

          <div className="two-col" style={{ alignItems: 'start', marginTop: 64 }}>
            <div>
              <h3>The data, briefly</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>8,798 mice from the International Mouse Phenotyping Consortium (IMPC), one X-ray each.</li>
                <li>
                  Instead of 43,788 inherited DNA markers, each mouse's genotype is which of 718 genes was knocked out, plus
                  its sex and imaging month.
                </li>
                <li>The image model, the encoder and the analysis are the same code as for maize.</li>
              </ul>
              <h3 style={{ marginTop: 32 }}>Accuracy</h3>
              <p>
                Eight traits measured on the images, scored on 728 held-out mice. Generated images reach r 0.44 to 0.91 (mean
                0.74); the genomic-prediction baseline averages 0.77.
              </p>
            </div>
            <div>{traits.length > 0 && <Scatter traits={traits} baseName="genomic prediction" idLabel="mouse" xLabel={() => 'true value (standardised)'} />}</div>
          </div>

          <div style={{ marginTop: 64, maxWidth: 760 }}>
            <h3>Where the signal comes from</h3>
            <p className="note-honest">
              Most of what can be predicted about these mice comes from their sex and when they were imaged, not from the
              knocked-out gene.
            </p>
            <p>For body area: sex and imaging month alone give r 0.72; all columns give 0.76.</p>
            <div className="mono" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '8px 0 16px' }} aria-hidden>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 10, background: 'var(--paper)', opacity: 0.6 }} /> sex + imaging month
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 10, background: 'var(--gold)' }} /> everything
              </span>
            </div>
            <dl style={{ margin: 0 }}>
              {(data?.breakdown ?? []).map((b) => (
                <div key={b.trait} style={{ marginBottom: 14 }}>
                  <dt style={{ fontSize: 16, marginBottom: 4 }}>{labelOf(b.trait)}</dt>
                  <dd style={{ margin: 0, display: 'grid', gap: 3 }}>
                    {[
                      { v: b.sex_and_month, name: 'sex + imaging month', bg: 'rgba(241,230,204,.6)' },
                      { v: b.all_columns, name: 'everything', bg: 'var(--gold)' },
                    ].map((bar) => (
                      <div key={bar.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 12, background: 'rgba(14,13,11,.35)' }}>
                          <div style={{ width: `${Math.max(0, bar.v) * 100}%`, height: '100%', background: bar.bg }} />
                        </div>
                        <span className="mono" style={{ width: 150, flexShrink: 0 }}>
                          {bar.v.toFixed(2)} <span className="visually-hidden">{bar.name}</span>
                          <span aria-hidden style={{ opacity: 0.75 }}>{bar.name === 'everything' ? 'all' : 'sex+month'}</span>
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            <p style={{ marginTop: 24 }}>
              The point is that the same pipeline runs end to end on a new organism and matches the standard baseline. It is not
              a claim about what specific knockouts do.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
