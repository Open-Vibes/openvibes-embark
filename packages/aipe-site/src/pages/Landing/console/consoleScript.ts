/**
 * Console — the pure, framework-free FACTS the hero scene is built from.
 *
 * This module holds only DERIVED domain truth; it renders nothing and knows
 * nothing about the terminal or the stage. Everything here comes from the proven
 * domain layer, never hand-set:
 *  - the specialists' waves from the real `scheduleWaves` (same package →
 *    serialize into consecutive waves);
 *  - the batch verdict from the real `validateBatch`;
 *  - the envelope cost-index + GATED marker from the real `priceEnvelope`;
 *  - the skill routing from the real `matchSkills`;
 *  - the evidence gate and QA gate from the real ledger `evaluateAttempt`.
 *
 * The material is this site's own creation journey (j-20260825-s2): the demand
 * that made it, the coordinator (Heisenberg), and the two real specialists —
 * Lawson (dev-fullstack) and Viola (QA), both on `openvibes-embark/aipe-site`,
 * which is exactly why the law serializes them.
 *
 * The presentation is built on top of these facts by two INDEPENDENT components
 * (`Terminal`, `Stage`) joined by the coordination layer in `sceneModel.ts` — a
 * shared step index and an ordered beat stream. This module is imported by that
 * layer, never by the components' internals.
 */

import {
  scheduleWaves,
  validateBatch,
  type DispatchUnit,
  type Wave,
} from "../../../domain/dispatchLaw";
import {
  priceEnvelope,
  type Intensity,
  type ModelTier,
  type PricedEnvelope,
} from "../../../domain/envelope";
import type { HarnessId } from "../../../domain/harness";
import { evaluateAttempt } from "../../../domain/ledger";
import { matchSummary, type SkillMatchTask } from "../../../domain/skillMatch";

export const JOURNEY = "j-20260825-s2";
export const WORKSPACE = "openvibes-embark";
export const REPO = "openvibes-embark";
export const PACKAGE = "aipe-site";
export const COORDINATOR = "Heisenberg";
export const PR_NUMBER = 15;

/** The largest producing unit's task shape, for the skill-match routing step. */
export const AIPE_UNIT_TASK: SkillMatchTask = { taskType: "frontend", size: "large" };

/** The PE's demand, in a Product Engineer's own voice (not a label). */
export const DEMAND = {
  author: "PE",
  text:
    "We need the public site for AIPe — a package in openvibes-embark. Make it genuinely " +
    "good, and make it SHOW multi-agent, multi-harness work instead of describing it.",
} as const;

/* --------------------------------------------------------------- specialists */

export interface ConsoleSpecialist {
  id: string;
  persona: string;
  role: string;
  repo: string;
  package: string;
  fqid: string;
  worktree: string;
  sessionId: string;
  harness: HarnessId;
  mode: "session";
  tier: ModelTier;
  intensity: Intensity;
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
    sessionId: "7f3ac9d1",
    tier: "reasoning" as ModelTier,
    intensity: "ultracode" as Intensity,
  },
  {
    id: "viola",
    persona: "Viola",
    role: "QA",
    sessionId: "b2e610af",
    tier: "reasoning" as ModelTier,
    intensity: "normal" as Intensity,
  },
] as const;

/** The two dispatch units — same package, so the law serializes them. */
function specialistUnits(): DispatchUnit[] {
  return SPECIALIST_SEED.map(() => ({
    repo: REPO,
    package: PACKAGE,
    mode: "session" as const,
    harness: "claude-code" as HarnessId,
  }));
}

/** The waves the real law assigns to the two same-package units. */
export function consoleWaves(): Wave[] {
  return scheduleWaves(specialistUnits());
}

/** The exact reject the law returns when both same-package units share a batch. */
export function sameBatchVerdict(): ReturnType<typeof validateBatch> {
  return validateBatch(SPECIALIST_SEED.map(() => ({ repo: REPO, package: PACKAGE })));
}

/** The wave the i-th listed unit landed in (same-package units land in order). */
function waveIndexOfUnit(waves: Wave[], listIndex: number): number {
  let seen = 0;
  for (const wave of waves) {
    for (let k = 0; k < wave.units.length; k++) {
      if (seen === listIndex) return wave.index;
      seen++;
    }
  }
  return 0;
}

export function buildConsoleSpecialists(): ConsoleSpecialist[] {
  const waves = consoleWaves();
  return SPECIALIST_SEED.map((s, i) => ({
    id: s.id,
    persona: s.persona,
    role: s.role,
    repo: REPO,
    package: PACKAGE,
    fqid: `${REPO}/${PACKAGE}--${s.id}`,
    worktree: `${WORKSPACE}/.worktrees/${JOURNEY}-${PACKAGE}--${s.id}`,
    sessionId: s.sessionId,
    harness: "claude-code",
    mode: "session",
    tier: s.tier,
    intensity: s.intensity,
    wave: waveIndexOfUnit(waves, i),
    envelope: priceEnvelope({ mode: "session", intensity: s.intensity, harness: "claude-code", tier: s.tier }),
  }));
}

/* ---------------------------------------------------------------- the ledger */

/** The ledger's verdict on a `delivered` write that carries no evidence. */
export function evidenceGateOutcome() {
  return evaluateAttempt("dispatched", { status: "delivered" });
}

/** The ledger's verdict on a `merged` write attempted before verification. */
export function qaGateOutcome() {
  return evaluateAttempt("delivered", { status: "merged" });
}

/* ------------------------------------------------------ terminal line shapes */

export type LineTone = "ok" | "reject" | "gated" | "info" | "queued" | "muted";

/** One line in the terminal pane. Command/output lines are real, and stay English. */
export interface LeftLine {
  kind: "prompt" | "reply" | "command" | "output";
  text: string;
  tone?: LineTone;
}

/* ------------------------------------------------------------------- the facts */

export interface ConsoleFacts {
  demand: typeof DEMAND;
  coordinator: string;
  journey: string;
  prNumber: number;
  task: SkillMatchTask;
  specialists: ConsoleSpecialist[];
  skill: ReturnType<typeof matchSummary>;
  waves: Wave[];
  law: ReturnType<typeof sameBatchVerdict>;
  evidenceGate: ReturnType<typeof evidenceGateOutcome>;
  qaGate: ReturnType<typeof qaGateOutcome>;
}

/** Assemble every derived fact the scene needs, in one place. */
export function buildFacts(): ConsoleFacts {
  return {
    demand: DEMAND,
    coordinator: COORDINATOR,
    journey: JOURNEY,
    prNumber: PR_NUMBER,
    task: AIPE_UNIT_TASK,
    specialists: buildConsoleSpecialists(),
    skill: matchSummary(AIPE_UNIT_TASK),
    waves: consoleWaves(),
    law: sameBatchVerdict(),
    evidenceGate: evidenceGateOutcome(),
    qaGate: qaGateOutcome(),
  };
}
