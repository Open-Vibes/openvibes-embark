/**
 * The Flow — the pure, framework-free model the ambient scene is built from.
 *
 * Like the console's `consoleScript`/`sceneModel` split, this module renders
 * nothing and knows nothing about the DOM. It holds only DERIVED truth:
 *
 *  - the three units' PARALLELISM comes from the real dispatch law
 *    (`scheduleWaves` + `validateBatch`), never hand-set — three distinct
 *    package keys across two repos land in ONE wave, which is the whole point
 *    of the scene;
 *  - the ambient PHASES and their dwell, and the pure FOLD from a phase index
 *    to a cumulative `FlowState` the presentational components read.
 *
 * The material is three real units of this workspace: two packages in
 * `openvibes-embark` (aipe-site, embark-site) and one in `agentistics` (web).
 * Same repo, DIFFERENT packages, still parallel — and a third repo — so the
 * scene shows what the console (two same-package specialists, serialized)
 * deliberately cannot: cross-repo, cross-package work moving at once.
 */

import {
  scheduleWaves,
  validateBatch,
  type DispatchUnit,
  type LawResult,
  type Wave,
} from "../../../domain/dispatchLaw";
import type { HarnessId } from "../../../domain/harness";
import type { LedgerStatus } from "../../../domain/states";

export const FLOW_JOURNEY = "j-20260830-f2";
export const FLOW_COORDINATOR = "Heisenberg";
export const FLOW_PR_BASE = 41;

/* --------------------------------------------------------------- the agents */

interface FlowSeed {
  id: string;
  persona: string;
  role: string;
  repo: string;
  package: string;
  sessionId: string;
}

/**
 * Three units, two repos. Distinct package keys, so the law runs them in
 * parallel — this seed is the single source the scene and its tests share.
 */
const FLOW_SEED: readonly FlowSeed[] = [
  { id: "lawson", persona: "Lawson", role: "dev-fullstack", repo: "openvibes-embark", package: "aipe-site", sessionId: "7f3ac9d1" },
  { id: "marco", persona: "Marco", role: "dev-fullstack", repo: "openvibes-embark", package: "embark-site", sessionId: "a1c8e5b2" },
  { id: "jane", persona: "Jane", role: "dev-fullstack", repo: "agentistics", package: "web", sessionId: "3d9f0417" },
] as const;

const HARNESS: HarnessId = "claude-code";

/** The three units as the law sees them (session mode, containable harness). */
export function flowUnits(): DispatchUnit[] {
  return FLOW_SEED.map((s) => ({
    repo: s.repo,
    package: s.package,
    mode: "session" as const,
    harness: HARNESS,
  }));
}

export interface FlowAgentFact {
  id: string;
  persona: string;
  role: string;
  repo: string;
  package: string;
  fqid: string;
  worktree: string;
  sessionId: string;
  harness: HarnessId;
  /** Assigned by the real law (`scheduleWaves`); all three share wave 0. */
  wave: number;
  /** The PR number this unit delivers (derived, stable). */
  pr: number;
}

/** The wave the i-th listed unit landed in, per the real schedule. */
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

export interface FlowFacts {
  coordinator: string;
  journey: string;
  units: DispatchUnit[];
  /** The law's verdict on dispatching all three in one batch. */
  verdict: LawResult;
  /** The lawful waves — one wave, because the three keys are distinct. */
  waves: Wave[];
  agents: FlowAgentFact[];
  /** Distinct repos, in first-seen order. */
  repos: string[];
}

/** Assemble every derived fact the scene needs — all through the real law. */
export function buildFlowFacts(): FlowFacts {
  const units = flowUnits();
  const waves = scheduleWaves(units);
  const verdict = validateBatch(units);
  const repos: string[] = [];
  for (const s of FLOW_SEED) if (!repos.includes(s.repo)) repos.push(s.repo);

  const agents: FlowAgentFact[] = FLOW_SEED.map((s, i) => ({
    id: s.id,
    persona: s.persona,
    role: s.role,
    repo: s.repo,
    package: s.package,
    fqid: `${s.repo}/${s.package}--${s.id}`,
    worktree: `${s.repo}/.worktrees/${FLOW_JOURNEY}-${s.package}--${s.id}`,
    sessionId: s.sessionId,
    harness: HARNESS,
    wave: waveIndexOfUnit(waves, i),
    pr: FLOW_PR_BASE + i,
  }));

  return { coordinator: FLOW_COORDINATOR, journey: FLOW_JOURNEY, units, verdict, waves, agents, repos };
}

