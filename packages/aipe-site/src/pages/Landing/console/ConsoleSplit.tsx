import { useEffect, useMemo, useRef, useState } from "react";
import StateBadge from "../../../components/StateBadge";
import { useInView } from "../../../lib/useInView";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import { useI18n, type Translations } from "../../../i18n";
import {
  buildConsole,
  type ConsoleModel,
  type LeftLine,
  type Meaning,
  type Step,
} from "./consoleScript";

/** The localisable console copy slice (framing labels, control text, details). */
type ConsoleText = Translations["console"];

/** Base dwell per step (ms) at 1× — long enough to read the meaning. */
const BASE_DWELL = 3200;
const SPEEDS = [1, 1.5, 2, 0.5] as const;

/** The four ledger statuses the flow lights up, in lifecycle order. */
const RAMP: readonly ("dispatched" | "delivered" | "verified" | "merged")[] = [
  "dispatched",
  "delivered",
  "verified",
  "merged",
];

const KIND_GLYPH: Record<Meaning["kind"], string> = {
  demand: "✎",
  journey: "◇",
  decompose: "⋔",
  "skill-match": "⚙",
  envelope: "▤",
  law: "§",
  worktree: "⌥",
  dispatch: "➤",
  deliver: "▽",
  "evidence-gate": "⛔",
  "qa-gate": "✓",
  merged: "⬢",
  verify: "✔",
};

/**
 * The Console Split — the hero centrepiece. Left pane: the terminal as it really
 * looks (the PE's demand, the coordinator, real `aipe`/`agentop` commands and
 * their real output). Right pane: what each line MEANS — the decision it causes.
 * The two are bound 1:1: hovering or stepping either side highlights its partner.
 *
 * The reader controls the pace (play/pause, step, scrub, replay, speed). Under
 * reduced motion the whole flow is present and stepped, never an empty box. The
 * outer box is a FIXED height (both panes scroll internally), so the scene never
 * grows as steps reveal — it can't move an anchor target out from under a scroll.
 */
