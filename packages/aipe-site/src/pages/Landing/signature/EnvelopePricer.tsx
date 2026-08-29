import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  priceEnvelope,
  MODE_MULT,
  TIER_MULT,
  INTENSITY_MULT,
  DEFAULT_POLICY,
  type Envelope,
  type EnvelopeMode,
  type Intensity,
  type ModelTier,
  type PricedEnvelope,
} from "../../../domain/envelope";
import { HARNESS_IDS, type HarnessId } from "../../../domain/harness";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import { useI18n } from "../../../i18n";

/** The localised sentence templates a `gateReasons` token is wrapped in. */
interface GateReasonCopy {
  gateIntensityNeedsSignature: (intensity: string) => string;
  gateTierNeedsSignature: (tier: string) => string;
}

/**
 * Turn one raw `gateReasons` token from the domain module into a sentence the
 * reader can act on. Pure and total — every reason the pricer can emit maps to
 * a label, and anything unknown is passed through verbatim (never dropped). The
 * token (ultracode, frontier, …) is a literal identifier and stays English; the
 * sentence around it comes from i18n and translates. Kept exported + colocated-
 * tested so the copy can't silently drift from the policy tokens `priceEnvelope`
 * actually returns.
 */
export function gateReasonLabel(reason: string, copy: GateReasonCopy): string {
  if (reason.startsWith("intensity:")) {
    return copy.gateIntensityNeedsSignature(reason.slice("intensity:".length));
  }
  if (reason.startsWith("tier:")) {
    return copy.gateTierNeedsSignature(reason.slice("tier:".length));
  }
  return reason;
}

const MODES: readonly EnvelopeMode[] = ["subagent", "session"];
const INTENSITIES: readonly Intensity[] = ["normal", "ultracode"];
const TIERS: readonly ModelTier[] = ["fast", "standard", "reasoning", "frontier"];

/** A few notable envelopes for the reference table. Priced live, never hardcoded. */
const REFERENCE_ENVELOPES: readonly Envelope[] = [
  { mode: "subagent", intensity: "normal", harness: "claude-code", tier: "fast" },
  { mode: "session", intensity: "normal", harness: "claude-code", tier: "reasoning" },
  { mode: "subagent", intensity: "ultracode", harness: "gemini", tier: "frontier" },
  { mode: "session", intensity: "ultracode", harness: "claude-code", tier: "frontier" },
  { mode: "session", intensity: "normal", harness: "codex", tier: "standard" },
];

interface AxisControlProps<T extends string> {
  legend: string;
  hint?: string;
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  /** Optional per-option annotation shown under the label (e.g. containment). */
  annotate?: (opt: T) => { note?: string; excluded?: boolean };
  reduced: boolean;
}

