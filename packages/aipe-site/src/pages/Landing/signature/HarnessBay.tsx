import { useState } from "react";
import { motion } from "framer-motion";
import { isSessionEligible, sessionRejectReason, type HarnessId } from "../../../domain/harness";
import {
  AGENTOP_HOSTED_COUNT,
  CAPABILITY_KEYS,
  COMPAT_HARNESSES,
  FULLY_CONTAINED_COUNT,
  compatDispatchLine,
  compatPercent,
  isFullyContained,
  type CapabilityKey,
  type CompatHarness,
} from "../../../domain/harnessCompat";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import { useI18n } from "../../../i18n";

/**
 * The exact mono line `aipe dispatch validate` prints for a session-mode dispatch
 * to one of the FOUR adapter harnesses. The truth (OK vs reject) comes entirely
 * from the domain module (`sessionRejectReason`), never hardcoded here. Kept as a
 * stable, tested contract even though the accordion now renders through
 * `compatDispatchLine` — the two must agree for any adapter id.
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

function panelId(id: string): string {
  return `compat-panel-${id}`;
}
function headerId(id: string): string {
  return `compat-header-${id}`;
}

/** The five-check ruler: filled pips are the checks this harness passes. */
function Ruler({ caps }: { caps: CompatHarness["caps"] }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {CAPABILITY_KEYS.map((k) => (
        <span
          key={k}
          className={[
            "h-1.5 w-4 rounded-full",
            caps[k] ? "bg-brand" : "bg-line",
          ].join(" ")}
        />
      ))}
    </span>
  );
}

export default function HarnessBay() {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const b = t.harnessBay;
  const [open, setOpen] = useState<string>("claude-code");

  return (
    <div className="flex flex-col gap-6">
      {/* Host × contain — the number the agentop print confuses, made explicit. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface-1 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{b.hostContain.hostLabel}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-text">{AGENTOP_HOSTED_COUNT}</p>
          <p className="mt-1 text-sm text-muted leading-relaxed">{b.hostContain.hostNote}</p>
        </div>
        <div className="rounded-2xl border border-state-verified/30 bg-state-verified/[0.06] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{b.hostContain.containLabel}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-state-verified">{FULLY_CONTAINED_COUNT}</p>
          <p className="mt-1 text-sm text-muted leading-relaxed">{b.hostContain.containNote}</p>
        </div>
      </div>

      {/* Install content × contain session — the distinction the whole section teaches. */}
      <div className="rounded-2xl border border-line-soft bg-surface-1/60 p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-text">{b.installVsContain.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{b.installVsContain.body}</p>
        <p className="mt-3 border-l-2 border-brand/40 pl-3 font-mono text-[12.5px] leading-relaxed text-muted">
          {b.installVsContain.rule}
        </p>
      </div>

      {/* The ruler legend — the criterion the percentage is derived from, on the page. */}
      <div className="rounded-2xl border border-line-soft bg-surface-1/40 p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{b.ruler.title}</p>
        <ol className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {CAPABILITY_KEYS.map((k, i) => (
            <li key={k} className="flex items-start gap-2.5">
              <span className="mt-0.5 h-1.5 w-4 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <span className="text-[13px] leading-snug text-muted">
                <span className="font-semibold text-text">{b.ruler.caps[k]}</span>
                {" — "}
                {b.ruler.hints[k]}
              </span>
              <span className="sr-only">{`check ${i + 1} of ${CAPABILITY_KEYS.length}`}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* One accordion row per harness — the PDD ten, honestly. */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface-1">
        <ul className="divide-y divide-line">
          {COMPAT_HARNESSES.map((h) => {
            const active = open === h.id;
            const contained = isFullyContained(h);
            const pct = compatPercent(h);
            const line = compatDispatchLine(h);
            const okLine = h.adapter !== null && isSessionEligible(h.adapter);
            const c = b.copy[h.copyKey];
            return (
              <li key={h.id}>
                <h4>
                  <button
                    type="button"
                    id={headerId(h.id)}
                    aria-expanded={active}
                    aria-controls={panelId(h.id)}
                    onClick={() => setOpen(active ? "" : h.id)}
                    className={[
                      "flex w-full items-center gap-4 px-4 py-4 text-left transition-colors sm:px-5",
                      reduced ? "transition-none" : "",
                      active ? "bg-surface-2" : "hover:bg-surface-2/50",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "shrink-0 text-faint transition-transform",
                        reduced ? "transition-none" : "",
                        active ? "rotate-90" : "",
                      ].join(" ")}
                    >
                      ▸
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-display text-base font-semibold text-text">{h.label}</span>
                        <span className="font-mono text-[11px] text-faint">
                          {b.row.hostedAs} {h.agentopName}
                        </span>
                        {contained ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-state-verified/15 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-state-verified">
                            <span aria-hidden="true">✓</span>
                            {b.row.fullyContained}
                          </span>
                        ) : h.adapter !== null ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-state-running/15 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-state-running">
                            {b.row.adapterNotContained}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-line px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-faint">
                            {b.row.notVerified}
                          </span>
                        )}
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={[
                          "font-display text-lg font-semibold tabular-nums",
                          contained ? "text-state-verified" : "text-text",
                        ].join(" ")}
                      >
                        {pct}%
                      </span>
                      <Ruler caps={h.caps} />
                    </span>
                  </button>
                </h4>

                {active && (
                  <motion.div
                    id={panelId(h.id)}
                    role="region"
                    aria-labelledby={headerId(h.id)}
                    initial={reduced ? false : { opacity: 0, height: 0 }}
                    animate={reduced ? {} : { opacity: 1, height: "auto" }}
                    transition={reduced ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 px-4 pb-5 pt-1 sm:px-5">
                      <p className="max-w-3xl text-sm leading-relaxed text-muted">
                        <span className="font-semibold text-text">
                          {contained ? b.row.whyContainedLabel : b.row.whyNotLabel}
                        </span>{" "}
                        {c.why}
                      </p>

                      {!contained && (
                        <p className="max-w-3xl text-sm leading-relaxed text-muted">
                          <span className="font-semibold text-text">{b.row.whatsMissingLabel}</span>{" "}
                          {"missing" in c ? c.missing : ""}
                        </p>
                      )}

                      <div
                        className={[
                          "overflow-x-auto rounded-lg border px-3.5 py-2.5",
                          okLine
                            ? "border-state-verified/25 bg-state-verified/10"
                            : "border-state-failed/25 bg-state-failed/10",
                        ].join(" ")}
                      >
                        <code
                          className={[
                            "block whitespace-pre font-mono text-[12.5px] leading-relaxed",
                            okLine ? "text-state-verified" : "text-state-failed",
                          ].join(" ")}
                        >
                          {okLine ? line : `✕ ${line}`}
                        </code>
                      </div>

                      {!contained && (
                        <div className="rounded-lg border border-state-running/25 bg-state-running/[0.07] px-4 py-3.5">
                          <p className="text-sm leading-relaxed text-muted">
                            <span className="font-semibold text-text">{b.row.howAnywayLabel}</span>{" "}
                            {b.degraded.howAnyway}
                          </p>
                          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted">
                            <span
                              className="mt-px shrink-0 rounded-sm bg-state-running/20 px-1.5 font-mono text-[10px] font-bold uppercase text-state-running"
                              aria-hidden="true"
                            >
                              {b.row.tradeoff}
                            </span>
                            <span>{b.degraded.lose}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
