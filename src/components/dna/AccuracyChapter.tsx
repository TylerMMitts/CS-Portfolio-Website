import { useMemo, useRef, useState } from 'react';
import { ASSET, useJson, useNear } from './hooks';
import { Scatter, ScatterTrait } from './Scatter';

interface AccuracyData {
  traits: {
    trait: string;
    unit: string;
    n_lines: number;
    r_generated: number;
    r_gblup: number;
    points: { line: string; true: number; generated_z: number; gblup_z: number }[];
  }[];
}

const DIAL = [1, 3, 6, 8];

export function AnswerKeyChapter() {
  const ref = useRef<HTMLElement>(null);
  const near = useNear(ref);
  const data = useJson<AccuracyData>(`${ASSET}data/accuracy_scatter.json`, near);
  const [dial, setDial] = useState(0);

  const traits: ScatterTrait[] = useMemo(
    () =>
      (data?.traits ?? []).map((t) => ({
        key: t.trait,
        label: t.trait,
        unit: t.unit,
        rModel: t.r_generated,
        rBase: t.r_gblup,
        points: t.points.map((p) => ({ id: p.line, x: p.true, yModel: p.generated_z, yBase: p.gblup_z })),
      })),
    [data],
  );

  return (
    <section ref={ref} id="d2d-accuracy" aria-labelledby="d2d-acc-h">
      <div className="ch">
        <div className="wrap">
          <span className="kicker">06 · Does it actually work?</span>
          <h2 id="d2d-acc-h">A test with an answer key</h2>
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              <p>
                Real plants don't come with an answer key. So we built a synthetic population (RILs): 2,500 maize lines with
                root genes we designed ourselves and simulated root images, so the true answer is known.
              </p>
              <p>The model was trained on 1,780 lines and tested on 198 it never saw.</p>
            </div>
            <span className="scrawl" style={{ alignSelf: 'center', justifySelf: 'center' }}>
              we wrote the genes, so we know the answers
            </span>
          </div>

          <div className="stat-tiles">
            <div className="stat">
              <b>0.81</b>
              <span>average r over six traits</span>
            </div>
            <div className="stat">
              <b>14</b>
              <span>root genes we designed, so every answer is known</span>
            </div>
            <div className="stat">
              <b>198</b>
              <span>lines never seen in training</span>
            </div>
          </div>

          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>{traits.length > 0 && <Scatter traits={traits} baseName="GBLUP" idLabel="line" xLabel={() => 'true genetic value (standardised)'} />}</div>
            <div>
              <h3>Be honest about it</h3>
              <p>
                Each dot is one unseen line. Gold: measured on images the model generated. Grey: GBLUP, the standard
                genomic-prediction method. The dashed line is a perfect prediction.
              </p>
              <p>
                GBLUP is more accurate on five of the six traits. The model wins on one, metaxylem diameter (r 0.89 vs 0.51),
                which is controlled by two interacting genes: a straight-line method can't see that effect. And the model hands back a whole image,
                not one number.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gene dial, on a gold field: the controls sit right under the image so both stay on screen */}
      <div className="ch field-gold">
        <div className="wrap">
          <div className="narrow">
            <span className="kicker">One gene, four versions</span>
            <h2>Turn the dial</h2>
            <p>
              One plant, on a line the model never saw, with one designed gene set to versions 1, 3, 6 and 8. The gold outline
              is the stele the segmentation model found.
            </p>
          </div>
          <div className="two-col" style={{ alignItems: 'center', marginTop: 12 }}>
            <figure style={{ margin: 0, width: '100%', maxWidth: 'min(520px, 58vh)', justifySelf: 'center' }}>
              <div className="plate" style={{ aspectRatio: '1' }}>
                {DIAL.map((v, i) => (
                  <img
                    key={v}
                    src={`${ASSET}gene_dial/code${v}_outlined.png`}
                    alt={i === dial ? `Generated root with the designed gene at version ${v}; the stele is outlined in gold` : ''}
                    aria-hidden={i !== dial}
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: i === dial ? 1 : 0, transition: 'opacity 0.45s' }}
                  />
                ))}
                <span className="mono" style={{ position: 'absolute', left: 10, top: 10, background: 'var(--gold)', color: 'var(--ink)', padding: '2px 10px', borderRadius: 3, fontWeight: 500 }}>
                  gene = {DIAL[dial]}
                </span>
              </div>
              <div className="chips" role="radiogroup" aria-label="Gene version" style={{ marginTop: 12, marginBottom: 4, justifyContent: 'space-between', flexWrap: 'nowrap', gap: 6 }}>
                {DIAL.map((v, i) => (
                  <button key={v} role="radio" className="chip" aria-checked={dial === i} aria-pressed={dial === i} onClick={() => setDial(i)} style={{ flex: 1, paddingInline: 4 }}>
                    {v}
                  </button>
                ))}
              </div>
              <label htmlFor="d2d-dial" className="visually-hidden">
                Gene version
              </label>
              <input
                id="d2d-dial"
                type="range"
                min={0}
                max={3}
                step={1}
                value={dial}
                onChange={(e) => setDial(Number(e.target.value))}
                aria-valuetext={`gene version ${DIAL[dial]}`}
              />
            </figure>
            <div>
              <p className="pull">“Change one gene → the stele grows 19%. It grew in 99% of 256 line × seed tests.”</p>
              <p style={{ maxWidth: 440 }}>
                Watch the gold outline widen as the version goes up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