/* --------------------------------------------------------------- the phases */

/**
 * The ambient cycle — a complete arc, not a jittery restart. It plays through
 * once, holds on `merged` (the settled, complete frame), then the orchestrator
 * fades and loops back to `demand`.
 */
export type FlowPhaseId = "demand" | "validate" | "dispatch" | "work" | "deliver" | "review" | "merged";

export interface FlowPhase {
  id: FlowPhaseId;
  /** Dwell in ms at 1× before the clock advances. */
  ms: number;
}

export const FLOW_PHASES: readonly FlowPhase[] = [
  { id: "demand", ms: 2200 },
  { id: "validate", ms: 2600 },
  { id: "dispatch", ms: 2400 },
  { id: "work", ms: 3800 }, // the longest beat — parallel work is the message
  { id: "deliver", ms: 2600 },
  { id: "review", ms: 2600 },
  { id: "merged", ms: 3400 }, // the settled hold before the fade-reset
] as const;

export const FLOW_PHASE_IDS: readonly FlowPhaseId[] = FLOW_PHASES.map((p) => p.id);
export const FLOW_LAST_PHASE = FLOW_PHASES.length - 1;

/** The order a phase reaches, for cumulative reveals. */
function phaseOrder(id: FlowPhaseId): number {
  return FLOW_PHASE_IDS.indexOf(id);
}

/* ---------------------------------------------------------------- the terminal */

export type FlowLineTone = "prompt" | "ok" | "info" | "delivered" | "verified" | "merged" | "work";

/** One line in the flow terminal. Commands/output are literal English (see boundary rule). */
export interface FlowLine {
  /** Which phase prints it (revealed when the clock is at or past this phase). */
  phase: FlowPhaseId;
  tone: FlowLineTone;
  text: string;
}

/**
 * The localised narration the terminal speaks. Everything else the terminal
 * prints is a literal `aipe` command or machine output and stays English in
 * every locale — the same command/speech boundary the console holds. Only these
 * two clauses are prose, so only these translate.
 */
export interface FlowScript {
  /** The PE's spoken demand. */
  demand: string;
  /** The clause that says review comes after the work, not before. */
  reviewAfter: string;
}

export const FLOW_SCRIPT_KEYS = ["demand", "reviewAfter"] as const;
export type FlowScriptKey = (typeof FLOW_SCRIPT_KEYS)[number];

export const FLOW_SCRIPT_EN: FlowScript = {
  demand: "ship three units across two repos — and show them run at once",
  reviewAfter: "review lands after the work, never before",
};

/**
 * Build the full terminal transcript for the given facts and narration. `phase`
 * on each line lets the fold reveal only what has happened by the current beat.
 */
export function buildFlowTerminal(facts: FlowFacts = buildFlowFacts(), script: FlowScript = FLOW_SCRIPT_EN): FlowLine[] {
  const [lawson, marco, jane] = facts.agents;
  if (!lawson || !marco || !jane) return [];
  const ids = facts.agents.map((a) => a.id).join(",");

  return [
    { phase: "demand", tone: "prompt", text: script.demand },

    { phase: "validate", tone: "info", text: `$ aipe dispatch validate --batch ${ids}` },
    {
      phase: "validate",
      tone: "ok",
      text: `OK parallel · ${facts.agents.length} units · ${facts.repos.length} repos · wave ${facts.waves.length}`,
    },

    { phase: "dispatch", tone: "info", text: `$ aipe session dispatch --journey ${facts.journey}` },
    { phase: "dispatch", tone: "ok", text: `OK ${lawson.fqid} → running` },
    { phase: "dispatch", tone: "ok", text: `OK ${marco.fqid} → running` },
    { phase: "dispatch", tone: "ok", text: `OK ${jane.fqid} → running` },

    { phase: "work", tone: "work", text: `~ ${lawson.id.padEnd(6)} red → green · tsc clean` },
    { phase: "work", tone: "work", text: `~ ${marco.id.padEnd(6)} building · vite + three` },
    { phase: "work", tone: "work", text: `~ ${jane.id.padEnd(6)} red → green · 12 tests` },

    { phase: "deliver", tone: "delivered", text: `▽ delivered  ${lawson.package}--${lawson.id}  #${lawson.pr}  evidence: bun test` },
    { phase: "deliver", tone: "delivered", text: `▽ delivered  ${marco.package}--${marco.id}  #${marco.pr}  evidence: bun test` },
    { phase: "deliver", tone: "delivered", text: `▽ delivered  ${jane.package}--${jane.id}  #${jane.pr}  evidence: playwright` },

    { phase: "review", tone: "info", text: `$ aipe journey record --status verified --by qa   # ${script.reviewAfter}` },
    { phase: "review", tone: "verified", text: `✓ verified  ×${facts.agents.length}` },

    { phase: "merged", tone: "merged", text: `⬢ merged  ×${facts.agents.length} · immutable` },
  ];
}