export default function ConsoleSplit() {
  const { t } = useI18n();
  const c = t.console;
  const model: ConsoleModel = useMemo(() => buildConsole(c.steps), [c]);
  const { steps } = model;
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(0);
  // The step the reader is pointing at (hover), if any — it wins the highlight.
  const [hoverId, setHoverId] = useState<string | null>(null);

  const speed = SPEEDS[speedIdx] ?? 1;
  const atEnd = current >= steps.length - 1;
  const visibleCount = reduced ? steps.length : current + 1;
  const activeId = hoverId ?? steps[Math.min(current, steps.length - 1)]?.id ?? null;

  // Autoplay: advance one step per dwell while playing, on-screen, motion allowed.
  useEffect(() => {
    if (reduced || !playing || !inView || atEnd) return;
    const id = window.setTimeout(() => setCurrent((c) => Math.min(c + 1, steps.length - 1)), BASE_DWELL / speed);
    return () => window.clearTimeout(id);
  }, [current, playing, inView, reduced, atEnd, steps.length, speed]);

  const go = (next: number) => {
    setPlaying(false);
    setCurrent(Math.max(0, Math.min(steps.length - 1, next)));
  };
  const restart = () => {
    setHoverId(null);
    setCurrent(0);
    setPlaying(!reduced);
  };

  // How far the ledger ramp has advanced by the active step.
  const reachedStatuses = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i <= (reduced ? steps.length - 1 : current); i++) {
      const s = steps[i]?.meaning.status;
      if (s) set.add(s);
    }
    return set;
  }, [current, reduced, steps]);

  const activeStep = steps.find((s) => s.id === activeId) ?? steps[0];

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-line bg-surface-1"
      role="group"
      aria-label={c.aria.group}
    >
      {/* Header: what we're watching · the ledger ramp · pace controls */}
      <div className="flex flex-col gap-3 border-b border-line-soft p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span aria-hidden="true" className="text-brand">◆</span>
            <span className="font-display text-sm font-semibold text-text">{c.title}</span>
            <span className="font-mono text-[11px] text-faint truncate">{c.journeyPrefix} {model.journey}</span>
          </div>
          <Controls
            c={c}
            reduced={reduced}
            playing={playing}
            atStart={current <= 0}
            atEnd={atEnd}
            index={current}
            total={steps.length}
            speed={speed}
            onPlayPause={() => setPlaying((p) => !p)}
            onPrev={() => go(current - 1)}
            onNext={() => go(current + 1)}
            onRestart={restart}
            onCycleSpeed={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
          />
        </div>

        {/* Scrubber + ledger ramp */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={Math.min(current, steps.length - 1)}
            onChange={(e) => go(Number(e.currentTarget.value))}
            aria-label={c.aria.scrub}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-brand"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            {RAMP.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true" className="text-faint text-[10px]">→</span>}
                <span className={reachedStatuses.has(s) ? "" : "opacity-30 grayscale"}>
                  <StateBadge state={s} size="sm" title={false} />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* The two synchronised panes. Fixed height → the box never grows. */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <TerminalPane
          c={c}
          steps={steps}
          visibleCount={visibleCount}
          activeId={activeId}
          reduced={reduced}
          onHover={setHoverId}
          onPick={(i) => go(i)}
        />
        <MeaningPane
          c={c}
          model={model}
          steps={steps}
          visibleCount={visibleCount}
          activeId={activeId}
          reduced={reduced}
          onHover={setHoverId}
          onPick={(i) => go(i)}
        />
      </div>

      {/* A screen-reader announcement of the active step and its meaning. */}
      <p className="sr-only" aria-live="polite">
        {c.srStep(Math.min(current + 1, steps.length), steps.length)}: {activeStep?.meaning.title}. {activeStep?.meaning.plain}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ controls */

function Controls(props: {
  c: ConsoleText;
  reduced: boolean;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  index: number;
  total: number;
  speed: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
  onCycleSpeed: () => void;
}) {
  const { c, reduced, playing, atStart, atEnd, index, total, speed } = props;
  const btn =
    "rounded-md border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button type="button" onClick={props.onPrev} disabled={atStart} aria-label={c.aria.prev} className={btn}>
        ‹
      </button>
      {!reduced && (
        <button
          type="button"
          onClick={atEnd ? props.onRestart : props.onPlayPause}
          aria-label={atEnd ? c.aria.replay : playing ? c.aria.pause : c.aria.play}
          className={btn}
        >
          {atEnd ? `↺ ${c.replay}` : playing ? "❚❚" : "▶"}
        </button>
      )}
      <button type="button" onClick={props.onNext} disabled={atEnd} aria-label={c.aria.next} className={btn}>
        ›
      </button>
      {!reduced && (
        <button type="button" onClick={props.onCycleSpeed} aria-label={c.aria.speed(speed)} className={btn}>
          {speed}×
        </button>
      )}
      <button type="button" onClick={props.onRestart} aria-label={c.aria.restart} className={`${btn} hidden sm:inline`}>
        ↺
      </button>
      <span className="ml-0.5 font-mono text-[11px] tabular-nums text-faint">
        {Math.min(index + 1, total)}/{total}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------- terminal pane */

function TerminalPane({
  c,
  steps,
  visibleCount,
  activeId,
  reduced,
  onHover,
  onPick,
}: {
  c: ConsoleText;
  steps: Step[];
  visibleCount: number;
  activeId: string | null;
  reduced: boolean;
  onHover: (id: string | null) => void;
  onPick: (i: number) => void;
}) {
  const activeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [activeId, reduced]);

  return (
    <div className="flex h-[26rem] flex-col border-b border-line-soft lg:h-[32rem] lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/50 px-3.5 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-state-failed/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-escalated/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-verified/60" />
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">{c.terminalHeader}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-2/20 p-3.5 font-mono">
        <ol className="flex flex-col gap-2.5">
          {steps.slice(0, visibleCount).map((step, i) => {
            const active = step.id === activeId;
            return (
              <li key={step.id} ref={active ? activeRef : undefined}>
                <button
                  type="button"
                  onMouseEnter={() => onHover(step.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(step.id)}
                  onBlur={() => onHover(null)}
                  onClick={() => onPick(i)}
                  aria-label={c.aria.step(i + 1, step.meaning.title)}
                  className={`block w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    active ? "border-brand/70 bg-brand/[0.06]" : "border-transparent hover:border-line-soft"
                  }`}
                >
                  {step.terminal.lines.map((line, k) => (
                    <TerminalLineView key={k} line={line} />
                  ))}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

const TONE_CLASS: Record<NonNullable<LeftLine["tone"]>, string> = {
  ok: "text-state-verified",
  reject: "text-state-failed",
  gated: "text-state-escalated",
  info: "text-muted",
  queued: "text-state-dispatched",
  muted: "text-faint",
};

function TerminalLineView({ line }: { line: LeftLine }) {
  if (line.kind === "prompt") {
    return (
      <p className="text-[12.5px] leading-relaxed text-text">
        <span aria-hidden="true" className="mr-1.5 select-none text-brand">pe›</span>
        {line.text}
      </p>
    );
  }
  if (line.kind === "reply") {
    return <p className="text-[12px] leading-relaxed text-muted">{line.text}</p>;
  }
  if (line.kind === "command") {
    return (
      <p className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-text">
        <span aria-hidden="true" className="mr-1.5 select-none text-faint">$</span>
        {line.text}
      </p>
    );
  }
  return (
    <p className={`whitespace-pre-wrap break-words pl-4 text-[12px] leading-relaxed ${line.tone ? TONE_CLASS[line.tone] : "text-muted"}`}>
      {line.text}
    </p>
  );
}

/* --------------------------------------------------------------- meaning pane */

function MeaningPane({
  c,
  model,
  steps,
  visibleCount,
  activeId,
  reduced,
  onHover,
  onPick,
}: {
  c: ConsoleText;
  model: ConsoleModel;
  steps: Step[];
  visibleCount: number;
  activeId: string | null;
  reduced: boolean;
  onHover: (id: string | null) => void;
  onPick: (i: number) => void;
}) {
  const activeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [activeId, reduced]);

  return (
    <div className="flex h-[26rem] flex-col lg:h-[32rem]">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/50 px-3.5 py-2">
        <span aria-hidden="true" className="text-brand">↔</span>
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">{c.meaningHeader}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
        <ol className="flex flex-col gap-2.5">
          {steps.slice(0, visibleCount).map((step, i) => {
            const active = step.id === activeId;
            return (
              <li key={step.id} ref={active ? activeRef : undefined}>
                <div
                  onMouseEnter={() => onHover(step.id)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onPick(i)}
                  className={`rounded-xl border p-3 transition-colors ${
                    active ? "border-brand/70 bg-brand/[0.05]" : "border-line-soft hover:border-line"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] ${
                        active ? "bg-brand/20 text-brand-strong" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {KIND_GLYPH[step.meaning.kind]}
                    </span>
                    <span className="font-display text-[13px] font-semibold text-text">{step.meaning.title}</span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-muted">{step.meaning.plain}</p>
                  <MeaningDetail c={c} model={model} meaning={step.meaning} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ----------------------------- per-kind derived detail (all from the domain) */

function MeaningDetail({ c, model, meaning }: { c: ConsoleText; model: ConsoleModel; meaning: Meaning }) {
  const [lawson, viola] = model.specialists;

  if (meaning.kind === "skill-match") {
    return (
      <ul className="mt-2 flex flex-col gap-1">
        {model.skill.verdicts.map((v) => (
          <li key={v.kit} className="flex items-center gap-2 font-mono text-[11px]">
            <span className={v.matched ? "text-state-verified" : "text-faint"}>{v.matched ? c.detail.match : c.detail.skip}</span>
            <span className={v.matched ? "text-text" : "text-faint"}>{v.kit}</span>
            {v.floor && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-brand">{c.detail.floor}</span>}
          </li>
        ))}
      </ul>
    );
  }

  if (meaning.kind === "envelope" && lawson) {
    const e = lawson.envelope;
    const axes: [string, string][] = [
      ["mode", lawson.mode],
      ["harness", lawson.harness],
      ["tier", lawson.tier],
      ["effort", lawson.intensity],
    ];
    return (
      <div className="mt-2 rounded-lg border border-state-escalated/30 bg-state-escalated/10 p-2.5">
        <div className="flex flex-wrap gap-1.5">
          {axes.map(([k, val]) => (
            <span key={k} className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
              <span className="text-faint">{k}</span> {val}
            </span>
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted">
          2 × 4 × 8 = <span className="font-semibold text-text">cost-index {e.costIndex}</span>{" "}
          <span className="text-faint">· {c.detail.costNote}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] font-semibold text-state-escalated">
          <span aria-hidden="true">⚑</span> {c.detail.gated} · {e.gateReasons.join(", ")}
        </p>
      </div>
    );
  }

  if (meaning.kind === "law" && lawson && viola) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-muted">{c.detail.wave} 1 · {lawson.persona}</span>
        <span aria-hidden="true" className="text-faint">{c.detail.then}</span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-muted">{c.detail.wave} 2 · {viola.persona}</span>
        <span className="text-faint">{c.detail.sameSerialize}</span>
      </div>
    );
  }

  if (meaning.kind === "worktree" && lawson) {
    return (
      <code className="mt-2 block break-all rounded-lg border border-line-soft bg-surface-2/60 px-2.5 py-1.5 font-mono text-[11px] text-muted">
        {lawson.worktree}
      </code>
    );
  }

  if (meaning.status) {
    return (
      <div className="mt-2">
        <StateBadge state={meaning.status} size="sm" />
      </div>
    );
  }

  return null;
}
