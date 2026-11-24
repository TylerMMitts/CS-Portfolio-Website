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
const H = 360;
const M = { l: 34, r: 12, t: 12, b: 38 }; // room for the axis titles

const fmt = (v: number) => v.toFixed(2);

// Gold circles (with an ink outline) for the model, small grey squares for the baseline,
// so the two never differ by colour alone.
export function Scatter({ traits, baseName, xLabel, idLabel }: Props) {
  const [ti, setTi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const t = traits[ti];

  // Predictions are standardised, so the true values are standardised too and both axes share
  // one range: a perfect prediction sits on the diagonal.
  const scales = useMemo(() => {
    const xs = t.points.map((p) => p.x);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length) || 1;
    const zx = (v: number) => (v - mean) / sd;
    const all = [...xs.map(zx), ...t.points.flatMap((p) => [p.yModel, p.yBase])];
    const [lo0, hi0] = [Math.min(...all), Math.max(...all)];
    const pad = (hi0 - lo0) * 0.04 || 1;
    const [lo, hi] = [lo0 - pad, hi0 + pad];
    const fx = (z: number) => M.l + ((z - lo) / (hi - lo)) * (W - M.l - M.r);
    const sy = (v: number) => H - M.b - ((v - lo) / (hi - lo)) * (H - M.t - M.b);
    const sx = (v: number) => fx(zx(v));
    return { sx, sy, diag: [fx(lo), sy(lo), fx(hi), sy(hi)] };
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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
          <svg width="22" height="16" aria-hidden>
            <line x1="1" y1="15" x2="21" y2="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          perfect prediction
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
          {/* axes, with their titles along them */}
          <line x1={M.l} y1={H - M.b} x2={W - M.r} y2={H - M.b} stroke="currentColor" strokeOpacity="0.5" />
          <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="currentColor" strokeOpacity="0.5" />
          <text x={(M.l + W - M.r) / 2} y={H - 12} textAnchor="middle" fill="currentColor" opacity="0.85" style={{ font: '13px var(--f-mono)' }}>
            {xLabel(t)}
          </text>
          <text
            x={16}
            y={(M.t + H - M.b) / 2}
            textAnchor="middle"
            fill="currentColor"
            opacity="0.85"
            transform={`rotate(-90 16 ${(M.t + H - M.b) / 2})`}
            style={{ font: '13px var(--f-mono)' }}
          >
            prediction (standardised)
          </text>
          <line x1={scales.diag[0]} y1={scales.diag[1]} x2={scales.diag[2]} y2={scales.diag[3]} stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="6 5" />
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
    </div>
  );
}
