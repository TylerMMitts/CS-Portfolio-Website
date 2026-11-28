import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ASSET,
  clamp,
  frameUrls,
  useFrames,
  useJson,
  useNear,
  usePlayOnView,
} from "./hooks";
import type { AdRun } from "./D2dAd";

// Two scroll-triggered showcases for d2d, in the dashboard's style:
// - AnyOrganism: the same software on root, seed and mouse datasets
// - ResultsShowcase: what the Results pages produce, animated from the root runs
//   (data/accuracy_scatter.json, gene_maps/, gene_dial/, agents/roots/)

const A = `${ASSET}agents/`;
const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const seg = (k: number, a: number, b: number) => clamp((k - a) / (b - a));

// ---------------------------------------------------------------------------------------
// Any organism

const ORGS = [
  {
    key: "root",
    kind: "Plant anatomy · microscope",
    title: "Root cross-sections",
    meta: "2,500 lines · 43,788 markers · HapMap",
    agent: "stain drift between days, blurred sections, cracked roots",
    frames: "denoise",
    invert: false,
  },
  {
    key: "seed",
    kind: "Seed shape and colour · photos",
    title: "Maize kernels",
    meta: "548 kernel photos · 463 lines · 8 founders",
    agent:
      "a scale bar in every photo, so each kernel is resized to the same millimetres per pixel",
    frames: "",
    invert: false,
  },
  {
    key: "mouse",
    kind: "Skeleton · X-ray",
    title: "Mouse X-rays",
    meta: "8,819 X-rays · 718 knockouts + sex and month",
    agent: "legends, a zoom change, inverted X-rays, duplicates",
    frames: "mouse/denoise",
    invert: true,
  },
] as const;

export function AnyOrganism() {
  return (
    <div className="ao">
      <span className="sw-label">Any organism</span>
      <h2 className="sw-h2">Same software. Any images, any DNA.</h2>
      <p style={{ maxWidth: 640 }}>
        d2d doesn’t know what it is looking at. Hand it a folder of microscope
        sections, seed scans or X-rays and a genotype file, and the same
        pipeline prepares the images, decides what to measure, trains the model
        and scores it.
      </p>
      <div className="ao-grid">
        {ORGS.map((o, i) => (
          <OrgCard key={o.key} o={o} delay={i * 350} />
        ))}
      </div>
    </div>
  );
}

