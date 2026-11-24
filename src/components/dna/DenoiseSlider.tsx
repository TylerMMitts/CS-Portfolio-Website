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

  const panel = (src: string, alt: string, caption: string, pixelated?: boolean) => (
    <figure style={{ margin: 0 }}>
      <div style={{ position: 'relative', aspectRatio: '1', background: '#000' }}>
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: pixelated ? 'pixelated' : 'auto' }}
        />
      </div>
      <figcaption className="mono" style={{ marginTop: 8, opacity: 0.8 }}>
        {caption}
      </figcaption>
    </figure>
  );

  return (
    <section ref={ref} className="ch" id="d2d-denoise" aria-labelledby="d2d-denoise-h">
      <div className="wrap">
        <span className="kicker">04 · Denoising, step by step</span>
        <h2 id="d2d-denoise-h">Your turn to drive</h2>
        <p style={{ maxWidth: 640 }}>
          Same plant, same starting noise as the top of the page. Drag the slider and watch both views at once: the compressed
          code the model actually works in, and the image it decodes to.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'clamp(10px, 3vw, 28px)', marginTop: 28 }}>
          {panel(LATENT[step], `Compressed code at step ${step} of 50`, 'compressed code (4 × 32 × 32)', true)}
          {panel(DENOISE[step], `Decoded root image at step ${step} of 50`, 'decoded image')}
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
            <span style={{ color: 'var(--gold)' }}>step {step} / 50</span>
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
