import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LEDGER_SCENARIOS,
  reduceLedger,
  type LedgerFrame,
  type LedgerScenario,
} from "../../../domain/ledger";
import StateBadge from "../../../components/StateBadge";
import { useReducedMotion } from "../../../lib/useReducedMotion";

/**
 * Format a blocked frame as its CLI line. A ledger reject leads with the
 * machine-readable code, e.g. `REJECT evidence-required — status delivered
 * requires the command(s)…`. The operate-flow **QA gate** is NOT one of the
 * ledger's reject codes, so it is never printed as `REJECT <code>` — it leads
 * with `QA gate — …` instead, keeping the site honest about which layer blocked
 * the write. Pure — unit-tested.
 */
export function formatRejectLine(frame: LedgerFrame): string {
  const message = frame.message ?? "";
  const dash = message.indexOf(" — ");
  const detail = dash >= 0 ? message.slice(dash + 3) : message;
  if (frame.gateKind === "process") {
    return detail ? `QA gate — ${detail}` : "QA gate";
  }
  const gate = frame.gateCode ?? "rejected";
  return detail ? `REJECT ${gate} — ${detail}` : `REJECT ${gate}`;
}

/**
 * The accepted records that belong in the ledger up to and including the frame
 * the reader has scrubbed to. Rejected writes leave no record. Pure —
 * unit-tested.
 */
export function acceptedRecordsUpTo(frames: LedgerFrame[], index: number): LedgerFrame[] {
  return frames.slice(0, index + 1).filter((frame) => frame.accepted);
}

function evidenceSummary(frame: LedgerFrame): string | null {
  const evidence = frame.attempt.evidence;
  if (!evidence) return null;
  return `${evidence.by}: ${evidence.summary}`;
}

export default function LedgerScrubber() {
  const reduced = useReducedMotion();
  const [scenarioId, setScenarioId] = useState<string>(LEDGER_SCENARIOS[0]?.id ?? "happy");
  const [index, setIndex] = useState(0);

  const scenario: LedgerScenario = useMemo(
    () => LEDGER_SCENARIOS.find((s) => s.id === scenarioId) ?? LEDGER_SCENARIOS[0]!,
    [scenarioId],
  );
  const frames: LedgerFrame[] = useMemo(() => reduceLedger(scenario.attempts), [scenario]);

  const maxIndex = frames.length - 1;
  const safeIndex = Math.min(index, maxIndex);
  const current = frames[safeIndex]!;
  const records = acceptedRecordsUpTo(frames, safeIndex);
  const committed = current.status;

  function selectScenario(id: string) {
    setScenarioId(id);
    setIndex(0);
  }

  function clampSet(next: number) {
    setIndex(Math.max(0, Math.min(maxIndex, next)));
  }

  const panelMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.18 },
      };

  return (
    <div className="rounded-2xl border border-line bg-surface-1 overflow-hidden">
      {/* Scenario selector */}
      <div
        role="radiogroup"
        aria-label="Ledger scenario"
        className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex flex-wrap gap-2">
          {LEDGER_SCENARIOS.map((s) => {
            const active = s.id === scenario.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectScenario(s.id)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                  active
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line text-muted hover:border-brand/50 hover:text-text"
                }`}
              >
                {s.title}
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[11px] text-faint sm:text-right sm:max-w-[16rem]">{scenario.caption}</p>
      </div>

      {/* Scrubber controls */}
      <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => clampSet(safeIndex - 1)}
            disabled={safeIndex <= 0}
            aria-label="Previous frame"
            className="rounded-md border border-line px-2.5 py-1 font-mono text-sm text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => clampSet(safeIndex + 1)}
            disabled={safeIndex >= maxIndex}
            aria-label="Next frame"
            className="rounded-md border border-line px-2.5 py-1 font-mono text-sm text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted"
          >
            ›
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={maxIndex}
          step={1}
          value={safeIndex}
          onChange={(e) => clampSet(Number(e.target.value))}
          aria-label={`Scrub the ${scenario.title} journey`}
          aria-valuetext={`frame ${safeIndex + 1} of ${frames.length}: ${current.attempt.status}`}
          className="w-full flex-1 cursor-pointer"
          style={{ accentColor: "rgb(var(--brand))" }}
        />
        <span className="shrink-0 font-mono text-[11px] text-faint tabular-nums">
          frame {safeIndex + 1} / {frames.length}
        </span>
      </div>

      {/* Current frame */}
      <motion.div key={`${scenario.id}:${safeIndex}`} {...panelMotion} className="p-4">
        <p className="font-mono text-[12.5px] leading-relaxed text-muted">
          <span className="select-none text-brand">›</span> {current.attempt.note ?? current.attempt.status}
        </p>
        <p className="mt-1 font-mono text-[11px] text-faint">
          attempted write: <span className="text-muted">{current.attempt.status}</span>
        </p>

        {current.accepted ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
            <span aria-hidden="true" className="text-state-verified">
              ✓
            </span>
            <span>accepted — committed as</span>
            <StateBadge state={current.status} />
          </div>
        ) : current.gateKind === "process" ? (
          // The QA gate holds the merge — an operate-flow gate, not a ledger reject.
          <div className="mt-3 rounded-lg border border-state-escalated/40 bg-state-escalated/10 p-3">
            <p className="font-mono text-[12.5px] font-medium leading-relaxed text-state-escalated break-words">
              <span aria-hidden="true">⚑ </span>
              <span className="uppercase tracking-wide">{formatRejectLine(current)}</span>
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-faint">
              the merge does not land — the operate flow holds it; the unit stays{" "}
              <span className="text-muted">{current.status}</span> until QA verifies it.
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-state-failed/40 bg-state-failed/10 p-3">
            <p className="font-mono text-[12.5px] font-medium leading-relaxed text-state-failed break-words">
              <span aria-hidden="true">✕ </span>
              <span className="uppercase tracking-wide">{formatRejectLine(current)}</span>
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-faint">
              the write is not committed — the unit is still{" "}
              <span className="text-muted">{current.status}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Running ledger */}
      <div className="border-t border-line-soft bg-surface-2/50 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wide text-faint">journey ledger</span>
          <span className="flex items-center gap-2 font-mono text-[11px] text-faint">
            committed status
            <StateBadge state={committed} size="sm" />
          </span>
        </div>

        <ol className="flex flex-col gap-2">
          {records.map((frame, i) => {
            const summary = evidenceSummary(frame);
            return (
              <li
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-line-soft bg-surface-1 px-3 py-2 font-mono text-[12px] sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="shrink-0 text-faint tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <StateBadge state={frame.status} size="sm" className="shrink-0" />
                <span className="min-w-0 flex-1 break-words text-muted">
                  {frame.attempt.note ?? frame.attempt.status}
                  {summary ? <span className="text-faint"> · {summary}</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
