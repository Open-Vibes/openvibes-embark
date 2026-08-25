/**
 * The Dispatch — a staged, causal scene (hero signature component).
 *
 * This module is the *pure, framework-free* script the scene plays: the real
 * material of THIS journey (j-20260825-s2), the coordinator's reasoning, the
 * specialists it produces, and the ordered beats the component steps through.
 *
 * Nothing here is placeholder. The demand is the demand that created this site;
 * the coordinator is this workspace's coordinator (Heisenberg); the specialists
 * are the real personas dispatched on this journey (Lawson dev-fullstack, Viola
 * QA); the worktree paths, the PR number and the envelope are the real ones.
 *
 * Crucially, the *law* the scene shows is not hand-authored: each specialist's
 * wave is assigned by the real `scheduleWaves`, so Lawson and Viola — both on
 * the same package `openvibes-embark/aipe-site` — SERIALIZE into consecutive
 * waves exactly because the dispatch law forbids the same package twice in one
 * batch. That is why this file is unit-tested with `bun test`.
 */

import {
  MAX_CONCURRENT,
  SESSION_MAX_CONCURRENT,
  scheduleWaves,
  validateBatch,
  type DispatchUnit,
} from "../../../domain/dispatchLaw";
import {
  priceEnvelope,
  type Intensity,
  type ModelTier,
  type PricedEnvelope,
} from "../../../domain/envelope";
import type { HarnessId } from "../../../domain/harness";

export const JOURNEY = "j-20260825-s2";
export const WORKSPACE = "openvibes-embark";
export const COORDINATOR = "Heisenberg";
export const PR_NUMBER = 15;
export const PR_URL = "https://github.com/opvibes/openvibes-embark/pull/15";
export { MAX_CONCURRENT, SESSION_MAX_CONCURRENT };

/** Act 1 — the PE's real demand, in a Product Engineer's own voice (not a label). */
export const DEMAND = {
  author: "PE",
  text:
    "We need the public site for AIPe — a package in openvibes-embark, beside embark-site and pdd-site. " +
    "Make it genuinely attractive: a palette that's actually thought through, real structure and motion, " +
    "and components that SHOW multi-harness, multi-agent work instead of describing it. " +
    "I want it to carry what AIPe really is.",
} as const;

/** The real openvibes-embark siblings the coordinator reads the graph against. */
export const WORKSPACE_NODES = [
  { id: "aipe-site", label: "aipe-site", isNew: true },
  { id: "embark-site", label: "embark-site", isNew: false },
  { id: "pdd-site", label: "pdd-site", isNew: false },
  { id: "duckflux-site", label: "duckflux-site", isNew: false },
] as const;

export type ReasoningCue = "graph" | "spawn" | "envelope";

export interface Reasoning {
  id: string;
  text: string;
  /** A visual this line causes (its own beat), if any. */
  cue?: ReasoningCue;
}

/** Act 2 — the coordinator reasoning out loud. Sentences a human would write. */
export const REASONING: readonly Reasoning[] = [
  { id: "r1", text: "One demand, one workspace — build aipe-site as a new package in openvibes-embark." },
  { id: "r2", text: "First question: which repos does it touch? I read the relation graph.", cue: "graph" },
  { id: "r3", text: "aipe-site is a brand-new node — nothing consumes it, it consumes nothing. Zero edges." },
  { id: "r4", text: "So there is exactly one producing unit, and no dependency ordering to respect." },
  { id: "r5", text: "Its content is read-only from the aipe repo — a reference to cite, never a repo to edit." },
  {
    id: "r6",
    text:
      "The reliability floor is one dev plus one QA per package — and the same package can't run both at once. The dispatch law serializes it.",
  },
  {
    id: "r7",
    text: "So Lawson builds it first; Viola's QA follows in the next wave, on Lawson's branch.",
    cue: "spawn",
  },
  {
    id: "r8",
    text:
      "This is a whole site — scaffold, palette, the signature scenes, the docs. It needs a session of its own, at reasoning tier, ultracode.",
    cue: "envelope",
  },
  {
    id: "r9",
    text: "cost-index 64 — that's gated. The envelope goes to the PE for sign-off before anything dispatches.",
  },
];

