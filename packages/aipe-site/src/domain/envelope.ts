/**
 * Execution envelope pricer — the four axes, the cost-index, and the GATED
 * badge, exactly as `aipe execution propose` computes them. Traceable to
 * src/execution/cost.ts and docs/dossie/14-execution-envelope.md.
 *
 * cost-index = mode × tier × intensity   (harness is a viability axis, not a
 * multiplier). The cheapest envelope — subagent · fast · normal — is 1; every
 * other combination is a whole multiple.
 *
 * IMPORTANT: cost-index is a COARSE RELATIVE INDEX, NEVER MONEY. AIPe cannot
 * know your token price, plan, or rate limits. Every surface that prints it
 * must say so.
 */

import { HARNESSES, type HarnessId } from "./harness";

export type EnvelopeMode = "subagent" | "session";
export type Intensity = "normal" | "ultracode";
export type ModelTier = "fast" | "standard" | "reasoning" | "frontier";

export const MODE_MULT: Record<EnvelopeMode, number> = { subagent: 1, session: 2 };
export const TIER_MULT: Record<ModelTier, number> = { fast: 1, standard: 2, reasoning: 4, frontier: 6 };
export const INTENSITY_MULT: Record<Intensity, number> = { normal: 1, ultracode: 8 };

export interface Envelope {
  mode: EnvelopeMode;
  intensity: Intensity;
  harness: HarnessId;
  tier: ModelTier;
}

/** The coarse relative cost-index. Never currency. */
export function costIndex(e: Pick<Envelope, "mode" | "intensity" | "tier">): number {
  return MODE_MULT[e.mode] * TIER_MULT[e.tier] * INTENSITY_MULT[e.intensity];
}

export interface Policy {
  /** Per-envelope signature gates — the only thing that gates a SINGLE envelope. */
  gatedIntensities: Intensity[];
  gatedTiers: ModelTier[];
  /**
   * WAVE-level ceiling: a wave whose SUMMED cost-index exceeds this is GATED.
   * It never gates a single envelope on its own (mirrors the reference — see
   * `isGated`), so it is carried here only to be shown as the wave-scoped policy.
   */
  maxCostIndexPerWave: number;
  /** WAVE-level: more than this many sessions in one wave is GATED. */
  gateAboveSessions: number;
}

/** The shipped default policy (.aipe/execution-policy.yaml defaults). */
export const DEFAULT_POLICY: Policy = {
  gatedIntensities: ["ultracode"],
  gatedTiers: ["frontier"],
  maxCostIndexPerWave: 24,
  gateAboveSessions: 2,
};

export interface GateResult {
  gated: boolean;
  reasons: string[];
}

/**
 * Whether a SINGLE envelope needs the PE's signature, and why. Mirrors the
 * reference `gateReasonsFor` (src/execution/propose.ts): a lone envelope is
 * gated ONLY by the signature axes — a gated intensity or a gated tier. The
 * `maxCostIndexPerWave` and `gateAboveSessions` ceilings are WAVE-level (they
 * apply to a grouped wave's summed cost / session count), so they deliberately
 * do NOT participate here. The pricer enumerates and prices; it never chooses.
 */
export function isGated(e: Envelope, policy: Policy = DEFAULT_POLICY): GateResult {
  const reasons: string[] = [];
  if (policy.gatedIntensities.includes(e.intensity)) reasons.push(`intensity:${e.intensity}`);
  if (policy.gatedTiers.includes(e.tier)) reasons.push(`tier:${e.tier}`);
  return { gated: reasons.length > 0, reasons };
}

export interface Viability {
  viable: boolean;
  /** Reject reason when not viable, e.g. `harness-not-containable codex`. */
  reason?: string;
}

/**
 * Whether an envelope is even offered. Session mode requires a containable
 * harness; subagent mode is always viable harness-wise.
 */
export function envelopeViability(e: Envelope): Viability {
  if (e.mode === "session" && !HARNESSES[e.harness].containable) {
    return { viable: false, reason: `harness-not-containable ${e.harness}` };
  }
  return { viable: true };
}

export interface PricedEnvelope extends Envelope {
  costIndex: number;
  gated: boolean;
  gateReasons: string[];
  viable: boolean;
  viabilityReason?: string;
}

/** Price one envelope, mirroring a single `aipe execution propose` line. */
export function priceEnvelope(e: Envelope, policy: Policy = DEFAULT_POLICY): PricedEnvelope {
  const gate = isGated(e, policy);
  const viability = envelopeViability(e);
  return {
    ...e,
    costIndex: costIndex(e),
    gated: gate.gated,
    gateReasons: gate.reasons,
    viable: viability.viable,
    viabilityReason: viability.reason,
  };
}
