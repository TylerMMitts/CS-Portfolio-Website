import { ASSET } from './hooks';
import { D2dAd } from './D2dAd';

// Chapter 09: d2d, the software around the model, told as an animated advert built from a
// replica of its real dashboard, then what makes it practical for a lab, and the real screens.

const A = `${ASSET}agents/`;

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

const FEATURES = [
  ['Any image + genotype dataset', 'Roots, mice, leaves, cells: a folder of images and a 0/1/2 table, VCF or HapMap. Trait tables are optional.'],
  ['Agents only where judgement is needed', 'Every stage measures first. An agent is asked only when the rules aren’t confident, and code applies its answer.'],
  ['Every decision is editable', 'Each choice is plain JSON you can read, change and re-run from, so a run is reproducible.'],
  ['Runs on what a lab has', 'Rules only and free, the Claude API, or a Claude subscription. Training goes to the university cluster.'],
];

export function SoftwareChapter() {
  return (
    <section className="ch sw" id="d2d-software" aria-labelledby="d2d-sw-h" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <span className="kicker">09 · The software</span>
        <h2 id="d2d-sw-h" className="sw-hook">
          That mouse model? <em>The software built it.</em>
        </h2>
        <p style={{ maxWidth: 640, fontSize: 'clamp(17px, 4.4vw, 20px)' }}>
          Sorting the files, choosing what to measure, writing the training jobs, checking the models and scoring the images: d2d,
          the software I built, did every step from the dataset alone. A lab could hand it their own data the same way.
        </p>
        <p className="mono" style={{ opacity: 0.75, marginTop: 18 }}>
          here it is on the raw mouse X-rays ↓
        </p>
      </div>

      <D2dAd />

      <div className="wrap" style={{ paddingTop: 24 }}>
        <span className="sw-label">Built for any lab</span>
        <h3>Hand it a folder. It works out the rest.</h3>
        <div className="da-feats">
          {FEATURES.map(([k, v]) => (
            <div key={k} className="da-feat">
              <span className="k">{k}</span>
              <p>{v}</p>
            </div>
          ))}
        </div>

        <div className="sw-rule" />
        <span className="sw-label">The real dashboard</span>
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
      <div style={{ paddingBottom: 'clamp(56px, 9vh, 104px)' }} />
    </section>
  );
}
