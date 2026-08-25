import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MAX_CONCURRENT } from "../../../domain/dispatchLaw";
import { STATE_META, stateColorStyle, type StateKey } from "../../../domain/states";
import { useInView } from "../../../lib/useInView";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import {
  FANOUT_UNITS,
  LIFECYCLE,
  mergedCount,
  peakConcurrency,
  phaseAt,
  placeUnits,
  runningCount,
  type Phase,
  type PlacedUnit,
} from "./dispatchFanOutTiming";

/* ---- geometry (SVG user units; scales fluidly via viewBox) --------------- */
const VB_W = 360;
const TOP = 12;
const CARD_W = 182;
const CARD_H = 42;
const CARD_X = 170;
const ROW = 54; // card height + gap
const VB_H = TOP + FANOUT_UNITS.length * ROW; // 12 + 6*54 = 336

const rowY = (row: number): number => TOP + row * ROW;
const cardMidY = (row: number): number => rowY(row) + CARD_H / 2;

const COORD = { x: 70, y: (rowY(0) + rowY(FANOUT_UNITS.length - 1) + CARD_H) / 2, r: 28 };
const COORD_OUT = { x: COORD.x + COORD.r, y: COORD.y }; // fan-out origin
const CARD_IN = (row: number) => ({ x: CARD_X, y: cardMidY(row) }); // edge lands here

const STEP_MS = 950; // one lifecycle step; calm, not wallpaper

/* ---- phase presentation (color + glyph + label, never colour alone) ------ */
function phaseColorVar(phase: Phase): string {
  return phase === "pending" ? "rgb(var(--faint))" : `rgb(var(--st-${phase}))`;
}
function phaseGlyph(phase: Phase): string {
  return phase === "pending" ? "·" : STATE_META[phase].glyph;
}
function phaseLabel(phase: Phase): string {
  return phase === "pending" ? "waiting" : STATE_META[phase].label;
}

/** Fan-out (dispatched/running) travels out; PR (delivered/verified) travels back. */
function packetDirection(phase: Phase): "out" | "back" | null {
  if (phase === "dispatched" || phase === "running") return "out";
  if (phase === "delivered" || phase === "verified") return "back";
  return null;
}

const WAVE_ACCENT = ["rgb(var(--brand))", "rgb(var(--st-running))"] as const;
const waveAccent = (wave: number): string => WAVE_ACCENT[Math.min(wave, WAVE_ACCENT.length - 1)]!;

