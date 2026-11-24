import { KeyboardEvent, PointerEvent, useMemo, useRef, useState } from 'react';
import { ASSET, clamp, useJson, useNear } from './hooks';

interface Block {
  id: number;
  first_locus: string;
  last_locus: string;
  n_loci: number;
  loci_changed: number;
  whole_image_change: number;
  image: string;
}
interface Contribution {
  genotype: string;
  contrast_genotype: string;
  seed: number;
  grid: number;
  n_blocks: number;
  blocks: Block[];
  cells: number[][][];
}

const LENS = 96; // lens diameter in px
// same ramp as the heatmap overlay: ink -> blue -> gold -> cream
const RAMP = ['#0E0D0B', '#1F3F8F', '#4E7BE8', '#F1B82D', '#F1E6CC'];
function rampColor(v: number) {
  const t = clamp(v) * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(t));
  const f = t - i;
  const a = [1, 3, 5].map((k) => parseInt(RAMP[i].slice(k, k + 2), 16));
  const b = [1, 3, 5].map((k) => parseInt(RAMP[i + 1].slice(k, k + 2), 16));
  return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * f)).join(',')})`;
}

export function ContributionMap() {
  const ref = useRef<HTMLElement>(null);
  const near = useNear(ref);
  const data = useJson<Contribution>(`${ASSET}contribution/contribution.json`, near);
  const boxRef = useRef<HTMLDivElement>(null);
  // lens position as a fraction of the image (null = no lens yet)
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [hoverBlock, setHoverBlock] = useState<number | null>(null);
  const [lockedBlock, setLockedBlock] = useState<number | null>(null);
  const block = hoverBlock ?? lockedBlock;
  // keeps the last swapped image mounted so it can fade out
  const lastBlock = useRef<number | null>(null);
  if (block !== null) lastBlock.current = block;

  const grid = data?.grid ?? 16;
  const cell = lens ? { r: Math.min(grid - 1, Math.floor(lens.y * grid)), c: Math.min(grid - 1, Math.floor(lens.x * grid)) } : null;
  const values = data && cell ? data.cells[cell.r][cell.c] : null;
  // one scale for every patch (as in the data), so quiet patches look quiet
  const globalMax = useMemo(() => {
    let m = 1;
    data?.cells.forEach((row) => row.forEach((c) => c.forEach((v) => (m = Math.max(m, v)))));
    return m;
  }, [data]);

  const place = (e: PointerEvent<HTMLDivElement>) => {
    const r = boxRef.current!.getBoundingClientRect();
    setLens({ x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = 1 / grid;
    const cur = lens ?? { x: 0.5 + d / 2, y: 0.5 + d / 2 };
    const moves: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setLens({ x: clamp(cur.x + m[0], d / 2, 1 - d / 2), y: clamp(cur.y + m[1], d / 2, 1 - d / 2) });
  };

  const lensMask = lens
    ? `radial-gradient(circle ${LENS / 2}px at ${lens.x * 100}% ${lens.y * 100}%, #000 92%, transparent 100%)`
    : 'none';
  const b = data && block !== null ? data.blocks[block] : null;

  return (
    <section ref={ref} className="ch" id="d2d-map" aria-labelledby="d2d-map-h">
      <div className="wrap">
        <span className="kicker">05 · Where the DNA shows up</span>
        <h2 id="d2d-map-h">Swap a piece of genome, see what moves</h2>
        <p style={{ maxWidth: 680 }}>
          We cut the genome into 40 consecutive blocks. One at a time, each block was replaced with the version from another
          plant ({data?.contrast_genotype ?? 'MEMA318'}, the most different trained plant), the root was regenerated from the
          same noise, and we measured where the picture changed.
        </p>
        <p className="mono" style={{ opacity: 0.85 }}>
          {typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
            ? 'Move over the root to look through the lens. Hover a block to swap it in.'
            : 'Tap or drag on the root to place the lens. Tap a block to swap it in.'}
        </p>

        <div className="two-col" style={{ alignItems: 'start', marginTop: 24 }}>
          <div>
            <div
              ref={boxRef}
              tabIndex={0}
              role="application"
              aria-label="Generated root. Use the arrow keys to move the lens over 16 by 16 patches."
              onPointerMove={(e) => (e.pointerType === 'mouse' || e.buttons) && place(e)}
              onPointerDown={place}
              onKeyDown={onKey}
              style={{ position: 'relative', aspectRatio: '1', background: '#000', touchAction: 'pan-y', userSelect: 'none', maxWidth: 520 }}
            >
              <img src={`${ASSET}contribution/root.webp`} alt="Generated root for plant MEMA042" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              {data && lastBlock.current !== null && (
                <img
                  src={`${ASSET}contribution/${data.blocks[lastBlock.current].image}`}
                  alt={block !== null ? `The same root regenerated with genome block ${block + 1} swapped` : ''}
                  aria-hidden={block === null}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: block !== null ? 1 : 0,
                    transition: 'opacity 0.35s',
                  }}
                />
              )}
              <img
                src={`${ASSET}contribution/heatmap_total.png`}
                alt=""
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  opacity: block !== null ? 0 : showAll || lens ? 1 : 0,
                  WebkitMaskImage: showAll ? 'none' : lensMask,
                  maskImage: showAll ? 'none' : lensMask,
                  transition: 'opacity 0.25s',
                }}
              />
              {lens && !showAll && block === null && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: `calc(${lens.x * 100}% - ${LENS / 2}px)`,
                    top: `calc(${lens.y * 100}% - ${LENS / 2}px)`,
                    width: LENS,
                    height: LENS,
                    borderRadius: '50%',
                    border: '2px solid var(--paper)',
                    boxShadow: '0 0 0 2px rgba(14,13,11,.6)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
            <div className="mono" style={{ margin: '14px 0 6px', opacity: 0.85 }}>
              40 genome blocks · brighter = changed this patch more
            </div>
            <div role="group" aria-label="Genome blocks" style={{ display: 'grid', gridTemplateColumns: 'repeat(20, minmax(0, 1fr))', gap: 3 }}>
              {(data?.blocks ?? Array.from({ length: 40 }, (_, id) => ({ id }) as Block)).map((bl) => {
                const v = values ? Math.sqrt(values[bl.id] / globalMax) : 0.12;
                const selected = block === bl.id;
                return (
                  <button
                    key={bl.id}
                    aria-label={`Block ${bl.id + 1}${values ? `, changed this patch by ${values[bl.id]} of 255` : ''}`}
                    aria-pressed={lockedBlock === bl.id}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setHoverBlock(bl.id)}
                    onPointerLeave={() => setHoverBlock(null)}
                    onFocus={() => setHoverBlock(bl.id)}
                    onBlur={() => setHoverBlock(null)}
                    onClick={() => setLockedBlock((cur) => (cur === bl.id ? null : bl.id))}
                    style={{
                      height: 44,
                      background: rampColor(v),
                      outline: selected ? '3px solid var(--paper)' : 'none',
                      outlineOffset: 1,
                      border: '1px solid rgba(241,230,204,.15)',
                      transition: 'background 0.2s',
                    }}
                  />
                );
              })}
            </div>
            <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7, marginTop: 6 }}>
              <span>start of gene list</span>
              <span>end</span>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14, alignItems: 'center' }}>
              <button className="stamp gold" aria-pressed={showAll} onClick={() => setShowAll((s) => !s)}>
                {showAll ? 'Hide full heatmap' : 'Show full heatmap'}
              </button>
              <span className="scrawl" style={{ transform: 'rotate(-4deg)' }}>
                ← the big vessels move the most
              </span>
            </div>
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }} aria-hidden>
              small change
              <span style={{ flex: '0 1 160px', height: 10, background: `linear-gradient(90deg, ${RAMP.slice(1).join(',')})` }} />
              large
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 6 }}>Reading the map</h3>
            <p className="mono" style={{ opacity: 0.85 }}>
              {values
                ? `Lens on patch row ${cell!.r + 1}, column ${cell!.c + 1}. The strip under the root shows which blocks changed it.`
                : 'Place the lens to light up the blocks that change that patch.'}
            </p>
            <div className="card" style={{ marginTop: 6, minHeight: 150 }} aria-live="polite">
              {b ? (
                <>
                  <div className="mono" style={{ color: 'var(--gold)' }}>
                    Block {b.id + 1} swapped in {lockedBlock === b.id ? '(tap again to undo)' : ''}
                  </div>
                  <p className="mono" style={{ margin: '8px 0 0', wordBreak: 'break-word' }}>
                    genes {b.first_locus} → {b.last_locus}
                    <br />
                    {b.loci_changed.toLocaleString()} of {b.n_loci.toLocaleString()} loci changed
                    <br />
                    whole-image change: {b.whole_image_change}
                  </p>
                </>
              ) : (
                <p style={{ margin: 0 }}>
                  Pick a block to see the root regenerated with that block swapped, and what changed in it.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="wrap narrow" style={{ marginTop: 40, marginLeft: 0 }}>
          <p className="note-honest">
            This shows what the model is sensitive to for one plant and one noise seed, not proven biology.
          </p>
          <p style={{ opacity: 0.8 }}>
            Blocks follow gene-ID order, which is close to, but not exactly, chromosome order, so they aren't chromosomes.
          </p>
        </div>
      </div>
    </section>
  );
}
