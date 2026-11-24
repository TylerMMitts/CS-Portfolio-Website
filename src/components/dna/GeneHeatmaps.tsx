import { useState } from 'react';
import { ASSET } from './hooks';

// Heat maps from the synthetic RIL population. For each designed gene, its chromosome region was
// swapped to the other parent's version on unseen lines (same noise before and after), each pair
// was aligned on the root, and the change was averaged. Shown over a root image from the RIL
// dataset, aligned to the same frame.
const GENES: { key: string; title: string; tissue: string; found: string; note?: string; control?: boolean }[] = [
  { key: 'shared_stele_mx', title: 'Shared gene', tissue: 'stele + vessels', found: 'stele' },
  { key: 'mx_diam_add', title: 'Vessel-width gene', tissue: 'vessels', found: 'vessels' },
  { key: 'mx_diam_epi', title: 'Interacting gene', tissue: 'vessels', found: 'vessels' },
  { key: 'ctx_q1', title: 'Cortex gene 1', tissue: 'cortex', found: 'cortex' },
  { key: 'ctx_q2', title: 'Cortex gene 2', tissue: 'cortex', found: 'cortex' },
  { key: 'rca_linked1', title: 'Aerenchyma gene', tissue: 'air channels', found: 'air channels' },
  {
    key: 'lac_q',
    title: 'Lacuna gene',
    tissue: 'air channels',
    found: 'air channels',
    note: 'This trait was never measured or given to the model. It still found where the gene acts.',
  },
  { key: 'control6', title: 'Control region', tissue: 'none (no designed gene)', found: 'nothing: stays quiet', control: true },
];

export function GeneHeatmaps() {
  const [sel, setSel] = useState(0);
  const [strength, setStrength] = useState(85);
  const g = GENES[sel];

  return (
    <section className="ch" id="d2d-maps" aria-labelledby="d2d-maps-h">
      <div className="wrap">
        <span className="kicker">06 · Where the DNA shows up</span>
        <h2 id="d2d-maps-h">Swap one gene, see where the root changes</h2>
        <p style={{ maxWidth: 680 }}>
          Back in the synthetic population, where we know what every gene does. For each designed gene we swapped its
          chromosome region to the other parent's version, regenerated the root from the same noise, and mapped where the
          image changed. Each map averages 96 line–seed pairs on lines the model never saw.
        </p>

        <div className="two-col" style={{ alignItems: 'start', marginTop: 28 }}>
          <div>
            <div className="plate" style={{ background: '#fff', aspectRatio: '1', maxWidth: 560 }}>
              <img
                src={`${ASSET}gene_maps/base_root.webp`}
                alt="A root cross-section image from the synthetic RIL dataset"
                loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
              {GENES.map((x, i) => (
                <img
                  key={x.key}
                  src={`${ASSET}gene_maps/${x.key}.png`}
                  alt={i === sel ? `Heat map for the ${x.title.toLowerCase()}: where the image changes when it is swapped` : ''}
                  aria-hidden={i !== sel}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: i === sel ? strength / 100 : 0,
                    transition: 'opacity 0.35s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, maxWidth: 560 }}>
              <label htmlFor="d2d-map-strength" className="mono" style={{ whiteSpace: 'nowrap', opacity: 0.85 }}>
                heat map
              </label>
              <input
                id="d2d-map-strength"
                type="range"
                min={0}
                max={100}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                aria-valuetext={`heat map at ${strength}% opacity`}
              />
            </div>
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }} aria-hidden>
              tissue lost
              <span style={{ width: 140, height: 10, borderRadius: 5, background: 'linear-gradient(90deg, #1F3F8F, #4E7BE8, rgb(var(--fg-rgb) / .1), #F1B82D)' }} />
              tissue gained
            </div>
          </div>

          <div>
            <div className="gene-list" role="group" aria-label="Designed genes">
              {GENES.map((x, i) => (
                <button key={x.key} className="gene-item" aria-pressed={i === sel} onClick={() => setSel(i)}>
                  <img src={`${ASSET}gene_maps/${x.key}.png`} alt="" loading="lazy" />
                  <span style={{ opacity: 1 }}>
                    <b>{x.title}</b>
                    <span>{x.tissue}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="card" style={{ marginTop: 16 }} aria-live="polite">
              <div className="mono" style={{ color: 'var(--accent)' }}>{g.title}</div>
              <p className="mono" style={{ margin: '8px 0 0' }}>
                designed to act on: {g.tissue}
                <br />
                map points to: {g.found} {g.control ? '' : '✓'}
              </p>
              {g.note && <p style={{ margin: '10px 0 0', fontWeight: 600 }}>{g.note}</p>}
            </div>
          </div>
        </div>

        <p className="pull" style={{ marginTop: 40 }}>
          “12 of 14 designed genes point to the right tissue, and the control regions stay quiet.”
        </p>
        <p className="note-honest" style={{ maxWidth: 680 }}>
          These are averages over many plants in a population we designed, so we can check them against the answer key. On
          real plants the same method shows what the model is sensitive to, not proven biology.
        </p>
      </div>
    </section>
  );
}