export default function DispatchFanOut() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();
  const { placed, loopSteps } = placeUnits();

  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setStep((s) => (s + 1) % loopSteps), STEP_MS);
    return () => clearInterval(id);
  }, [reduced, inView, loopSteps]);

  const animating = !reduced;
  // Static/reduced view: every specialist at its terminal state, meter shows peak.
  const phaseOf = (p: PlacedUnit): Phase => (animating ? phaseAt(p, step) : "merged");
  const running = animating ? runningCount(placed, step) : peakConcurrency(placed, loopSteps);
  const merged = animating ? mergedCount(placed, step) : placed.length;
  const meterLabel = animating ? "running" : "peak";

  return (
    <div
      ref={ref}
      className="min-w-0 rounded-2xl border border-line bg-surface-1 p-4 sm:p-5"
      role="img"
      aria-label="Dispatch fan-out: one demand is decomposed by the coordinator into specialists that run in parallel across distinct repos, each in an isolated worktree returning a PR; two units on the same package serialize into consecutive waves; concurrency is capped at 16."
    >
      {/* header: title + live concurrency meter against the 16 ceiling */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden="true" className="text-brand">
            ◆
          </span>
          <span className="font-display text-sm font-semibold text-text truncate">
            Dispatch fan-out
          </span>
        </div>
        <ConcurrencyMeter running={running} cap={MAX_CONCURRENT} label={meterLabel} />
      </div>

      {/* the diagram */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="mt-3 block h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="fanout-arrow"
            viewBox="0 0 8 8"
            refX="6.5"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M1 1 L7 4 L1 7 Z" fill="rgb(var(--faint))" />
          </marker>
        </defs>

        {/* demand → coordinator */}
        <line
          x1={COORD.x}
          y1={TOP + 32}
          x2={COORD.x}
          y2={COORD.y - COORD.r}
          stroke="rgb(var(--line))"
          strokeWidth={1.5}
          markerEnd="url(#fanout-arrow)"
        />
        <NodeBox
          x={COORD.x - 46}
          y={TOP}
          w={92}
          h={30}
          label="demand"
          glyph="◆"
          tone="brand"
        />

        {/* fan-out edges coordinator → each specialist */}
        {placed.map((p) => {
          const phase = phaseOf(p);
          const to = CARD_IN(p.row);
          const isPending = phase === "pending";
          return (
            <line
              key={`edge-${p.id}`}
              x1={COORD_OUT.x}
              y1={COORD_OUT.y}
              x2={to.x}
              y2={to.y}
              stroke={isPending ? "rgb(var(--line))" : phaseColorVar(phase)}
              strokeWidth={phase === "merged" ? 2 : 1.5}
              strokeDasharray={isPending ? "3 4" : undefined}
              opacity={isPending ? 0.5 : phase === "merged" ? 0.85 : 0.55}
              markerEnd="url(#fanout-arrow)"
            />
          );
        })}

        {/* travelling packets (fan-out dot / returning PR) — motion only */}
        <AnimatePresence>
          {animating &&
            inView &&
            placed.map((p) => {
              const phase = phaseOf(p);
              const dir = packetDirection(phase);
              if (!dir) return null;
              const a = COORD_OUT;
              const b = CARD_IN(p.row);
              const from = dir === "out" ? a : b;
              const to = dir === "out" ? b : a;
              return (
                <motion.circle
                  key={`pkt-${p.id}-${dir}`}
                  r={dir === "back" ? 4.5 : 3.5}
                  fill={phaseColorVar(phase)}
                  initial={{ cx: from.x, cy: from.y, opacity: 0 }}
                  animate={{
                    cx: [from.x, to.x],
                    cy: [from.y, to.y],
                    opacity: [0, 1, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                />
              );
            })}
        </AnimatePresence>

        {/* coordinator */}
        <circle
          cx={COORD.x}
          cy={COORD.y}
          r={COORD.r}
          fill="rgb(var(--surface-2))"
          stroke="rgb(var(--brand))"
          strokeWidth={1.75}
        />
        <text
          x={COORD.x}
          y={COORD.y - 3}
          textAnchor="middle"
          className="font-display"
          fontSize={13}
          fontWeight={700}
          fill="rgb(var(--brand))"
        >
          ⎇
        </text>
        <text
          x={COORD.x}
          y={COORD.y + 11}
          textAnchor="middle"
          fontSize={8.5}
          fill="rgb(var(--muted))"
        >
          {merged}/{placed.length} merged
        </text>
        <text
          x={COORD.x}
          y={COORD.y + COORD.r + 12}
          textAnchor="middle"
          fontSize={9}
          fill="rgb(var(--faint))"
        >
          coordinator
        </text>

        {/* specialist cards */}
        {placed.map((p) => {
          const phase = phaseOf(p);
          const waiting = phase === "pending";
          const label = `${p.unit.repo}${p.unit.package ? `/${p.unit.package}` : ""}`;
          return (
            <g key={`card-${p.id}`}>
              <rect
                x={CARD_X}
                y={rowY(p.row)}
                width={CARD_W}
                height={CARD_H}
                rx={8}
                fill="rgb(var(--surface-2))"
                stroke={waiting ? waveAccent(p.wave) : "rgb(var(--line))"}
                strokeWidth={1.25}
                strokeDasharray={waiting ? "4 4" : undefined}
              />
              {/* wave accent bar (parallel vs serialized cohort) */}
              <rect
                x={CARD_X}
                y={rowY(p.row) + 6}
                width={3}
                height={CARD_H - 12}
                rx={1.5}
                fill={waveAccent(p.wave)}
              />
              <text
                x={CARD_X + 12}
                y={rowY(p.row) + 17}
                fontSize={8.5}
                fontWeight={700}
                fill={waveAccent(p.wave)}
                className="font-mono"
              >
                W{p.wave}
              </text>
              <text
                x={CARD_X + 34}
                y={rowY(p.row) + 17}
                fontSize={11.5}
                fill="rgb(var(--text))"
                className="font-mono"
              >
                {label}
              </text>
              {/* state chip: glyph + label, colour never alone */}
              <text
                x={CARD_X + 12}
                y={rowY(p.row) + 34}
                fontSize={11}
                className="font-mono"
                fill="currentColor"
                style={{ color: phaseColorVar(phase) }}
              >
                {phaseGlyph(phase)} {phaseLabel(phase)}
                {waiting && p.wave > 0 ? ` · ${p.key}` : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* footer legend: parallel-vs-serialize explained + lifecycle glyph key */}
      <div className="mt-3 space-y-2 border-t border-line-soft pt-3">
        <div className="grid gap-1.5 text-[11px] leading-snug sm:grid-cols-2">
          <p className="flex gap-1.5 text-muted">
            <span
              aria-hidden="true"
              className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: waveAccent(0) }}
            />
            <span>
              <span className="font-mono text-text">wave 0</span> — 5 distinct packages,
              dispatched <span className="text-text">in parallel</span>.
            </span>
          </p>
          <p className="flex gap-1.5 text-muted">
            <span
              aria-hidden="true"
              className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: waveAccent(1) }}
            />
            <span>
              <span className="font-mono text-text">wave 1</span> —{" "}
              <span className="font-mono">web/aipe-site</span> again,{" "}
              <span className="text-text">serialized</span> behind wave 0.
            </span>
          </p>
        </div>
        <LifecycleLegend />
        <p className="text-[10.5px] text-faint">
          Concurrency ceiling <span className="font-mono text-muted">{MAX_CONCURRENT}</span> — this
          batch peaks at <span className="font-mono text-muted">{peakConcurrency(placed, loopSteps)}</span>,
          well under it.
        </p>
      </div>
    </div>
  );
}

/* ---- meter: running N / 16, 16 shown as a ceiling, not a fake fill ------- */
function ConcurrencyMeter({
  running,
  cap,
  label,
}: {
  running: number;
  cap: number;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="font-mono text-[11px] tabular-nums text-muted whitespace-nowrap">
        {label} <span className="text-text">{running}</span>
        <span className="text-faint"> / {cap}</span>
      </span>
      <span
        aria-hidden="true"
        className="hidden items-end gap-[2px] sm:flex"
        style={{ height: 14 }}
      >
        {Array.from({ length: cap }, (_, i) => {
          const filled = i < running;
          const ceiling = i === cap - 1;
          return (
            <span
              key={i}
              className="w-[3px] rounded-full"
              style={{
                height: ceiling ? 14 : 10,
                background: filled
                  ? "rgb(var(--brand))"
                  : ceiling
                    ? "rgb(var(--st-failed))"
                    : "rgb(var(--line))",
                opacity: filled ? 1 : ceiling ? 0.85 : 1,
              }}
            />
          );
        })}
      </span>
    </div>
  );
}

/* ---- lifecycle glyph key: every state carries its glyph + label ---------- */
function LifecycleLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px]">
      {LIFECYCLE.map((key: StateKey, i) => (
        <span key={key} className="flex items-center gap-1">
          <span className="font-mono" style={stateColorStyle(key)}>
            {STATE_META[key].glyph} {STATE_META[key].label}
          </span>
          {i < LIFECYCLE.length - 1 ? (
            <span aria-hidden="true" className="text-faint">
              →
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/* ---- small labelled node (the demand source) ----------------------------- */
function NodeBox({
  x,
  y,
  w,
  h,
  label,
  glyph,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  glyph: string;
  tone: "brand";
}) {
  const stroke = tone === "brand" ? "rgb(var(--brand))" : "rgb(var(--line))";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill="rgb(var(--surface-2))"
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        fontSize={11.5}
        className="font-mono"
        fill="rgb(var(--text))"
      >
        {glyph} {label}
      </text>
    </g>
  );
}