/* ------------------------------------------------------------------ the fold */

export type AgentPhase = "idle" | "placed" | "running" | "delivered" | "verified" | "merged";

export interface FlowAgentState {
  id: string;
  persona: string;
  role: string;
  repo: string;
  package: string;
  fqid: string;
  pr: number;
  wave: number;
  worktree: boolean;
  state: AgentPhase;
}

export interface FlowRepoGroup {
  repo: string;
  agents: FlowAgentState[];
}

export interface FlowState {
  phase: FlowPhaseId;
  coordinator: boolean;
  /** The law verdict is on screen (the "OK parallel" moment). */
  validated: boolean;
  verdict: { ok: boolean; batch: number; repos: number };
  /** Agents grouped by repo, in first-seen repo order. */
  groups: FlowRepoGroup[];
  /** Aggregate ledger stations lit, in lifecycle order. */
  ledger: LedgerStatus[];
  /** true on the final phase — the settled, complete frame. */
  settled: boolean;
  captionKey: FlowPhaseId;
}

const AGENT_STATE_AT: Record<FlowPhaseId, AgentPhase> = {
  demand: "idle",
  validate: "placed",
  dispatch: "running",
  work: "running",
  deliver: "delivered",
  review: "verified",
  merged: "merged",
};

/** Which ledger stations are lit by the time the clock reaches `phase`. */
function ledgerAt(phase: FlowPhaseId): LedgerStatus[] {
  const order = phaseOrder(phase);
  const lit: LedgerStatus[] = [];
  if (order >= phaseOrder("dispatch")) lit.push("dispatched");
  if (order >= phaseOrder("deliver")) lit.push("delivered");
  if (order >= phaseOrder("review")) lit.push("verified");
  if (order >= phaseOrder("merged")) lit.push("merged");
  return lit;
}

/**
 * Fold a phase index into the cumulative scene. Pure: the components render
 * whatever this returns, so the reduced-motion still frame is just the fold at
 * the last phase, and every beat is a re-fold. `verdict` is derived from the
 * real law so the "OK parallel" the scene shows is the law's actual answer.
 */
export function foldFlow(phaseIndex: number, facts: FlowFacts = buildFlowFacts()): FlowState {
  const clamped = Math.max(0, Math.min(phaseIndex, FLOW_LAST_PHASE));
  const phase = FLOW_PHASE_IDS[clamped]!;
  const order = phaseOrder(phase);
  const agentState = AGENT_STATE_AT[phase];

  const groups: FlowRepoGroup[] = facts.repos.map((repo) => ({
    repo,
    agents: facts.agents
      .filter((a) => a.repo === repo)
      .map((a) => ({
        id: a.id,
        persona: a.persona,
        role: a.role,
        repo: a.repo,
        package: a.package,
        fqid: a.fqid,
        pr: a.pr,
        wave: a.wave,
        worktree: order >= phaseOrder("dispatch"),
        // Agents don't exist on screen until the law has placed them.
        state: order >= phaseOrder("validate") ? agentState : "idle",
      })),
  }));

  return {
    phase,
    coordinator: true,
    validated: order >= phaseOrder("validate"),
    verdict: {
      ok: facts.verdict.ok,
      batch: facts.verdict.ok ? facts.verdict.batch : 0,
      repos: facts.repos.length,
    },
    groups,
    ledger: ledgerAt(phase),
    settled: clamped >= FLOW_LAST_PHASE,
    captionKey: phase,
  };
}