function OrgCard({ o, delay }: { o: (typeof ORGS)[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  const run = useJson<AdRun>(`${A}ad/${o.key}.json`, near);
  const k = usePlayOnView(ref, 4200, 0.4, delay);
  const r = run?.results;
  return (
    <div ref={ref} className="ao-card">
      <div className="ao-media">
        {o.frames ? (
          <FramePlayer
            dir={o.frames}
            k={ease(seg(k, 0, 0.62))}
            load={near}
            invert={o.invert}
          />
        ) : (
          <SeedPlayer k={ease(seg(k, 0, 0.62))} />
        )}
        <span className="ao-tag mono" style={{ opacity: seg(k, 0.55, 0.7) }}>
          generated from DNA
        </span>
      </div>
      <div className="ao-body">
        <span className="ao-kind">{o.kind}</span>
        <h3>{o.title}</h3>
        <p className="ao-meta mono">{o.meta}</p>
        <p className="ao-agent" style={{ opacity: seg(k, 0.35, 0.5) }}>
          <b>it handled:</b> {o.agent}
        </p>
        <div className="ao-chips">
          {(r?.traits ?? []).map((t, i) => (
            <span
              key={t.label}
              style={{
                opacity: seg(k, 0.5 + i * 0.03, 0.6 + i * 0.03),
                transform: `translateY(${(1 - seg(k, 0.5 + i * 0.03, 0.6 + i * 0.03)) * 6}px)`,
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
        {r && (
          <div className="ao-bars">
            {[
              { name: "generated images", v: r.mean_r, c: "#f1b82d" },
              {
                name: r.base_label ?? "genomic prediction",
                v: r.mean_gp,
                c: "#9b988f",
              },
            ].map((b) => {
              const g = ease(seg(k, 0.72, 0.95));
              return (
                <div key={b.name} className="ao-bar">
                  <span className="mono">{b.name}</span>
                  <span className="ao-track">
                    <span
                      style={{ width: `${b.v * 100 * g}%`, background: b.c }}
                    />
                  </span>
                  <span className="mono" style={{ color: b.c }}>
                    {(b.v * g).toFixed(2)}
                  </span>
                </div>
              );
            })}
            <span className="ao-foot mono">
              mean r with the truth, {r.lines} held-out{" "}
              {o.key === "mouse" ? "mice" : "lines"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// noise → image from the real denoising frames (every other step)
function FramePlayer({
  dir,
  k,
  load,
  invert,
}: {
  dir: string;
  k: number;
  load: boolean;
  invert: boolean;
}) {
  const urls = useMemo(
    () => frameUrls(dir).filter((_, i) => i % 2 === 0 || i === 50),
    [dir],
  );
  const { frames } = useFrames(urls, load);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const want = Math.round(k * (urls.length - 1));
    let img: HTMLImageElement | null = null;
    for (let i = want; i >= 0 && !img; i--) img = frames[i];
    if (!img) return;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
  }, [k, frames, urls.length]);
  return (
    <canvas
      ref={cv}
      width={360}
      height={360}
      style={{ filter: invert ? "invert(1)" : undefined }}
      aria-hidden
    />
  );
}

// The seed card has a single photo, so its noise → image is a blend rather than real steps
function SeedPlayer({ k }: { k: number }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = `${A}seed/seed.webp`;
  }, []);
  const noise = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 120;
    const ctx = c.getContext("2d")!;
    const d = ctx.createImageData(120, 120);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = v;
      d.data[i + 1] = v * (0.85 + Math.random() * 0.15);
      d.data[i + 2] = v * (0.6 + Math.random() * 0.3);
      d.data[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    return c;
  }, []);
  useEffect(() => {
    const c = cv.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d")!;
    const W = c.width;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, W);
    ctx.filter = `blur(${(1 - k) * 14}px)`;
    ctx.drawImage(img, 0, 0, W, W);
    ctx.filter = "none";
    ctx.globalAlpha = Math.pow(1 - k, 1.4);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(noise, 0, 0, W, W);
    ctx.globalAlpha = 1;
  }, [k, noise, img]);
  return <canvas ref={cv} width={360} height={360} aria-hidden />;
}

// ---------------------------------------------------------------------------------------
// Results showcase (root)

interface Acc {
  traits: {
    trait: string;
    n_lines: number;
    r_generated: number;
    r_gblup: number;
    points: { true: number; generated_z: number; gblup_z: number }[];
  }[];
}

// the designed genes of the simulated root population, and the tissue each acts in
const MAPS = [
  { key: "shared_stele_mx", name: "Shared gene", tissue: "stele + vessels" },
  { key: "mx_diam_add", name: "Vessel width", tissue: "vessels" },
  { key: "mx_diam_epi", name: "Interacting", tissue: "vessels" },
  { key: "ctx_q1", name: "Cortex 1", tissue: "cortex" },
  { key: "ctx_q2", name: "Cortex 2", tissue: "cortex" },
  { key: "rca_linked1", name: "Aerenchyma", tissue: "air channels" },
  { key: "lac_q", name: "Lacuna", tissue: "air channels" },
  { key: "control6", name: "Control", tissue: "stays quiet", control: true },
];

const GEN = [
  ["gen_1", "MEMA233"],
  ["gen_2", "MEMA042"],
  ["gen_3", "MEMA310"],
  ["gen_4", "MEMA042"],
  ["gen_5", "MEMA105"],
  ["gen_6", "MEMA042"],
];

// whatIf: false leaves out the gene-dial panel (the story already shows it in chapter 06)
export function ResultsShowcase({ whatIf = true }: { whatIf?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  const acc = useJson<Acc>(`${ASSET}data/accuracy_scatter.json`, near);
  return (
    <div ref={ref} className="rs">
      <span className="sw-label">The results it hands back</span>
      <h2 className="sw-h2">
        Not just a score. Every check a reviewer would ask for.
      </h2>
      <p style={{ maxWidth: 640 }}>
        When a run finishes, the Results pages answer the questions that matter,
        on lines the model never saw. These are from the maize root runs.
      </p>

      <Panel
        label="01 · Accuracy"
        title="Every trait, against the truth"
        text="Each held-out line is drawn from its DNA alone, measured, and plotted against its real measurement. The closer to the line, the better."
      >
        {(k) => acc && <ScatterAnim acc={acc} k={k} />}
      </Panel>
      <Panel
        label="02 · Baseline"
        title="Side by side with genomic prediction"
        text="Every trait is also predicted the standard way. Where two genes interact, as for vessel diameter, the images win by a wide margin."
      >
        {(k) => acc && <VersusAnim acc={acc} k={k} />}
      </Panel>
      <Panel
        label="03 · Genes"
        title="Which genes, and where they act"
        text="Swap one stretch of DNA and redraw the root from the same noise: the map shows where the image changes. 12 of 14 genes point to the right tissue."
      >
        {(k) => <MapsAnim k={k} />}
      </Panel>
      {whatIf && (
        <Panel
          label="04 · What if"
          ms={8000}
          title="Turn one gene, watch the root change"
          text="Step a single gene through its versions on a line the model never saw, and the stele grows. It grew in 99% of 256 line and seed tests."
        >
          {(k) => <DialAnim k={k} />}
        </Panel>
      )}
      <Panel
        label={`${whatIf ? "05" : "04"} · Generate`}
        title="A new dataset from genotypes"
        text="Hand it genotypes and it draws the images, with a metadata table, ready for any downstream analysis."
      >
        {(k) => <GenerateAnim k={k} />}
      </Panel>
    </div>
  );
}

function Panel({
  label,
  title,
  text,
  ms = 3600,
  children,
}: {
  label: string;
  title: string;
  text: string;
  ms?: number;
  children: (k: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // starts once most of the chart is on screen, so it isn't over before the reader gets there
  const k = usePlayOnView(ref, ms, 0.7, 300);
  return (
    <div className="rs-panel">
      <div
        className="rs-copy"
        style={{ opacity: 0.25 + 0.75 * seg(k, 0, 0.15) }}
      >
        <span className="rs-label mono">{label}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div ref={ref} className="da rs-frame" aria-hidden>
        {children(k)}
      </div>
    </div>
  );
}

const zs = (v: number[]) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) || 1;
  return v.map((x) => (x - m) / s);
};

function ScatterAnim({ acc, k }: { acc: Acc; k: number }) {
  // after the first trait draws in, step through the others
  const [ti, setTi] = useState(0);
  useEffect(() => {
    if (k < 1) return;
    const id = window.setInterval(
      () => setTi((i) => (i + 1) % acc.traits.length),
      3200,
    );
    return () => clearInterval(id);
  }, [k, acc.traits.length]);
  const t = acc.traits[ti];
  const tz = useMemo(() => zs(t.points.map((p) => p.true)), [t]);
  const S = 300;
  const m = 24;
  const sx = (v: number) => m + ((clamp(v, -3, 3) + 3) / 6) * (S - 2 * m);
  const sy = (v: number) => S - m - ((clamp(v, -3, 3) + 3) / 6) * (S - 2 * m);
  const n = Math.round(t.points.length * ease(seg(k, 0.15, 0.8)));
  const line = ease(seg(k, 0, 0.3));
  return (
    <div className="da-chart">
      <div className="da-t">
        {t.trait}{" "}
        <span>r = {(t.r_generated * ease(seg(k, 0.5, 0.9))).toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${S} ${S}`} className="rs-svg">
        <rect
          x={m}
          y={m}
          width={S - 2 * m}
          height={S - 2 * m}
          fill="none"
          stroke="#262521"
        />
        <line
          x1={sx(-3)}
          y1={sy(-3)}
          x2={sx(-3 + 6 * line)}
          y2={sy(-3 + 6 * line)}
          stroke="#8e8a7f"
          strokeDasharray="4 4"
        />
        {t.points.slice(0, n).map((p, i) => (
          <circle
            key={i}
            cx={sx(tz[i])}
            cy={sy(p.generated_z)}
            r="2.8"
            fill="#f1b82d"
            opacity=".65"
            style={{ transition: "cx .6s, cy .6s" }}
          />
        ))}
        <text x={S / 2} y={S - 6} textAnchor="middle" className="rs-ax">
          real root
        </text>
        <text
          x={9}
          y={S / 2}
          textAnchor="middle"
          className="rs-ax"
          transform={`rotate(-90 9 ${S / 2})`}
        >
          generated
        </text>
      </svg>
      <div className="da-legend">
        <span>
          <i style={{ background: "#f1b82d" }} />
          {n} held-out lines
        </span>
        <span>
          <i style={{ background: "#8e8a7f" }} />
          ideal y = x
        </span>
      </div>
    </div>
  );
}

function VersusAnim({ acc, k }: { acc: Acc; k: number }) {
  return (
    <div className="da-chart">
      <div className="da-t">
        Accuracy per trait <span>r with the truth</span>
      </div>
      <div className="da-legend">
        <span>
          <i style={{ background: "#f1b82d" }} />
          generated images
        </span>
        <span>
          <i style={{ background: "#9b988f" }} />
          genomic prediction
        </span>
      </div>
      {acc.traits.map((t, i) => {
        const g = ease(seg(k, 0.1 + i * 0.07, 0.5 + i * 0.07));
        const win = t.r_generated - t.r_gblup > 0.1;
        return (
          <div key={t.trait} className={`da-barrow${win ? " rs-win" : ""}`}>
            <span className="da-bl">{t.trait}</span>
            <span className="da-bars">
              <span
                style={{
                  width: `${t.r_generated * 100 * g}%`,
                  background: "#f1b82d",
                }}
              />
              <span
                style={{
                  width: `${t.r_gblup * 100 * g}%`,
                  background: "#9b988f",
                }}
              />
            </span>
            <span className="da-bv">{(t.r_generated * g).toFixed(2)}</span>
          </div>
        );
      })}
      <div className="rs-verdict" style={{ opacity: seg(k, 0.8, 0.95) }}>
        <span className="da-chip done">vessel diameter: 0.89 vs 0.51</span>
      </div>
    </div>
  );
}

function MapsAnim({ k }: { k: number }) {
  return (
    <div className="da-chart">
      <div className="da-t">
        Gene maps <span>where the image changes</span>
      </div>
      <div className="rs-genes">
        {MAPS.map((x, i) => {
          const v = seg(k, 0.05 + i * 0.08, 0.22 + i * 0.08);
          return (
            <figure
              key={x.key}
              style={{ opacity: v, transform: `translateY(${(1 - v) * 10}px)` }}
            >
              <div className="rs-map">
                <img src={`${ASSET}gene_maps/base_root.webp`} alt="" />
                <img
                  src={`${ASSET}gene_maps/${x.key}.png`}
                  alt=""
                  style={{ opacity: seg(k, 0.2 + i * 0.08, 0.4 + i * 0.08) }}
                />
              </div>
              <figcaption>
                <b>{x.name}</b>
                <span className={`da-chip ${x.control ? "" : "done"}`}>
                  {x.tissue}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

function DialAnim({ k }: { k: number }) {
  const codes = [1, 3, 6, 8];
  // after the first pass, go back down and up again, slowly
  const [loop, setLoop] = useState(0);
  useEffect(() => {
    if (k < 1) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      setLoop(((t - t0) / 9000) % 2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [k >= 1]); // eslint-disable-line react-hooks/exhaustive-deps
  const steps = (x: number) => {
    // dwell on each version: progress through 4 images with pauses
    const n = codes.length - 1;
    const i = Math.min(n - 1, Math.floor(x * n));
    return i + ease(clamp((x * n - i - 0.35) / 0.65));
  };
  const pass = k < 1 ? seg(k, 0.05, 0.95) : loop < 1 ? 1 - loop : loop - 1;
  const f = steps(pass);
  const v = Math.round(1 + (f / (codes.length - 1)) * 7);
  return (
    <div className="da-chart">
      <div className="da-t">
        Gene dial <span>one line, same noise</span>
      </div>
      <div className="rs-dial">
        <div className="rs-dial-img">
          {codes.map((c, i) => (
            <img
              key={c}
              src={`${ASSET}gene_dial/code${c}_outlined.png`}
              alt=""
              style={{ opacity: clamp(1 - Math.abs(f - i)) }}
            />
          ))}
        </div>
        <div className="rs-dial-read">
          <div className="da-label">gene version</div>
          <div className="da-v">{v}</div>
          <div className="rs-dial-ticks">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} className={i < v ? "on" : undefined} />
            ))}
          </div>
          <div className="da-label" style={{ marginTop: 12 }}>
            stele width
          </div>
          <div className="da-v gold">+{Math.round((19 * (v - 1)) / 7)}%</div>
          <div className="da-d">outlined in gold</div>
        </div>
      </div>
    </div>
  );
}

function GenerateAnim({ k }: { k: number }) {
  return (
    <div className="da-chart">
      <div className="da-t">
        Generate dataset <span>genotypes → images + metadata.csv</span>
      </div>
      <div className="rs-gen">
        {GEN.map(([f], i) => {
          const v = seg(k, 0.1 + i * 0.1, 0.25 + i * 0.1);
          return (
            <figure key={i} style={{ opacity: v }}>
              <img
                src={`${A}roots/${f}.webp`}
                alt=""
                style={{ filter: `blur(${(1 - v) * 6}px)` }}
              />
            </figure>
          );
        })}
      </div>
      <pre className="da-pre" style={{ marginTop: 10 }}>
        {[
          "image,genotype",
          ...GEN.map(
            ([, g], i) => `gen_${String(i + 1).padStart(3, "0")}.png,${g}`,
          ),
        ]
          .slice(0, 1 + Math.round(GEN.length * seg(k, 0.2, 0.85)))
          .join("\n")}
      </pre>
    </div>
  );
}
