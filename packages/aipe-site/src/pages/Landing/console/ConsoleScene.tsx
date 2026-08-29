import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n";
import { useInView } from "../../../lib/useInView";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import Terminal from "./Terminal";
import Stage, { type StageLabels } from "./Stage";
import { buildFacts, ENVELOPE_AXIS_KEYS, envelopeAxisValues } from "./consoleScript";
import { buildBeats, foldScene, activeDecision as decisionAt, type DecisionId } from "./sceneModel";

/**
 * The thin coordination layer that joins the two independent hero components.
 *
 * It owns nothing of their internals — only the SHARED STEP INDEX into the beat
 * stream and the pace controls. It advances the clock one beat at a time so one
 * side changes per beat with a beat between (a command runs on the left, then its
 * consequence enacts on the right). Terminal reads the terminal beats up to the
 * index; Stage reads the folded scene at the index. The whole thing is a fixed
 * height, so the hero never grows and can't move an anchor target (blocker D).
 */

/** Terminal beats read longer (a command to read); stage beats are a quick consequence. */
const DWELL_TERMINAL = 2600;
const DWELL_STAGE = 1100;
const SPEEDS = [1, 1.5, 2, 0.5] as const;

export default function ConsoleScene() {
  const { t } = useI18n();
  const c = t.console;
  const facts = useMemo(() => buildFacts(), []);
  // The terminal roteiro's SPEECH follows the active locale; its COMMANDS don't.
  const beats = useMemo(() => buildBeats(facts, c.script), [facts, c.script]);
  // Literal envelope axis values (session/claude-code/reasoning/ultracode) from the
  // wave-1 specialist's real priced envelope; the glosses beside them come from i18n.
  const axisValues = useMemo(() => envelopeAxisValues(facts.specialists[0]!), [facts]);
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  // Under reduced motion, open on the complete scene (still, readable), not empty.
  const [current, setCurrent] = useState(() => (reduced ? beats.length - 1 : 0));
  const [playing, setPlaying] = useState(!reduced);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [hover, setHover] = useState<DecisionId | null>(null);

  useEffect(() => {
    if (reduced) {
      setCurrent(beats.length - 1);
      setPlaying(false);
    }
  }, [reduced, beats.length]);

  const speed = SPEEDS[speedIdx] ?? 1;
  const atEnd = current >= beats.length - 1;

  // Autoplay: one beat per dwell — a terminal beat, then its stage consequence.
  useEffect(() => {
    if (reduced || !playing || !inView || atEnd) return;
    const side = beats[current]?.side;
    const dwell = (side === "stage" ? DWELL_STAGE : DWELL_TERMINAL) / speed;
    const id = window.setTimeout(() => setCurrent((n) => Math.min(n + 1, beats.length - 1)), dwell);
    return () => window.clearTimeout(id);
  }, [current, playing, inView, reduced, atEnd, beats, speed]);

  const go = (next: number) => {
    setPlaying(false);
    setCurrent(Math.max(0, Math.min(beats.length - 1, next)));
  };
  const restart = () => {
    setHover(null);
    setCurrent(0);
    setPlaying(!reduced);
  };

  const scene = useMemo(() => foldScene(beats, current, facts), [beats, current, facts]);
  const active = hover ?? decisionAt(beats, current);

  // Caption: the most recent stage beat's caption at or before the clock.
  const captionKey = useMemo(() => {
    for (let i = Math.min(current, beats.length - 1); i >= 0; i--) {
      const b = beats[i];
      if (b?.side === "stage" && b.captionKey) return b.captionKey;
    }
    return beats.find((b) => b.side === "stage")?.captionKey ?? "";
  }, [beats, current]);
  const caption = c.captions[captionKey as keyof typeof c.captions] ?? "";

  const labels: StageLabels = {
    header: c.stageHeader,
    coordinator: c.labels.coordinator,
    unit: c.labels.unit,
    floor: c.labels.floor,
    envelope: c.labels.envelope,
    costIndex: c.labels.costIndex,
    gated: c.labels.gated,
    notMoney: c.labels.notMoney,
    wave: c.labels.wave,
    queued: c.labels.queued,
    running: c.labels.running,
    worktree: c.labels.worktree,
    evidenceGate: c.labels.evidenceGate,
    qaGate: c.labels.qaGate,
    blocked: c.labels.blocked,
    open: c.labels.open,
    rejected: c.labels.rejected,
    ledger: c.labels.ledger,
    axes: ENVELOPE_AXIS_KEYS.map((key) => ({
      gloss: c.axes[key],
      value: axisValues[key],
    })),
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-line bg-surface-1"
      role="group"
      aria-label={c.aria.group}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft p-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden="true" className="text-brand">◆</span>
          <span className="font-display text-sm font-semibold text-text">{c.title}</span>
          <span className="font-mono text-[11px] text-faint truncate">{c.journeyPrefix} {facts.journey}</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            type="range"
            min={0}
            max={beats.length - 1}
            value={Math.min(current, beats.length - 1)}
            onChange={(e) => go(Number(e.currentTarget.value))}
            aria-label={c.aria.scrub}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-brand sm:w-40"
          />
          <Controls
            reduced={reduced}
            playing={playing}
            atStart={current <= 0}
            atEnd={atEnd}
            index={current}
            total={beats.length}
            speed={speed}
            aria={c.aria}
            onPlayPause={() => setPlaying((p) => !p)}
            onPrev={() => go(current - 1)}
            onNext={() => go(current + 1)}
            onRestart={restart}
            onCycleSpeed={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Terminal
          beats={beats}
          activeBeat={current}
          activeDecision={active}
          header={c.terminalHeader}
          runningLabel={c.running}
          onHoverDecision={setHover}
          onPickBeat={go}
        />
        <Stage scene={scene} caption={caption} activeDecision={active} labels={labels} reduced={reduced} />
      </div>
    </div>
  );
}

function Controls({
  reduced,
  playing,
  atStart,
  atEnd,
  index,
  total,
  speed,
  aria,
  onPlayPause,
  onPrev,
  onNext,
  onRestart,
  onCycleSpeed,
}: {
  reduced: boolean;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  index: number;
  total: number;
  speed: number;
  aria: { prev: string; next: string; play: string; pause: string; replay: string; restart: string; speed: (s: number) => string };
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
  onCycleSpeed: () => void;
}) {
  const btn =
    "rounded-md border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button type="button" onClick={onPrev} disabled={atStart} aria-label={aria.prev} className={btn}>‹</button>
      {!reduced && (
        <button
          type="button"
          onClick={atEnd ? onRestart : onPlayPause}
          aria-label={atEnd ? aria.replay : playing ? aria.pause : aria.play}
          className={btn}
        >
          {atEnd ? "↺" : playing ? "❚❚" : "▶"}
        </button>
      )}
      <button type="button" onClick={onNext} disabled={atEnd} aria-label={aria.next} className={btn}>›</button>
      {!reduced && (
        <button type="button" onClick={onCycleSpeed} aria-label={aria.speed(speed)} className={btn}>{speed}×</button>
      )}
      <button type="button" onClick={onRestart} aria-label={aria.restart} className={`${btn} hidden sm:inline`}>↺</button>
      <span className="ml-0.5 font-mono text-[11px] tabular-nums text-faint">{Math.min(index + 1, total)}/{total}</span>
    </div>
  );
}
