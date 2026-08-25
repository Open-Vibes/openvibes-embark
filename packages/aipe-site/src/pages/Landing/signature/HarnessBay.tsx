import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  HARNESS_IDS,
  HARNESSES,
  isSessionEligible,
  sessionRejectReason,
  type HarnessId,
} from "../../../domain/harness";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import { useI18n } from "../../../i18n";

/**
 * The exact mono line `aipe dispatch validate` prints for a session-mode
 * dispatch to a harness. This is the presentation contract owned by this
 * component; the *truth* (whether it's OK or a reject) comes entirely from the
 * domain module via `sessionRejectReason`, never hardcoded here.
 */
export interface DispatchOutcome {
  ok: boolean;
  line: string;
}

export function dispatchOutcome(id: HarnessId): DispatchOutcome {
  const reject = sessionRejectReason(id);
  if (reject !== null) {
    return { ok: false, line: reject };
  }
  return { ok: true, line: `aipe dispatch --mode session --harness ${id} validate → OK` };
}

const WORKSPACE_LABEL: Record<HarnessId, string> = {
  "claude-code": "available",
  gemini: "coming-soon",
  codex: "coming-soon",
  copilot: "coming-soon",
};

function tabId(id: HarnessId): string {
  return `harness-tab-${id}`;
}

function panelId(id: HarnessId): string {
  return `harness-panel-${id}`;
}

export default function HarnessBay() {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const b = t.harnessBay;
  const [selected, setSelected] = useState<HarnessId>("claude-code");

  const info = HARNESSES[selected];
  const eligible = isSessionEligible(selected);
  const outcome = dispatchOutcome(selected);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = HARNESS_IDS.indexOf(selected);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % HARNESS_IDS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + HARNESS_IDS.length) % HARNESS_IDS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = HARNESS_IDS.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    const next = HARNESS_IDS[nextIndex];
    if (next === undefined) return;
    setSelected(next);
    const el = document.getElementById(tabId(next));
    if (el) el.focus();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-1">
      {/* Lane picker — a real tablist. Each lane already tells its own truth: the
          ✓/✕ session marker and the workspace tag, so the reader sees the
          differentiation before selecting. */}
      <div
        role="tablist"
        aria-label="Harness lanes"
        aria-orientation="horizontal"
        className="grid grid-cols-1 gap-px border-b border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
      >
        {HARNESS_IDS.map((id) => {
          const laneEligible = isSessionEligible(id);
          const active = id === selected;
          return (
            <button
              key={id}
              id={tabId(id)}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={panelId(id)}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(id)}
              onKeyDown={onTabKeyDown}
              className={[
                "group flex flex-col gap-2 px-4 py-3.5 text-left transition-colors",
                reduced ? "transition-none" : "",
                active ? "bg-surface-2" : "bg-surface-1 hover:bg-surface-2/60",
              ].join(" ")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-text">{id}</span>
                {active ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-brand-strong">
                    <span aria-hidden="true">●</span>{b.selected}
                  </span>
                ) : null}
              </span>
              <span
                className={[
                  "inline-flex w-fit items-center gap-1.5 font-sans text-[11px] font-medium",
                  laneEligible ? "text-state-verified" : "text-state-failed",
                ].join(" ")}
              >
                <span aria-hidden="true" className="text-xs leading-none">
                  {laneEligible ? "✓" : "✕"}
                </span>
                {laneEligible ? b.sessionEligible : b.notContainable}
              </span>
              <span className="font-mono text-[10px] text-faint">
                {b.workspacePrefix} {WORKSPACE_LABEL[id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail for the selected lane. Content is always present (default is
          claude-code → a full green panel), so there is never an empty box; the
          fade is purely decorative and off under reduced motion. */}
      <motion.div
        key={selected}
        id={panelId(selected)}
        role="tabpanel"
        aria-labelledby={tabId(selected)}
        tabIndex={0}
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
        className="p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-sm text-muted">
            {info.id} <span className="text-faint">·</span> bin{" "}
            <span className="text-text">{info.bin}</span>
          </span>
          {eligible ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-state-verified/40 bg-state-verified/12 px-2.5 py-1 font-sans text-xs font-semibold text-state-verified">
              <span aria-hidden="true">✓</span> {b.sessionEligible}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-state-failed/40 bg-state-failed/12 px-2.5 py-1 font-sans text-xs font-semibold text-state-failed">
              <span aria-hidden="true">✕</span> {b.sessionRejected}
            </span>
          )}
        </div>

        {/* Containment mechanism / rejection reason, straight from domain `why`. */}
        <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-muted">
          <span className="font-semibold text-text">
            {eligible ? b.containment : b.whyNotContained}
          </span>
          {info.why}
        </p>

        {/* The mono result line — the honest OK vs the honest reject. */}
        <div
          className={[
            "mt-4 overflow-x-auto rounded-lg border px-3.5 py-2.5",
            eligible
              ? "border-state-verified/25 bg-state-verified/10"
              : "border-state-failed/25 bg-state-failed/10",
          ].join(" ")}
        >
          <code
            className={[
              "block whitespace-pre font-mono text-[13px] leading-relaxed",
              eligible ? "text-state-verified" : "text-state-failed",
            ].join(" ")}
          >
            {eligible ? (
              outcome.line
            ) : (
              <>
                <span aria-hidden="true">✕ </span>
                {outcome.line}
              </>
            )}
          </code>
        </div>

        {/* Secondary: workspace-harness status, distinct from unit session-eligibility. */}
        <div className="mt-5 border-t border-line-soft pt-4">
          <p className="font-sans text-xs leading-relaxed text-faint">
            <span className="font-semibold uppercase tracking-wide text-muted">
              {b.workspaceHarnessAt}{" "}
              <span className="font-mono normal-case tracking-normal">aipe start</span>:
            </span>{" "}
            <span
              className={
                info.workspaceStatus === "available" ? "text-state-verified" : "text-state-running"
              }
            >
              {info.workspaceStatus}
            </span>
            {selected === "gemini" ? (
              <>
                {b.geminiNoteBefore}
                <em className="not-italic text-muted">{b.geminiNoteEmphasis}</em>
                {b.geminiNoteAfter}
              </>
            ) : null}
          </p>
        </div>

        {/* Roadmap / PENDING — clearly marked, always visible so the honest gap
            isn't hidden behind a lane the reader might not click. */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-state-running/30 bg-state-running/10 px-3.5 py-3">
          <span
            className="mt-px shrink-0 rounded-sm bg-state-running/20 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-state-running"
            aria-hidden="true"
          >
            {b.pending}
          </span>
          <p className="font-sans text-xs leading-relaxed text-muted">
            <span className="sr-only">{b.pendingSr}</span>
            {b.pendingBefore}
            <span className="font-mono text-text">codex</span>
            {b.pendingMiddle}
            <span className="font-mono text-text">copilot</span>
            {b.pendingNotShipped}
            <span className="font-semibold text-text">{b.pendingNotShippedEmphasis}</span>
            {b.pendingAfter}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