export interface Specialist {
  id: string;
  persona: string;
  role: string;
  repo: string;
  package: string;
  worktree: string;
  harness: HarnessId;
  mode: "session";
  tier: ModelTier;
  intensity: Intensity;
  /** The reasoning line that produced this specialist — must exist in REASONING. */
  fromReasoningId: string;
  /** Assigned by the real law (scheduleWaves), never hand-set. */
  wave: number;
  /** Priced by the real cost model. */
  envelope: PricedEnvelope;
}

const SPECIALIST_SEED = [
  {
    id: "lawson",
    persona: "Lawson",
    role: "dev-fullstack",
    package: "aipe-site",
    worktree: `${WORKSPACE}/.worktrees/${JOURNEY}-aipe-site--lawson`,
    tier: "reasoning" as ModelTier,
    intensity: "ultracode" as Intensity,
    fromReasoningId: "r7",
  },
  {
    id: "viola",
    persona: "Viola",
    role: "QA",
    package: "aipe-site",
    worktree: `${WORKSPACE}/.worktrees/${JOURNEY}-aipe-site--viola`,
    tier: "reasoning" as ModelTier,
    intensity: "normal" as Intensity,
    fromReasoningId: "r7",
  },
] as const;

/**
 * Both specialists are units on the SAME package, so the real law serializes
 * them into consecutive waves. We build the units, run `scheduleWaves`, and read
 * each specialist's wave back out — the serialize is derived, not asserted.
 */
export function buildSpecialists(): Specialist[] {
  const units: DispatchUnit[] = SPECIALIST_SEED.map((s) => ({
    repo: WORKSPACE,
    package: s.package,
    mode: "session",
    harness: "claude-code",
  }));
  const waves = scheduleWaves(units);

  return SPECIALIST_SEED.map((s, i) => ({
    id: s.id,
    persona: s.persona,
    role: s.role,
    repo: WORKSPACE,
    package: s.package,
    worktree: s.worktree,
    harness: "claude-code",
    mode: "session",
    tier: s.tier,
    intensity: s.intensity,
    fromReasoningId: s.fromReasoningId,
    // Same packageKey for both, so both would map to the same wave via the map;
    // fall back to the unit's own index-in-waves to keep them distinct & lawful.
    wave: waveIndexOfUnit(waves, i),
    envelope: priceEnvelope({ mode: "session", intensity: s.intensity, harness: "claude-code", tier: s.tier }),
  }));
}

/** The wave the i-th listed unit landed in (same-package units land in order). */
function waveIndexOfUnit(waves: ReturnType<typeof scheduleWaves>, listIndex: number): number {
  let seen = 0;
  for (const wave of waves) {
    for (let k = 0; k < wave.units.length; k++) {
      if (seen === listIndex) return wave.index;
      seen++;
    }
  }
  return 0;
}

export type BeatKind =
  | "demand"
  | "handoff"
  | "reason"
  | "graph"
  | "envelope"
  | "spawn"
  | "worktree"
  | "deliver"
  | "evidence-gate"
  | "qa-gate"
  | "ledger";

export interface Beat {
  id: string;
  act: 1 | 2 | 3 | 4;
  kind: BeatKind;
  /** Reasoning id or specialist id this beat is about. */
  refId?: string;
  /** Autoplay dwell before the next beat (ms). Ignored when stepping manually. */
  dwellMs: number;
}

