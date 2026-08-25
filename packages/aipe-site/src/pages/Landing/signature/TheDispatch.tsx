import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import StateBadge from "../../../components/StateBadge";
import { useInView } from "../../../lib/useInView";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import {
  buildScene,
  runningCountAt,
  MAX_CONCURRENT,
  PR_NUMBER,
  type Beat,
  type Specialist,
  type Reasoning,
} from "./sceneScript";

const ACT_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: "The demand",
  2: "The coordinator reasons",
  3: "Specialists dispatched",
  4: "The work returns",
};

/**
 * The Dispatch — a staged, causal dramatization of this journey (j-20260825-s2).
 * One thing moves at a time; each beat is caused by the last. The reader can
 * play, pause, step or replay. Under reduced motion the whole scene is present
 * and readable at once, stepped rather than animated — never an empty box.
 */
export default function TheDispatch() {
  const scene = useMemo(() => buildScene(), []);
  const { beats } = scene;
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  const specialistIds = useMemo(() => scene.specialists.map((s) => s.id), [scene]);
  const reasoningById = useMemo(
    () => new Map(scene.reasoning.map((r) => [r.id, r])),
    [scene],
  );
  const specialistById = useMemo(
    () => new Map(scene.specialists.map((s) => [s.id, s])),
    [scene],
  );

  // Under reduced motion the whole storyboard is shown; `current` only moves a
  // highlight. Otherwise `current` is the newest revealed beat.
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const atEnd = current >= beats.length - 1;

  // Autoplay: advance one beat per dwell, but only while playing, on-screen, and
  // motion is allowed. Keyed on `current` so each beat schedules the next.
  useEffect(() => {
    if (reduced || !playing || !inView || atEnd) return;
    const dwell = beats[current]?.dwellMs ?? 1800;
    const id = window.setTimeout(() => setCurrent((c) => Math.min(c + 1, beats.length - 1)), dwell);
    return () => window.clearTimeout(id);
  }, [current, playing, inView, reduced, atEnd, beats]);

  const visibleCount = reduced ? beats.length : current + 1;
  const activeIndex = reduced ? Math.min(current, beats.length - 1) : current;
  const activeBeat = beats[activeIndex];

  // Keep the newest/active beat in view within the scroll area.
  const activeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [activeIndex, reduced]);

  const step = (delta: number) => {
    setPlaying(false);
    setCurrent((c) => Math.max(0, Math.min(beats.length - 1, c + delta)));
  };
  const restart = () => {
    setCurrent(0);
    setPlaying(!reduced);
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-line bg-surface-1"
      role="group"
      aria-label="The Dispatch — a staged walkthrough of how AIPe turns one demand into dispatched specialists and merged PRs"
    >
      {/* Header: what we're watching + where we are + controls */}
      <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-brand">◆</span>
            <span className="font-display text-sm font-semibold text-text">The Dispatch</span>
            <span className="font-mono text-[11px] text-faint">· journey {scene.beats.length > 0 ? "j-20260825-s2" : ""}</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted" aria-live="polite">
            <span className="text-brand">Act {activeBeat?.act ?? 1}/4</span> · {ACT_NAMES[activeBeat?.act ?? 1]}
          </p>
        </div>
        <Controls
          reduced={reduced}
          playing={playing}
          atStart={current <= 0}
          atEnd={atEnd}
          index={current}
          total={beats.length}
          onPlayPause={() => setPlaying((p) => !p)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onRestart={restart}
        />
      </div>

      {/* Stage: a growing transcript. Newest block is the one moving; the rest are still. */}
      <div className="max-h-[30rem] overflow-y-auto p-4 sm:p-5">
        <ol className="flex flex-col gap-3">
          {beats.slice(0, visibleCount).map((beat, i) => {
            const isActive = i === activeIndex;
            const prevBeat = beats[i - 1];
            return (
              <li key={beat.id} ref={isActive ? activeRef : undefined} className="min-w-0">
                <BeatBlock
                  beat={beat}
                  prevBeat={prevBeat}
                  isActive={isActive}
                  reduced={reduced}
                  scene={scene}
                  reasoningById={reasoningById}
                  specialistById={specialistById}
                  runningNow={runningCountAt(beats, specialistIds, i)}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ controls */

function Controls({
  reduced,
  playing,
  atStart,
  atEnd,
  index,
  total,
  onPlayPause,
  onPrev,
  onNext,
  onRestart,
}: {
  reduced: boolean;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  index: number;
  total: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
}) {
  const btn =
    "rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button type="button" onClick={onPrev} disabled={atStart} aria-label="Previous beat" className={btn}>
        ‹
      </button>
      {!reduced && (
        <button
          type="button"
          onClick={atEnd ? onRestart : onPlayPause}
          aria-label={atEnd ? "Replay" : playing ? "Pause" : "Play"}
          className={btn}
        >
          {atEnd ? "↺ replay" : playing ? "❚❚ pause" : "▶ play"}
        </button>
      )}
      <button type="button" onClick={onNext} disabled={atEnd} aria-label="Next beat" className={btn}>
        ›
      </button>
      <button type="button" onClick={onRestart} aria-label="Restart" className={`${btn} hidden sm:inline`}>
        ↺
      </button>
      <span className="ml-1 font-mono text-[11px] tabular-nums text-faint">
        {Math.min(index + 1, total)}/{total}
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- beat blocks */

interface BeatBlockProps {
  beat: Beat;
  prevBeat: Beat | undefined;
  isActive: boolean;
  reduced: boolean;
  scene: ReturnType<typeof buildScene>;
  reasoningById: Map<string, Reasoning>;
  specialistById: Map<string, Specialist>;
  runningNow: number;
}

function BeatBlock(props: BeatBlockProps) {
  const { beat, isActive, reduced } = props;

  // Only the newest block animates in; everything already present stays still.
  const anim = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <motion.div {...anim} className={isActive && !reduced ? "" : "opacity-95"}>
      <BeatBody {...props} />
    </motion.div>
  );
}

function BeatBody({ beat, prevBeat, isActive, reduced, scene, reasoningById, specialistById, runningNow }: BeatBlockProps) {
  switch (beat.kind) {
    case "demand":
      return <DemandCard reduced={reduced} isActive={isActive} text={scene.demand.text} author={scene.demand.author} />;

    case "handoff":
      return (
        <Connector label={`handed to ${scene.coordinator}, the coordinator`} />
      );

    case "reason": {
      const r = beat.refId ? reasoningById.get(beat.refId) : undefined;
      const isFirstReason = prevBeat?.kind !== "reason" && prevBeat?.kind !== "graph" && prevBeat?.kind !== "envelope";
      return <ReasonLine text={r?.text ?? ""} coordinator={scene.coordinator} showHeader={isFirstReason} active={isActive} />;
    }

    case "graph":
      return <RelationGraph nodes={WORKSPACE_NODES_VIEW} active={isActive} reduced={reduced} />;

    case "envelope": {
      const lawson = specialistById.get("lawson");
      return lawson ? <EnvelopeCard specialist={lawson} /> : null;
    }

    case "spawn": {
      const s = beat.refId ? specialistById.get(beat.refId) : undefined;
      if (!s) return null;
      const from = reasoningById.get(s.fromReasoningId);
      return <SpecialistCard specialist={s} fromText={from?.text ?? ""} runningNow={runningNow} active={isActive} />;
    }

    case "worktree": {
      const s = beat.refId ? specialistById.get(beat.refId) : undefined;
      return s ? <WorktreeChip specialist={s} /> : null;
    }

    case "deliver":
      return <DeliverCard />;

    case "evidence-gate":
      return <GateCard kind="evidence" />;

    case "qa-gate":
      return <GateCard kind="qa" />;

    case "ledger":
      return <LedgerStrip />;

    default:
      return null;
  }
}

/* ------------------------------------------------------------- act 1: demand */

function DemandCard({ text, author, reduced, isActive }: { text: string; author: string; reduced: boolean; isActive: boolean }) {
  const typed = useTypewriter(text, !reduced && isActive);
  const shown = reduced ? text : typed;
  return (
    <div className="rounded-xl border border-brand/30 bg-brand/[0.06] p-3.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-brand/20 font-mono text-[10px] font-bold text-brand-strong">
          {author}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wide text-faint">demand</span>
      </div>
      <p className="font-sans text-[13.5px] leading-relaxed text-text">
        {shown}
        {!reduced && isActive && shown.length < text.length ? (
          <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-brand" />
        ) : null}
      </p>
    </div>
  );
}

function Connector({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pl-1 font-mono text-[11px] text-faint">
      <span aria-hidden="true" className="text-brand">↓</span>
      {label}
    </div>
  );
}

/* ----------------------------------------------------------- act 2: reasoning */

function ReasonLine({ text, coordinator, showHeader, active }: { text: string; coordinator: string; showHeader: boolean; active: boolean }) {
  return (
    <div>
      {showHeader && (
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-flex h-5 items-center rounded bg-surface-2 px-1.5 font-mono text-[10px] font-bold text-brand">
            ⎇ {coordinator}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wide text-faint">reasoning</span>
        </div>
      )}
      <p
        className={`border-l-2 pl-3 font-mono text-[12.5px] leading-relaxed ${
          active ? "border-brand text-text" : "border-line text-muted"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

const WORKSPACE_NODES_VIEW = [
  { id: "aipe-site", label: "aipe-site", isNew: true },
  { id: "embark-site", label: "embark-site", isNew: false },
  { id: "pdd-site", label: "pdd-site", isNew: false },
  { id: "duckflux-site", label: "duckflux-site", isNew: false },
];

function RelationGraph({ nodes, active, reduced }: { nodes: typeof WORKSPACE_NODES_VIEW; active: boolean; reduced: boolean }) {
  return (
    <div className="ml-3 rounded-lg border border-line-soft bg-surface-2/60 p-3">
      <p className="mb-2 font-mono text-[10.5px] uppercase tracking-wide text-faint">openvibes-embark · relation graph</p>
      <div className="flex flex-wrap items-center gap-2">
        {nodes.map((n) => {
          const isNew = n.isNew;
          return (
            <motion.span
              key={n.id}
              initial={reduced || !isNew ? false : { scale: 0.9 }}
              animate={active && isNew && !reduced ? { scale: [0.9, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                isNew
                  ? "border-brand bg-brand/10 text-brand-strong"
                  : "border-line-soft bg-surface-1 text-muted"
              }`}
            >
              {isNew ? "◆ " : ""}
              {n.label}
              {isNew ? " · new" : ""}
            </motion.span>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[11px] text-faint">
        aipe-site: <span className="text-muted">0 edges</span> — no sibling consumes it, it consumes none · 1 producing unit
      </p>
    </div>
  );
}

function EnvelopeCard({ specialist }: { specialist: Specialist }) {
  const e = specialist.envelope;
  return (
    <div className="ml-3 rounded-lg border border-state-escalated/40 bg-state-escalated/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[12px] text-text">
          {specialist.mode} · {specialist.harness} · {specialist.tier} · {specialist.intensity}
        </span>
        <span className="font-mono text-[12px] text-muted">
          cost-index <span className="font-semibold text-text">{e.costIndex}</span>
        </span>
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-wide text-state-escalated">
        <span aria-hidden="true">⚑</span> gated — awaiting the PE's sign-off
      </p>
    </div>
  );
}

/* ---------------------------------------------------- act 3: specialists spawn */

function SpecialistCard({ specialist, fromText, runningNow, active }: { specialist: Specialist; fromText: string; runningNow: number; active: boolean }) {
  const s = specialist;
  const queued = s.wave > 0;
  const phaseColor = queued ? "text-state-dispatched" : "text-state-running";
  return (
    <div className={`rounded-xl border p-3.5 ${active ? "border-brand/50" : "border-line"} bg-surface-2`}>
      {/* causal link: the specialist derives from a reasoning sentence */}
      <p className="mb-2 truncate font-mono text-[10.5px] text-faint">
        <span className="text-brand">↳ from {" "}</span>
        &ldquo;{fromText}&rdquo;
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 font-mono text-[11px] font-bold text-brand-strong">
            {s.persona.charAt(0)}
          </span>
          <span className="font-mono text-[13px] text-text">{s.persona}</span>
          <span className="font-mono text-[11px] text-faint">· {s.role}</span>
        </div>
        <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${phaseColor}`}>
          <span aria-hidden="true">{queued ? "◷" : "◐"}</span>
          {queued ? "queued" : "running"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
        <span>{s.repo}/{s.package}</span>
        <span className="text-faint">·</span>
        <span>{s.harness}</span>
        <span className="text-faint">·</span>
        <span className="rounded bg-surface-1 px-1.5 py-0.5 text-[10.5px]">wave {s.wave + 1}</span>
      </div>
      {queued ? (
        <p className="mt-2 font-mono text-[11px] text-state-dispatched">
          same package as Lawson → the law serializes it: it waits for wave 1 to land.
        </p>
      ) : (
        <p className="mt-2 font-mono text-[11px] text-faint">
          running <span className="text-text">{runningNow}</span>
          <span className="text-faint"> / {MAX_CONCURRENT}</span> · distinct repos would run alongside; the cap is {MAX_CONCURRENT}.
        </p>
      )}
    </div>
  );
}

function WorktreeChip({ specialist }: { specialist: Specialist }) {
  return (
    <div className="ml-3 flex flex-wrap items-center gap-2 rounded-lg border border-line-soft bg-surface-2/60 px-3 py-2">
      <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">isolated worktree</span>
      <code className="min-w-0 break-all font-mono text-[11px] text-muted">{specialist.worktree}</code>
    </div>
  );
}

/* ----------------------------------------------------- act 4: the work returns */

function DeliverCard() {
  return (
    <div className="rounded-xl border border-state-delivered/40 bg-state-delivered/10 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-mono text-[12.5px] text-text">
          <span aria-hidden="true" className="text-state-delivered">▽</span>
          Lawson delivers · PR #{PR_NUMBER}
        </span>
        <span className="font-mono text-[11px] text-faint">→ back to {"Heisenberg"}</span>
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-muted">
        evidence attached: <span className="text-text">tsc silent · 74 tests green · build clean</span>
      </p>
    </div>
  );
}

function GateCard({ kind }: { kind: "evidence" | "qa" }) {
  if (kind === "evidence") {
    return (
      <div className="ml-3 rounded-lg border border-state-verified/30 bg-state-verified/10 p-3">
        <p className="flex items-center gap-2 font-mono text-[12px] font-semibold text-state-verified">
          <span aria-hidden="true">✓</span> evidence gate · PASS
        </p>
        <p className="mt-1 font-mono text-[11px] text-faint">
          the commands ran and what they showed are on record — a bare self-report would be <span className="text-state-failed">REJECTED</span>.
        </p>
      </div>
    );
  }
  return (
    <div className="ml-3 rounded-lg border border-state-verified/30 bg-state-verified/10 p-3">
      <p className="flex items-center gap-2 font-mono text-[12px] font-semibold text-state-verified">
        <span aria-hidden="true">✓</span> QA gate · Viola verified it
      </p>
      <p className="mt-1 font-mono text-[11px] text-faint">
        an independent QA re-ran against the diff in her own worktree — not the dev's word.
      </p>
    </div>
  );
}

function LedgerStrip() {
  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-3.5">
      <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-faint">journey ledger · the durable record</p>
      <div className="flex flex-wrap items-center gap-2">
        <StateBadge state="dispatched" size="sm" />
        <span aria-hidden="true" className="text-faint">→</span>
        <StateBadge state="delivered" size="sm" />
        <span aria-hidden="true" className="text-faint">→</span>
        <StateBadge state="verified" size="sm" />
      </div>
      <p className="mt-2 font-mono text-[11px] text-faint">
        one demand, decomposed and dispatched, returned through the gates — recorded, inspectable, replayable.
      </p>
    </div>
  );
}

/* --------------------------------------------------------- typewriter helper */

/** Reveal `text` progressively while `on`. When off, shows the full text. */
function useTypewriter(text: string, on: boolean): string {
  const [n, setN] = useState(on ? 0 : text.length);
  useEffect(() => {
    if (!on) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const total = text.length;
    // Finish comfortably within the demand beat's dwell.
    const stepMs = Math.max(12, Math.min(26, Math.floor(3000 / Math.max(total, 1))));
    const id = window.setInterval(() => {
      i += 2;
      setN(Math.min(i, total));
      if (i >= total) window.clearInterval(id);
    }, stepMs);
    return () => window.clearInterval(id);
  }, [text, on]);
  return text.slice(0, n);
}
