import { useRef, useState } from 'react';
import { frameUrls, useFrames, useNear } from './hooks';

const DENOISE = frameUrls('denoise');
const LATENT = frameUrls('latent');

export function DenoiseSlider() {
  const ref = useRef<HTMLElement>(null);
  const near = useNear(ref);
  // decoded frames are already cached by the cold open; this only fetches the small latent frames
  useFrames(LATENT, near);
  useFrames(DENOISE, near);
  const [step, setStep] = useState(0);

  // the latent frames store the 4 channels as a 2 x 2 grid; lay them out side by side
  const QUAD = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];

  return (
    <section ref={ref} className="ch" id="d2d-denoise" aria-labelledby="d2d-denoise-h">
      <div className="wrap">
        <span className="kicker">04 · Denoising, step by step</span>
        <h2 id="d2d-denoise-h">Your turn to drive</h2>
        <p style={{ maxWidth: 640 }}>
          Same plant, same starting noise as the top of the page. Drag the slider and watch both views at once: the compressed
          code the model actually works in, and the image it decodes to.
        </p>

        <div className="denoise-views" style={{ marginTop: 28 }}>
          <figure style={{ margin: 0 }}>
            <div role="img" aria-label={`Compressed code at step ${step} of 50: four 32 by 32 channels`} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'clamp(4px, 1.2vw, 10px)' }}>
              {QUAD.map((pos, i) => (
                <div
                  key={pos}
                  className="plate"
                  style={{
                    aspectRatio: '1',
                    backgroundImage: `url(${LATENT[step]})`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: pos,
                    imageRendering: 'pixelated',
                  }}
                >
                  <span className="mono" style={{ position: 'absolute', left: 4, bottom: 2, fontSize: 11, color: 'var(--paper)', opacity: 0.8 }}>
                    ch {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="mono" style={{ marginTop: 8, opacity: 0.8 }}>
              compressed code: 4 channels × 32 × 32
            </figcaption>
          </figure>
          <div className="denoise-arrow mono" aria-hidden>
            <span className="arr-down">↓ </span>decode<span className="arr-right"> →</span>
          </div>
          <figure style={{ margin: 0 }}>
            <div className="plate" style={{ aspectRatio: '1' }}>
              <img src={DENOISE[step]} alt={`Decoded root image at step ${step} of 50`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <figcaption className="mono" style={{ marginTop: 8, opacity: 0.8 }}>
              decoded image
            </figcaption>
          </figure>
        </div>

        <div style={{ marginTop: 22 }}>
          <label htmlFor="d2d-step" className="visually-hidden">
            Denoising step
          </label>
          <input
            id="d2d-step"
            type="range"
            min={0}
            max={50}
            step={1}
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            aria-valuetext={`step ${step} of 50`}
          />
          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>random noise</span>
            <span style={{ color: 'var(--accent)' }}>step {step} / 50</span>
            <span>generated root</span>
          </div>
        </div>

        <p className="pull" style={{ marginTop: 36 }}>
          “Fifty small steps. At each one the model asks: what would this plant's root look like? The DNA tokens steer every step.”
        </p>
      </div>
    </section>
  );
}