/** Build the ordered beat list. One "thing moving" per beat, each caused by the last. */
export function buildBeats(reasoning: readonly Reasoning[] = REASONING): Beat[] {
  const beats: Beat[] = [
    { id: "demand", act: 1, kind: "demand", dwellMs: 3400 },
    { id: "handoff", act: 1, kind: "handoff", dwellMs: 1200 },
  ];

  for (const r of reasoning) {
    beats.push({ id: `reason-${r.id}`, act: 2, kind: "reason", refId: r.id, dwellMs: 2100 });
    if (r.cue === "graph") beats.push({ id: "graph", act: 2, kind: "graph", dwellMs: 2000 });
    if (r.cue === "envelope") beats.push({ id: "envelope", act: 2, kind: "envelope", dwellMs: 2300 });
  }

  beats.push(
    { id: "spawn-lawson", act: 3, kind: "spawn", refId: "lawson", dwellMs: 1600 },
    { id: "worktree-lawson", act: 3, kind: "worktree", refId: "lawson", dwellMs: 1500 },
    { id: "spawn-viola", act: 3, kind: "spawn", refId: "viola", dwellMs: 1900 },
    { id: "deliver", act: 4, kind: "deliver", refId: "lawson", dwellMs: 1800 },
    { id: "evidence-gate", act: 4, kind: "evidence-gate", refId: "lawson", dwellMs: 1900 },
    { id: "qa-gate", act: 4, kind: "qa-gate", refId: "viola", dwellMs: 2000 },
    { id: "ledger", act: 4, kind: "ledger", dwellMs: 2400 },
  );

  return beats;
}

export type SpecialistPhase = "pending" | "queued" | "running" | "delivered" | "verified";

/** Index of a beat by id, or -1. */
function beatIndex(beats: readonly Beat[], id: string): number {
  return beats.findIndex((b) => b.id === id);
}

/**
 * The phase a specialist is in at `beatIdx`. Lawson runs from his spawn until he
 * delivers; Viola is QUEUED from her spawn (serialized behind the same package)
 * and only starts running when the QA gate opens — so the two never run at once.
 */
export function specialistPhaseAt(
  beats: readonly Beat[],
  specialistId: string,
  beatIdx: number,
): SpecialistPhase {
  if (specialistId === "lawson") {
    const spawn = beatIndex(beats, "spawn-lawson");
    const deliver = beatIndex(beats, "deliver");
    if (spawn < 0 || beatIdx < spawn) return "pending";
    if (beatIdx < deliver) return "running";
    return "delivered";
  }
  if (specialistId === "viola") {
    const spawn = beatIndex(beats, "spawn-viola");
    const qa = beatIndex(beats, "qa-gate");
    const ledger = beatIndex(beats, "ledger");
    if (spawn < 0 || beatIdx < spawn) return "pending";
    if (beatIdx < qa) return "queued";
    if (beatIdx < ledger) return "running";
    return "verified";
  }
  return "pending";
}

/** How many specialists are actually running (consuming a concurrency slot) at `beatIdx`. */
export function runningCountAt(beats: readonly Beat[], specialistIds: string[], beatIdx: number): number {
  return specialistIds.reduce(
    (n, id) => (specialistPhaseAt(beats, id, beatIdx) === "running" ? n + 1 : n),
    0,
  );
}

/** Peak running concurrency across the whole scene — the honest number vs the cap. */
export function peakRunning(beats: readonly Beat[], specialistIds: string[]): number {
  let peak = 0;
  for (let i = 0; i < beats.length; i++) peak = Math.max(peak, runningCountAt(beats, specialistIds, i));
  return peak;
}

export interface Scene {
  demand: typeof DEMAND;
  coordinator: string;
  reasoning: readonly Reasoning[];
  specialists: Specialist[];
  beats: Beat[];
}

export function buildScene(): Scene {
  return {
    demand: DEMAND,
    coordinator: COORDINATOR,
    reasoning: REASONING,
    specialists: buildSpecialists(),
    beats: buildBeats(),
  };
}

/** The exact reject the law returns when the two same-package units share a batch. */
export function sameBatchVerdict(): ReturnType<typeof validateBatch> {
  return validateBatch(SPECIALIST_SEED.map((s) => ({ repo: WORKSPACE, package: s.package })));
}

/** Price a specialist's envelope with the real cost model (for display). */
export function pricedEnvelopeFor(s: Pick<Specialist, "mode" | "intensity" | "harness" | "tier">): PricedEnvelope {
  return priceEnvelope({ mode: s.mode, intensity: s.intensity, harness: s.harness, tier: s.tier });
}
