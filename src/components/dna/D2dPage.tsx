import { useEffect } from 'react';
import './dna.css';
import { D2dAd } from './D2dAd';
import { AnyOrganism, ResultsShowcase } from './D2dShowcase';
import { Features } from './SoftwareChapter';
import { useFonts, usePageShell } from './shell';

// /d2d: the advert page for the d2d software, in the story's style. The demo run plays like a
// video on the real mouse run (raw X-rays, real flagged images), then the same software on
// other datasets, then what its Results pages produce (root runs).

export function D2dPage({ onBack }: { onBack: () => void }) {
  useFonts();
  usePageShell('#0b0b0a');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="d2d d2d-ad-page">
      <div className="d2d-grain" aria-hidden />
      <div className="topbar">
        <a
          href="/"
          className="stamp"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          ← Portfolio
        </a>
      </div>

      <main>
        <section className="ch sw-hero" aria-labelledby="d2d-ad-h">
          <div className="wrap">
            <span className="kicker">d2d · DNA to Display</span>
            <h1 id="d2d-ad-h" className="sw-hook">
              Hand it a folder. <em>It works out the rest.</em>
            </h1>
            <p style={{ maxWidth: 640, fontSize: 'clamp(17px, 4.4vw, 20px)' }}>
              d2d takes any dataset of images and genotypes from upload to a trained model that draws an organism’s image from
              its DNA, then scores those images against the real ones. AI agents make the judgement calls; code does everything
              else.
            </p>
            <p className="mono" style={{ opacity: 0.75, marginTop: 18 }}>
              watch a run ↓
            </p>
          </div>
        </section>

        <D2dAd dataset="mouse" />

        <div className="ch" style={{ paddingTop: 'clamp(56px, 10vh, 120px)' }}>
          <div className="wrap">
            <AnyOrganism />
            <div className="sw-rule" />
            <ResultsShowcase />
            <div className="sw-rule" />
            <span className="sw-label">Built for any lab</span>
            <h2 className="sw-h2">What makes it practical</h2>
            <Features />
            <p style={{ marginTop: 36 }}>
              <a className="stamp" href="/dna-story-preview">
                The research behind it →
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
