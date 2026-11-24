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

const GENE_MAPS: { file: string; title: string; subtitle: string; special?: boolean }[] = [
  { file: 'shared_stele_mx', title: 'Shared gene', subtitle: 'stele tissue' },
  { file: 'mx_diam_add', title: 'Vessel-width gene', subtitle: 'vessel tissue' },
  { file: 'mx_diam_epi', title: 'Interacting gene', subtitle: 'vessel tissue' },
  { file: 'ctx_q1', title: 'Cortex gene 1', subtitle: 'cortex tissue' },
  { file: 'ctx_q2', title: 'Cortex gene 2', subtitle: 'cortex tissue' },
  { file: 'rca_linked1', title: 'Aerenchyma gene', subtitle: 'air-channel tissue' },
  { file: 'lac_q', title: 'Lacuna gene', subtitle: 'trait never measured: the model still found it', special: true },
  { file: 'control6', title: 'Control region', subtitle: 'no designed gene: should stay quiet' },
];

export function AccuracyChapter() {
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
                Real plants don't come with an answer key. So we built a simulated population of 2,500 maize lines with root
                genes we designed ourselves and simulated root images, so the true answer is known.
              </p>
              <p>The model was trained on 1,780 lines and tested on 198 it never saw.</p>
            </div>
            <span className="scrawl paper" style={{ alignSelf: 'center', justifySelf: 'center' }}>
              we wrote the genes, so we know the answers
            </span>
          </div>

          <div className="stat-tiles">
            <div className="stat">
              <b>0.81</b>
              <span>average r over six traits</span>
            </div>
            <div className="stat">
              <b>0.89 vs 0.51</b>
              <span>a trait controlled by two interacting genes (model vs GBLUP, the standard genomic-prediction method)</span>
            </div>
            <div className="stat">
              <b>198</b>
              <span>lines never seen in training</span>
            </div>
          </div>

          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>{traits.length > 0 && <Scatter traits={traits} baseName="GBLUP" idLabel="line" xLabel={(t) => `true genetic value${t.unit ? ` (${t.unit})` : ''}`} />}</div>
            <div>
              <h3>Be honest about it</h3>
              <p>
                Each dot is one unseen line. Gold: measured on images the model generated. Grey: GBLUP, the standard
                genomic-prediction method.
              </p>
              <p>
                GBLUP is more accurate on five of the six traits. The model wins on metaxylem diameter, which is controlled by
                two interacting genes: a straight-line method can't see that effect. And the model hands back a whole image,
                not one number.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gene dial, on a gold field */}
      <div className="ch field-gold">
        <div className="wrap two-col">
          <div>
            <span className="kicker">One gene, four versions</span>
            <h2>Turn the dial</h2>
            <p>
              One plant, on a line the model never saw, with one designed gene set to versions 1, 3, 6 and 8. The gold outline
              is the stele the segmentation model found.
            </p>
            <div className="chips" role="radiogroup" aria-label="Gene version">
              {DIAL.map((v, i) => (
                <button
                  key={v}
                  role="radio"
                  className="chip"
                  aria-checked={dial === i}
                  aria-pressed={dial === i}
                  onClick={() => setDial(i)}
                  style={dial === i ? { background: 'var(--ink)', color: 'var(--gold)', borderColor: 'var(--ink)' } : { color: 'var(--ink)', borderColor: 'rgba(14,13,11,.5)' }}
                >
                  gene = {v}
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
              style={{ filter: 'invert(1) hue-rotate(180deg)' }}
            />
            <p className="pull" style={{ marginTop: 24 }}>
              “Change one gene → the stele grows 19%. It grew in 99% of 256 line × seed tests.”
            </p>
          </div>
          <div style={{ position: 'relative', aspectRatio: '1', background: '#000', maxWidth: 520, width: '100%', justifySelf: 'center' }}>
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
            <span className="scrawl ink" style={{ position: 'absolute', right: -6, bottom: -38, transform: 'rotate(-5deg)' }}>
              gene = {DIAL[dial]}
            </span>
          </div>
        </div>
      </div>

      {/* Gene maps gallery */}
      <div className="ch">
        <div className="wrap">
          <span className="kicker">Gene maps</span>
          <h2>Where does each gene act?</h2>
          <p style={{ maxWidth: 640 }}>
            Swap one designed gene and map where the image gains or loses tissue. Gold is tissue gained, blue is tissue lost,
            and the stronger the change, the more solid the colour.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 40vw), 1fr))', gap: 'clamp(14px, 3vw, 28px)', marginTop: 28 }}>
            {GENE_MAPS.map((g, i) => (
              <figure key={g.file} style={{ margin: 0, transform: `rotate(${[-1.5, 1, -0.5, 1.8, -1.2, 0.6, -1.8, 1.2][i]}deg)` }}>
                <img src={`${ASSET}gene_maps/${g.file}.png`} alt={`Gene map: ${g.title}, ${g.subtitle}`} loading="lazy" style={{ width: '100%', aspectRatio: '1' }} />
                <figcaption style={{ marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--f-poster)', textTransform: 'uppercase', fontSize: 20, letterSpacing: '0.02em' }}>{g.title}</span>
                  <br />
                  <span style={{ fontSize: 16, color: g.special ? 'var(--gold)' : 'inherit', fontWeight: g.special ? 700 : 400, opacity: g.special ? 1 : 0.8 }}>{g.subtitle}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24 }} aria-hidden>
            lost <span style={{ width: 160, height: 10, background: 'linear-gradient(90deg, #1F3F8F, #4E7BE8, transparent, #F1B82D)' }} /> gained
          </div>
          <p className="pull" style={{ marginTop: 28 }}>
            “Swap one designed gene and map where tissue is gained or lost: 12 of 14 designed genes point to the right tissue.”
          </p>
          <p className="mono" style={{ opacity: 0.75 }}>96 line–seed pairs per gene, on unseen lines.</p>
        </div>
      </div>
    </section>
  );
}
