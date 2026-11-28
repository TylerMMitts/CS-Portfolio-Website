import { D2dAd } from './D2dAd';
import { ResultsShowcase } from './D2dShowcase';

// Chapter 09: d2d, the software around the model, told as an animated advert built from a
// replica of its real dashboard, then what its Results pages produce and what makes it practical.

export const FEATURES = [
  ['Any image + genotype dataset', 'Roots, mice, leaves, cells: a folder of images and a 0/1/2 table, VCF or HapMap. Trait tables are optional.'],
  ['Agents only where judgement is needed', 'Every stage measures first. An agent is asked only when the rules aren’t confident, and code applies its answer.'],
  ['Every decision is editable', 'Each choice is plain JSON you can read, change and re-run from, so a run is reproducible.'],
  ['Runs on what a lab has', 'Rules only and free, the Claude API, or a Claude subscription. Train here, or export a bundle for a workstation or cluster.'],
];

export function Features() {
  return (
    <div className="da-feats">
      {FEATURES.map(([k, v]) => (
        <div key={k} className="da-feat">
          <span className="k">{k}</span>
          <p>{v}</p>
        </div>
      ))}
    </div>
  );
}

export function SoftwareChapter() {
  return (
    <section className="ch sw" id="d2d-software" aria-labelledby="d2d-sw-h" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <span className="kicker">09 · The software</span>
        <h2 id="d2d-sw-h" className="sw-hook">
          That mouse model? <em>The software built it.</em>
        </h2>
        <p style={{ maxWidth: 640, fontSize: 'clamp(17px, 4.4vw, 20px)' }}>
          Sorting the files, cleaning the X-rays, choosing what to measure, writing the training jobs, checking the models and
          scoring the images: d2d, the software I built, did every step from the raw download alone. A lab could hand it their
          own data the same way.
        </p>
        <p className="mono" style={{ opacity: 0.75, marginTop: 18 }}>
          here it is on the raw mouse X-rays ↓
        </p>
      </div>

      <D2dAd dataset="mouse" />

      <div className="wrap" style={{ paddingTop: 'clamp(48px, 8vh, 96px)' }}>
        <ResultsShowcase whatIf={false} />

        <div className="sw-rule" />
        <span className="sw-label">Built for any lab</span>
        <h3>Hand it a folder. It works out the rest.</h3>
        <Features />
        <p style={{ marginTop: 22 }}>
          <a className="stamp" href="/d2d">
            More on d2d →
          </a>
        </p>
      </div>
      <div style={{ paddingBottom: 'clamp(56px, 9vh, 104px)' }} />
    </section>
  );
}