function AxisControl<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  annotate,
  reduced,
}: AxisControlProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mb-2">
        {legend}
        {hint ? <span className="ml-2 normal-case tracking-normal text-faint/80">{hint}</span> : null}
      </legend>
      <div role="radiogroup" aria-label={legend} className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const selected = opt === value;
          const meta = annotate?.(opt);
          const excluded = meta?.excluded ?? false;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt)}
              className={[
                "group relative rounded-lg border px-3 py-2 text-left font-mono text-[13px]",
                reduced ? "" : "transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1",
                selected
                  ? "border-brand bg-brand/10 text-text"
                  : "border-line-soft bg-surface-2 text-muted hover:border-line hover:text-text",
              ].join(" ")}
            >
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={[
                    "inline-block h-2.5 w-2.5 shrink-0 rounded-full border",
                    selected ? "border-brand bg-brand" : "border-line",
                  ].join(" ")}
                />
                <span className={selected ? "font-semibold" : ""}>{opt}</span>
                {selected ? <span className="sr-only"> (selected)</span> : null}
              </span>
              {meta?.note ? (
                <span
                  className={[
                    "mt-1 block text-[10.5px] leading-tight",
                    excluded ? "text-state-failed" : "text-faint",
                  ].join(" ")}
                >
                  {meta.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Multiplicand({ label, factor }: { label: string; factor: number }) {
  return (
    <span className="inline-flex flex-col items-center">
      <span className="font-display text-2xl font-semibold text-text tabular-nums">×{factor}</span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{label}</span>
    </span>
  );
}

export default function EnvelopePricer() {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const e18n = t.envelope;

  const [mode, setMode] = useState<EnvelopeMode>("subagent");
  const [intensity, setIntensity] = useState<Intensity>("normal");
  const [harness, setHarness] = useState<HarnessId>("claude-code");
  const [tier, setTier] = useState<ModelTier>("standard");

  const envelope: Envelope = { mode, intensity, harness, tier };
  const priced: PricedEnvelope = useMemo(() => priceEnvelope(envelope), [mode, intensity, harness, tier]);

  // Containment is truthful and domain-derived: a harness is session-eligible
  // iff a session dispatch to it is viable. No harness table duplicated here.
  const containable = useMemo(() => {
    const map: Record<HarnessId, boolean> = {} as Record<HarnessId, boolean>;
    for (const id of HARNESS_IDS) {
      map[id] = priceEnvelope({ mode: "session", intensity, harness: id, tier }).viable;
    }
    return map;
  }, [intensity, tier]);

  return (
    <div className="w-full rounded-2xl border border-line bg-surface-1">
      {/* Controls */}
      <div className="grid grid-cols-1 gap-6 border-b border-line-soft p-5 sm:p-6 md:grid-cols-2">
        <AxisControl
          legend="mode"
          options={MODES}
          value={mode}
          onChange={setMode}
          reduced={reduced}
        />
        <AxisControl
          legend="intensity"
          options={INTENSITIES}
          value={intensity}
          onChange={setIntensity}
          reduced={reduced}
        />
        <AxisControl
          legend="tier"
          options={TIERS}
          value={tier}
          onChange={setTier}
          reduced={reduced}
        />
        <AxisControl
          legend="harness"
          hint={e18n.harnessHint}
          options={HARNESS_IDS}
          value={harness}
          onChange={setHarness}
          reduced={reduced}
          annotate={(id) =>
            mode === "session" && !containable[id]
              ? { note: e18n.noteNotContainable, excluded: true }
              : { note: containable[id] ? e18n.noteSessionEligible : e18n.noteSubagentOnly }
          }
        />
      </div>

      {/* Result */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Index + breakdown */}
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mb-1">{e18n.costIndex}</p>
            <div className="flex items-end gap-4">
              <motion.span
                key={priced.costIndex}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
                className="font-display text-6xl font-bold leading-none text-brand tabular-nums sm:text-7xl"
              >
                {priced.costIndex}
              </motion.span>
              <div className="mb-1 hidden items-end gap-3 sm:flex">
                <Multiplicand label="mode" factor={MODE_MULT[mode]} />
                <Multiplicand label="tier" factor={TIER_MULT[tier]} />
                <Multiplicand label="intensity" factor={INTENSITY_MULT[intensity]} />
              </div>
            </div>
            <p className="mt-3 font-mono text-[12.5px] text-muted">
              {MODE_MULT[mode]} <span className="text-faint">(mode)</span> × {TIER_MULT[tier]}{" "}
              <span className="text-faint">(tier)</span> × {INTENSITY_MULT[intensity]}{" "}
              <span className="text-faint">(intensity)</span> ={" "}
              <span className="text-text font-semibold">{priced.costIndex}</span>
            </p>
            <p className="mt-2 max-w-md text-[12px] leading-relaxed text-faint">{e18n.coarseNote}</p>
          </div>

          {/* Status: gated / viability */}
          <div className="flex shrink-0 flex-col gap-3 lg:w-72">
            {/* Viability */}
            {priced.viable ? (
              <div className="rounded-lg border border-state-verified/40 bg-state-verified/10 px-3 py-2.5">
                <p className="flex items-center gap-2 font-mono text-[12px] text-state-verified">
                  <span aria-hidden="true">●</span> {e18n.viable}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-state-failed bg-state-failed/10 px-3 py-2.5">
                <p className="flex items-center gap-2 font-mono text-[12px] font-semibold text-state-failed">
                  <span aria-hidden="true">✕</span> {e18n.nonViable}
                </p>
                <p className="mt-1 font-mono text-[12px] text-state-failed">
                  {e18n.rejectPrefix} {priced.viabilityReason}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-muted">{e18n.sessionRequiresContainable}</p>
              </div>
            )}

            {/* Gate */}
            {priced.gated ? (
              <div className="rounded-lg border border-state-escalated bg-state-escalated/10 px-3 py-2.5">
                <p className="flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-state-escalated">
                  <span aria-hidden="true">⚑</span> {e18n.gated}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {priced.gateReasons.map((r) => (
                    <li key={r} className="text-[11.5px] leading-tight text-muted">
                      <span className="font-mono text-state-escalated">{r}</span>
                      <span className="text-faint"> — {gateReasonLabel(r, e18n)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-line-soft bg-surface-2 px-3 py-2.5">
                <p className="font-mono text-[12px] text-muted">
                  <span className="text-state-verified">{e18n.ungated}</span> {e18n.autoDispatchable}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Policy in effect — kept honest about scope: what gates THIS single
            envelope vs. what only gates a grouped wave. */}
        <div className="mt-6 space-y-1 rounded-lg border border-line-soft bg-surface-2/60 px-3 py-2.5 font-mono text-[11px] text-faint">
          <p>
            <span className="text-muted">{e18n.perEnvelope}</span> · {e18n.gatedIntensities} [
            {DEFAULT_POLICY.gatedIntensities.join(", ")}] · {e18n.gatedTiers} [{DEFAULT_POLICY.gatedTiers.join(", ")}]
          </p>
          <p>
            <span className="text-muted">{e18n.perWave}</span> ·
            maxCostIndexPerWave {DEFAULT_POLICY.maxCostIndexPerWave} · gateAboveSessions{" "}
            {DEFAULT_POLICY.gateAboveSessions}
          </p>
        </div>

        {/* Reference table */}
        <div className="mt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mb-2">
            {e18n.referenceEnvelopes}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse font-mono text-[12px]">
              <thead>
                <tr className="text-left text-faint">
                  <th className="border-b border-line-soft py-2 pr-3 font-normal">{e18n.thEnvelope}</th>
                  <th className="border-b border-line-soft py-2 pr-3 font-normal text-right">{e18n.thIndex}</th>
                  <th className="border-b border-line-soft py-2 font-normal">{e18n.thStatus}</th>
                </tr>
              </thead>
              <tbody>
                {REFERENCE_ENVELOPES.map((e) => {
                  const p = priceEnvelope(e);
                  return (
                    <tr key={`${e.mode}-${e.intensity}-${e.harness}-${e.tier}`} className={p.viable ? "" : "opacity-60"}>
                      <td className="border-b border-line-soft/60 py-2 pr-3 text-muted">
                        {e.mode}·{e.tier}·{e.intensity}·{e.harness}
                      </td>
                      <td className="border-b border-line-soft/60 py-2 pr-3 text-right font-semibold text-text tabular-nums">
                        {p.costIndex}
                      </td>
                      <td className="border-b border-line-soft/60 py-2">
                        {!p.viable ? (
                          <span className="text-state-failed">{e18n.nonViablePrefix} {p.viabilityReason}</span>
                        ) : p.gated ? (
                          <span className="text-state-escalated">{e18n.gatedLabel}</span>
                        ) : (
                          <span className="text-state-verified">{e18n.ungatedLabel}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
