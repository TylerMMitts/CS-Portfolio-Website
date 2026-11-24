import { KeyboardEvent, PointerEvent, useMemo, useRef, useState } from 'react';

export interface ScatterTrait {
  key: string;
  label: string;
  unit?: string;
  rModel: number;
  rBase: number;
  points: { id: string; x: number; yModel: number; yBase: number }[];
}

interface Props {
  traits: ScatterTrait[];
  baseName: string; // "GBLUP" or "genomic prediction"
  xLabel: (t: ScatterTrait) => string;
  idLabel: string; // "line" or "mouse"
}

const W = 400;
const H = 320;
const M = { l: 14, r: 12, t: 12, b: 14 };

const fmt = (v: number) => v.toFixed(2);

// Gold circles (with an ink outline) for the model, small grey squares for the baseline,
// so the two never differ by colour alone.
export function Scatter({ traits, baseName, xLabel, idLabel }: Props) {
  const [ti, setTi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const t = traits[ti];

  const scales = useMemo(() => {
    const xs = t.points.map((p) => p.x);
    const ys = t.points.flatMap((p) => [p.yModel, p.yBase]);
    const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
    const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
    const px = (x1 - x0) * 0.04 || 1;
    const py = (y1 - y0) * 0.04 || 1;
    const sx = (v: number) => M.l + ((v - (x0 - px)) / (x1 - x0 + 2 * px)) * (W - M.l - M.r);
    const sy = (v: number) => H - M.b - ((v - (y0 - py)) / (y1 - y0 + 2 * py)) * (H - M.t - M.b);
    return { sx, sy };
  }, [t]);

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    let best = -1;
    let bd = 22 * 22;
    t.points.forEach((p, i) => {
      for (const yy of [p.yModel, p.yBase]) {
        const d = (scales.sx(p.x) - x) ** 2 + (scales.sy(yy) - y) ** 2;
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
    });
    setSel(best >= 0 ? best : null);
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const order = t.points.map((p, i) => [p.x, i]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
    const pos = sel === null ? -1 : order.indexOf(sel);
    const next = e.key === 'ArrowRight' ? Math.min(order.length - 1, pos + 1) : Math.max(0, pos - 1);
    setSel(order[next]);
  };

  const p = sel !== null ? t.points[sel] : null;

  return (
    <div>
      <div className="chips" role="tablist" aria-label="Trait">
        {traits.map((tr, i) => (
          <button
            key={tr.key}
            role="tab"
            className="chip"
            aria-selected={i === ti}
            onClick={() => {
              setTi(i);
              setSel(null);
            }}
          >
            {tr.label}
          </button>
        ))}
      </div>

      <div className="mono" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" aria-hidden>
            <circle cx="8" cy="8" r="6" fill="#F1B82D" stroke="#0E0D0B" strokeWidth="1" />
          </svg>
          model r = {fmt(t.rModel)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
          <svg width="16" height="16" aria-hidden>
            <rect x="4" y="4" width="8" height="8" fill="#8C8A84" />
          </svg>
          {baseName} r = {fmt(t.rBase)}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          tabIndex={0}
          role="img"
          aria-label={`${t.label}: each of ${t.points.length} ${idLabel}s plotted twice, true value against the model's prediction (r ${fmt(t.rModel)}) and ${baseName}'s (r ${fmt(t.rBase)}). Use the left and right arrow keys to step through points.`}
          onPointerMove={(e) => e.pointerType === 'mouse' && pick(e)}
          onPointerDown={pick}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setSel(null)}
          onKeyDown={onKey}
          style={{ width: '100%', height: 'auto', display: 'block', background: 'rgb(var(--fg-rgb) / .04)', border: '1.5px solid rgb(var(--fg-rgb) / .25)', borderRadius: 4, color: 'var(--fg)', touchAction: 'pan-y' }}
        >
          {t.points.map((pt, i) => (
            <rect key={`b${i}`} x={scales.sx(pt.x) - 2.2} y={scales.sy(pt.yBase) - 2.2} width="4.4" height="4.4" fill="#8C8A84" opacity={sel === null || sel === i ? 0.75 : 0.3} />
          ))}
          {t.points.map((pt, i) => (
            <circle key={`m${i}`} cx={scales.sx(pt.x)} cy={scales.sy(pt.yModel)} r="3.6" fill="#F1B82D" stroke="#0E0D0B" strokeWidth="1" opacity={sel === null || sel === i ? 0.95 : 0.35} />
          ))}
          {p && (
            <g pointerEvents="none">
              <line x1={scales.sx(p.x)} x2={scales.sx(p.x)} y1={scales.sy(p.yModel)} y2={scales.sy(p.yBase)} stroke="currentColor" strokeDasharray="3 3" />
              <circle cx={scales.sx(p.x)} cy={scales.sy(p.yModel)} r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x={scales.sx(p.x) - 6} y={scales.sy(p.yBase) - 6} width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
            </g>
          )}
        </svg>
        {p && (
          <div
            className="tooltip"
            style={{
              left: `${Math.min(62, Math.max(2, (scales.sx(p.x) / W) * 100 - 18))}%`,
              top: `${Math.max(2, (Math.min(scales.sy(p.yModel), scales.sy(p.yBase)) / H) * 100 - 30)}%`,
            }}
          >
            {idLabel} {p.id}
            <br />
            true {Number.isInteger(p.x) ? p.x : p.x.toFixed(2)}
            {t.unit ? ` ${t.unit}` : ''}
            <br />
            model {fmt(p.yModel)} · {baseName === 'GBLUP' ? 'GBLUP' : 'GP'} {fmt(p.yBase)}
          </div>
        )}
      </div>
      <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6, opacity: 0.8 }}>
        <span>← {xLabel(t)} →</span>
        <span>↑ prediction (standardised)</span>
      </div>
    </div>
  );
}
