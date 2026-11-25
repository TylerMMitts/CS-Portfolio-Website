import { ReactNode, useEffect, useRef } from 'react';
import { clamp, lerp, smooth, useFrames, useReducedMotion, useScrollProgress } from './hooks';
import { easeIn, useStepScroll } from './useStepScroll';

interface Props {
  frames: string[];
  load: boolean; // start loading frames
  heightVh: number; // scroll length of the pinned scene
  // frame size at start/end, as a fraction of the larger/smaller screen side
  startCover?: boolean;
  endFraction?: number;
  endOffset?: number; // vertical shift of the final frame, as a fraction of screen height
  invert?: boolean;
  // image whose opaque pixels mark the background around the final root; it is cut away
  // (made transparent) as the root takes shape, leaving a clean cut-out on the page
  cutout?: string;
  backdrop?: ReactNode; // drawn behind the canvas
  // progress stops: each swipe glides to the next one instead of scrolling freely
  stops?: number[];
  stepMs?: number; // time to glide through the whole scene
  // overlay rendered on top of the canvas; receives the element refs to animate by progress
  onProgress?: (p: number) => void;
  children?: ReactNode;
  label: string;
}

// Scroll position -> denoising step. Early steps change very little, so scroll runs
// through them quickly (ease-out on the step index) and slows where the structure appears.
const stepFor = (p: number) => Math.round(50 * (1 - Math.pow(1 - clamp(p), 1.8)));

export function ScrubCanvas({ frames, load, heightVh, startCover, endFraction = 0.84, endOffset = 0, invert, cutout, backdrop, stops, stepMs = 2600, onProgress, children, label }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { frames: imgs } = useFrames(frames, load);
  const progress = useRef(0);
  const imgsRef = useRef(imgs);
  imgsRef.current = imgs;
  const cutRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!cutout || !load) return;
    const im = new Image();
    im.onload = () => {
      cutRef.current = im;
      draw();
    };
    im.src = cutout;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cutout, load]);

  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const p = reduced ? 1 : progress.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // nearest loaded frame at or below the target step
    let i = stepFor(p);
    while (i > 0 && !imgsRef.current[i]) i--;
    const img = imgsRef.current[i];
    if (!img) return;
    // portrait phones: use most of the width, since there's height to spare
    const endSize = h > w * 1.3 ? Math.min(w * 0.92, h * 0.56) : Math.min(w, h) * endFraction;
    const startSize = startCover ? Math.max(w, h) : endSize;
    const t = 1 - Math.pow(1 - clamp(p / 0.85), 2);
    const s = lerp(startSize, endSize, t);
    ctx.imageSmoothingQuality = 'high';
    const dy = endOffset * h * t;
    const x = (w - s) / 2;
    const y = (h - s) / 2 + dy;
    ctx.drawImage(img, x, y, s, s);
    // the root becomes recognisable around step 34; cut its background away by step 44
    const k = cutRef.current ? smooth(i, 33, 44) : 0;
    if (k > 0) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = k;
      ctx.drawImage(cutRef.current!, x, y, s, s);
      // the image's anti-aliased square edge survives the mask at partial alpha; clear a thin band along it
      const e = Math.max(3, s * 0.008);
      ctx.beginPath();
      ctx.rect(x - 2, y - 2, s + 4, s + 4);
      ctx.rect(x + e, y + e, s - 2 * e, s - 2 * e);
      ctx.fill('evenodd');
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  };

  // the denoise starts slow and speeds up as the root appears
  useStepScroll(trackRef, stops, stepMs, !reduced, easeIn);

  useScrollProgress(trackRef, (p) => {
    progress.current = p;
    draw();
    onProgress?.(reduced ? 1 : p);
  });

  // redraw as frames arrive
  useEffect(draw, [imgs, reduced]);

  return (
    <div ref={trackRef} className="pin-track" style={{ height: reduced ? '100vh' : `${heightVh}vh` }}>
      <div className="pin">
        {backdrop}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: invert ? 'invert(1)' : undefined }}
        />
        {children}
      </div>
    </div>
  );
}
