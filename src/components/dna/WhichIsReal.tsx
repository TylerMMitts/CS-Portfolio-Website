import { useState } from 'react';
import { ASSET } from './hooks';

type Answers = Record<string, { genotype: string; kind: 'real' | 'generated' }>;
const TILES = Array.from({ length: 9 }, (_, i) => i + 1);

export function WhichIsReal() {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Answers | null>(null);
  const revealed = answers !== null;

  const toggle = (n: number) => {
    if (revealed) return;
    setPicked((s) => {
      const next = new Set(s);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };
  // answers are only fetched when the visitor asks for them
  const reveal = () =>
    fetch(`${ASSET}which_is_real/answers.json`)
      .then((r) => r.json())
      .then(setAnswers)
      .catch(() => {});
  const reset = () => {
    setAnswers(null);
    setPicked(new Set());
  };
  const score = answers ? TILES.filter((n) => (answers[n].kind === 'real') === picked.has(n)).length : 0;

  return (
    <section className="ch" id="d2d-game" aria-labelledby="d2d-game-h">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <span className="kicker">09 · Your turn</span>
        <h2 id="d2d-game-h">Which ones are real?</h2>
        <p>
          Some of these are real maize roots photographed through a microscope. The rest were generated from DNA. Every plant
          shown was held out of training. Tap the ones you think are real, then reveal.
        </p>

        <div className="tiles" role="group" aria-label="Root images: select the ones you think are real">
          {TILES.map((n) => {
            const a = answers?.[n];
            const right = a && (a.kind === 'real') === picked.has(n);
            return (
              <button
                key={n}
                className={`tile${revealed ? ' flipped' : ''}`}
                aria-pressed={picked.has(n)}
                aria-label={
                  a
                    ? `Tile ${n}: ${a.kind}. You marked it ${picked.has(n) ? 'real' : 'generated'}, ${right ? 'correct' : 'wrong'}.`
                    : `Tile ${n}${picked.has(n) ? ', marked real' : ''}`
                }
                onClick={() => toggle(n)}
              >
                <span className="tile-inner">
                  <span className="tile-face">
                    <img src={`${ASSET}which_is_real/tile_${n}.webp`} alt="" loading="lazy" />
                    <span className="pick" />
                    <span className="mark">{picked.has(n) ? `${n} · real?` : n}</span>
                  </span>
                  <span className="tile-face tile-back">
                    <img src={`${ASSET}which_is_real/tile_${n}.webp`} alt="" loading="lazy" style={{ filter: 'brightness(.55)' }} />
                    {a && (
                      <>
                        <span className="stamp-label" style={{ color: a.kind === 'real' ? 'var(--paper)' : 'var(--gold)' }}>
                          {a.kind === 'real' ? 'REAL' : 'GENERATED'}
                        </span>
                        <span className="mark" style={{ background: right ? 'var(--paper)' : 'var(--ink)', color: right ? 'var(--ink)' : 'var(--paper)' }}>
                          {right ? 'you got it' : 'missed'}
                        </span>
                      </>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 22 }} aria-live="polite">
          {!revealed ? (
            <>
              <button className="stamp gold" onClick={reveal}>
                Reveal
              </button>
              <span className="mono" style={{ opacity: 0.8 }}>
                {picked.size} marked real
              </span>
            </>
          ) : (
            <>
              <span className="poster-font" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--accent)', filter: 'var(--head-filter)' }}>
                {score} / 9 right
              </span>
              <button className="stamp" onClick={reset}>
                Play again
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
