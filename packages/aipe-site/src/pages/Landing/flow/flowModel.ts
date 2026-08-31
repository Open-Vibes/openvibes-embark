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
 *  - QA is derived PER REPO from that same law output (`FlowFacts.repos`),
 *    never a fixed headcount — two repos means two QA reviewers, one each,
 *    because that is the real rule ("QA is per repo");
 *  - each actor's harness+tier ENVELOPE comes from the real containment
 *    registry (`domain/harness.ts`) crossed with the tiers actually offered
 *    (`domain/envelope.ts`), never a literal per-agent string;
 *  - the ambient PHASES and their dwell, and the pure FOLD from a phase index
 *    to a cumulative `FlowState` the presentational components read.
 *
 * v4 (j-20260830-58): the PE's end-to-end read of the AIPe method — dispatch,
 * parallel work, a PR into `dev`, a QA gate PER REPO, a REJECTION that sends
 * the SAME dev back to fix on the SAME branch (the QA that rejected never
 * fixes), approval, a merge into `dev`, and a SEPARATE promotion PR from
 * `dev` to `main` that merges and closes the ledger. `FlowState.entityCount`
 * keeps proving the progression (see v3's note below); this version adds
 * growth beats for the QA team, the dev PRs, and the promotion PRs.
 *
 * v3's note, preserved: the PE's rejection of v2 ("deixou so 3 caras fixos
 * ali") means the fold is not a panel that switches labels on ever-present
 * rows. Each agent, then each QA, then each PR is a NEW element that ENTERS
 * the scene at its own beat.
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
import { HARNESS_IDS, isSessionEligible, type HarnessId } from "../../../domain/harness";
import type { ModelTier } from "../../../domain/envelope";
import type { LedgerStatus } from "../../../domain/states";

export const FLOW_JOURNEY = "j-20260830-f2";
export const FLOW_COORDINATOR = "Heisenberg";
export const FLOW_PR_BASE = 41;
export const FLOW_PROMOTION_PR_BASE = 141;
/** The one unit whose PR the QA rejects, to make the correction loop real. */
export const FLOW_REJECTED_AGENT_ID = "marco";

/* ------------------------------------------------------------ the envelope */

/**
 * The tiers actually offered at dispatch time. `frontier` exists in
 * `domain/envelope.ts` but `DEFAULT_POLICY.gatedTiers` gates it behind the
 * PE's signature — it is not an ambient, unattended assignment, so it is
 * excluded here the same way the policy excludes it from ordinary dispatch.
 */
export const FLOW_TIERS: readonly ModelTier[] = ["fast", "standard", "reasoning"];

export interface ActorEnvelope {
  harness: HarnessId;
  tier: ModelTier;
}

/**
 * The cross-product of session-eligible harnesses (`isSessionEligible`, from
 * the REAL containment registry) and the offered tiers. Never a literal list:
 * if `domain/harness.ts` gained a third containable harness, this pool would
 * grow with it, and so would every scene built from it.
 */
export function envelopePool(
  harnesses: readonly HarnessId[] = HARNESS_IDS.filter(isSessionEligible),
  tiers: readonly ModelTier[] = FLOW_TIERS,
): ActorEnvelope[] {
  const pool: ActorEnvelope[] = [];
  for (const tier of tiers) {
    for (const harness of harnesses) pool.push({ harness, tier });
  }
  return pool;
}

/** Assigns actor `index` a distinct envelope, cycling the real pool. */
export function envelopeForActor(index: number, pool: readonly ActorEnvelope[] = envelopePool()): ActorEnvelope {
  if (pool.length === 0) throw new Error("envelopePool must not be empty");
  return pool[index % pool.length]!;
}

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
 * Listed order is also DISPATCH order: index i joins at `dispatch-${i + 1}`.
 */
const FLOW_SEED: readonly FlowSeed[] = [
  { id: "lawson", persona: "Lawson", role: "dev-fullstack", repo: "openvibes-embark", package: "aipe-site", sessionId: "7f3ac9d1" },
  { id: "marco", persona: "Marco", role: "dev-fullstack", repo: "openvibes-embark", package: "embark-site", sessionId: "a1c8e5b2" },
  { id: "jane", persona: "Jane", role: "dev-fullstack", repo: "agentistics", package: "web", sessionId: "3d9f0417" },
] as const;

const HARNESS: HarnessId = "claude-code";

/** The units as the law sees them (session mode, containable harness). */
export function flowUnits(seed: readonly FlowSeed[] = FLOW_SEED): DispatchUnit[] {
  return seed.map((s) => ({
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
  envelope: ActorEnvelope;
  /** Assigned by the real law (`scheduleWaves`); all three share wave 0. */
  wave: number;
  /** The PR number this unit opens against `dev` (derived, stable). */
  pr: number;
  /** The phase at which this agent enters the scene (its own dispatch beat). */
  joinPhase: FlowPhaseId;
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

/* ----------------------------------------------------------------- the QAs */

/**
 * Real specialist names from this workspace's QA roster, reused as flavour —
 * the COUNT and the repo assignment are what must be derived; the persona
 * label is cosmetic. One QA per distinct repo, in first-seen repo order.
 */
const QA_PERSONA_POOL = ["Viola", "Cliff", "Domingo", "Hector", "Jack", "Kenny", "Leonel", "Rich"] as const;

export interface FlowQaFact {
  id: string;
  persona: string;
  role: string;
  repo: string;
  envelope: ActorEnvelope;
}

/**
 * One QA per repo — derived from the repo list itself, not a fixed headcount.
 * Change the number of distinct repos in the input and this list's length
 * changes with it; nothing here hard-codes "2".
 */
export function deriveQaTeam(repos: readonly string[], envelopeOffset: number = 0): FlowQaFact[] {
  return repos.map((repo, i) => ({
    id: `qa-${i}`,
    persona: QA_PERSONA_POOL[i % QA_PERSONA_POOL.length]!,
    role: "qa",
    repo,
    envelope: envelopeForActor(envelopeOffset + i),
  }));
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
  /** One QA per distinct repo, derived from `repos`. */
  qaTeam: FlowQaFact[];
  /** Distinct repos, in first-seen order. */
  repos: string[];
  /** The one agent whose PR is rejected once, or null if not present in this seed. */
  rejectedAgentId: string | null;
  /** One dev→main promotion PR number per repo, in `repos` order. */
  promotionPr: Record<string, number>;
}

/** Which per-agent dispatch beat each listed unit joins on (index-matched to FLOW_SEED). */
const AGENT_JOIN_PHASE: readonly FlowPhaseId[] = ["dispatch-1", "dispatch-2", "dispatch-3"];

/** Assemble every derived fact the scene needs — all through the real law. */
export function buildFlowFacts(seed: readonly FlowSeed[] = FLOW_SEED): FlowFacts {
  const units = flowUnits(seed);
  const waves = scheduleWaves(units);
  const verdict = validateBatch(units);
  const repos: string[] = [];
  for (const s of seed) if (!repos.includes(s.repo)) repos.push(s.repo);

  const agents: FlowAgentFact[] = seed.map((s, i) => ({
    id: s.id,
    persona: s.persona,
    role: s.role,
    repo: s.repo,
    package: s.package,
    fqid: `${s.repo}/${s.package}--${s.id}`,
    worktree: `${s.repo}/.worktrees/${FLOW_JOURNEY}-${s.package}--${s.id}`,
    sessionId: s.sessionId,
    harness: HARNESS,
    envelope: envelopeForActor(i),
    wave: waveIndexOfUnit(waves, i),
    pr: FLOW_PR_BASE + i,
    joinPhase: AGENT_JOIN_PHASE[i] ?? "dispatch-3",
  }));

  const qaTeam = deriveQaTeam(repos, agents.length);
  const rejectedAgentId = agents.some((a) => a.id === FLOW_REJECTED_AGENT_ID) ? FLOW_REJECTED_AGENT_ID : null;
  const promotionPr: Record<string, number> = {};
  repos.forEach((repo, i) => {
    promotionPr[repo] = FLOW_PROMOTION_PR_BASE + i;
  });

  return { coordinator: FLOW_COORDINATOR, journey: FLOW_JOURNEY, units, verdict, waves, agents, qaTeam, repos, rejectedAgentId, promotionPr };
}

/* --------------------------------------------------------------- the phases */

/**
 * The ambient cycle — a complete arc, not a jittery restart. Elements ENTER
 * one at a time. It plays through once end to end — dispatch, parallel work,
 * a PR into `dev`, a QA gate per repo, one rejection and its fix, approval, a
 * merge into `dev`, a separate promotion PR into `main`, and the final merge
 * that closes the ledger — holds on `merge-main` (the settled, complete
 * frame), then the orchestrator loops back to `demand` without erasing what
 * was built (see `FlowCarry` / `summarizeCycle`).
 */
export type FlowPhaseId =
  | "demand"
  | "validate"
  | "dispatch-1"
  | "dispatch-2"
  | "dispatch-3"
  | "work"
  | "deliver"
  | "pr-dev"
  | "qa-review"
  | "qa-reject"
  | "dev-fix"
  | "qa-approve"
  | "merge-dev"
  | "promote"
  | "merge-main";

export interface FlowPhase {
  id: FlowPhaseId;
  /** Dwell in ms at 1× before the clock advances. */
  ms: number;
}

export const FLOW_PHASES: readonly FlowPhase[] = [
  { id: "demand", ms: 1700 },
  { id: "validate", ms: 1400 },
  { id: "dispatch-1", ms: 1200 }, // agent 1 enters — repo A
  { id: "dispatch-2", ms: 1200 }, // agent 2 enters — repo A or B
  { id: "dispatch-3", ms: 1200 }, // agent 3 enters — 3 agents, 2 repos, at once
  { id: "work", ms: 2600 }, // parallel work is the message
  { id: "deliver", ms: 1500 },
  { id: "pr-dev", ms: 1500 }, // each agent opens its own PR into dev
  { id: "qa-review", ms: 1600 }, // one QA per repo enters and starts reviewing
  { id: "qa-reject", ms: 1900 }, // one QA rejects — the product's most important beat
  { id: "dev-fix", ms: 1900 }, // the SAME dev fixes it, on the SAME dev branch
  { id: "qa-approve", ms: 1500 }, // QA re-reviews and approves
  { id: "merge-dev", ms: 1400 }, // approved PRs merge into dev
  { id: "promote", ms: 1600 }, // a NEW, separate PR: dev → main
  { id: "merge-main", ms: 3200 }, // the settled hold — merged to main, ledger closes
] as const;

export const FLOW_PHASE_IDS: readonly FlowPhaseId[] = FLOW_PHASES.map((p) => p.id);
export const FLOW_LAST_PHASE = FLOW_PHASES.length - 1;

/** The order a phase reaches, for cumulative reveals. */
function phaseOrder(id: FlowPhaseId): number {
  return FLOW_PHASE_IDS.indexOf(id);
}

/* ---------------------------------------------------------------- the terminal */

export type FlowLineTone = "prompt" | "ok" | "info" | "delivered" | "verified" | "failed" | "merged" | "work";

/** One line in the flow terminal. Commands/output are literal English (see boundary rule). */
export interface FlowLine {
  /** Which phase prints it (revealed when the clock is at or past this phase). */
  phase: FlowPhaseId;
  tone: FlowLineTone;
  text: string;
}

/**
 * The localised narration the terminal speaks. Everything else the terminal
 * prints is a literal `aipe`/`gh` command or machine output and stays English
 * in every locale — the same command/speech boundary the console holds. Only
 * these clauses are prose, so only these translate.
 */
export interface FlowScript {
  /** The PE's spoken demand. */
  demand: string;
  /** The clause that says review comes after the work, not before. */
  reviewAfter: string;
  /** What the QA's rejection actually found. */
  rejectionFinding: string;
}

export const FLOW_SCRIPT_KEYS = ["demand", "reviewAfter", "rejectionFinding"] as const;
export type FlowScriptKey = (typeof FLOW_SCRIPT_KEYS)[number];

export const FLOW_SCRIPT_EN: FlowScript = {
  demand: "ship three units across two repos — and show them run at once",
  reviewAfter: "review lands after the work, never before",
  rejectionFinding: "missing edge case in the wave tie-break",
};

/**
 * Build the full terminal transcript for the given facts and narration. `phase`
 * on each line lets the fold reveal only what has happened by the current beat.
 */
export function buildFlowTerminal(facts: FlowFacts = buildFlowFacts(), script: FlowScript = FLOW_SCRIPT_EN): FlowLine[] {
  const [lawson, marco, jane] = facts.agents;
  if (!lawson || !marco || !jane) return [];
  const ids = facts.agents.map((a) => a.id).join(",");
  const rejected = facts.agents.find((a) => a.id === facts.rejectedAgentId) ?? marco;
  const rejectedQa = facts.qaTeam.find((q) => q.repo === rejected.repo) ?? facts.qaTeam[0];

  const lines: FlowLine[] = [
    { phase: "demand", tone: "prompt", text: script.demand },

    { phase: "validate", tone: "info", text: `$ aipe dispatch validate --batch ${ids}` },
    {
      phase: "validate",
      tone: "ok",
      text: `OK parallel · ${facts.agents.length} units · ${facts.repos.length} repos · wave ${facts.waves.length}`,
    },

    { phase: "dispatch-1", tone: "info", text: `$ aipe session dispatch --unit ${lawson.fqid} --harness ${lawson.envelope.harness} --tier ${lawson.envelope.tier}` },
    { phase: "dispatch-1", tone: "ok", text: `OK ${lawson.fqid} → running` },

    { phase: "dispatch-2", tone: "info", text: `$ aipe session dispatch --unit ${marco.fqid} --harness ${marco.envelope.harness} --tier ${marco.envelope.tier}` },
    { phase: "dispatch-2", tone: "ok", text: `OK ${marco.fqid} → running` },

    { phase: "dispatch-3", tone: "info", text: `$ aipe session dispatch --unit ${jane.fqid} --harness ${jane.envelope.harness} --tier ${jane.envelope.tier}` },
    { phase: "dispatch-3", tone: "ok", text: `OK ${jane.fqid} → running` },

    { phase: "work", tone: "work", text: `~ ${lawson.id.padEnd(6)} red → green · tsc clean` },
    { phase: "work", tone: "work", text: `~ ${marco.id.padEnd(6)} building · vite + three` },
    { phase: "work", tone: "work", text: `~ ${jane.id.padEnd(6)} red → green · 12 tests` },

    { phase: "deliver", tone: "delivered", text: `▽ delivered  ${lawson.package}--${lawson.id}  evidence: bun test` },
    { phase: "deliver", tone: "delivered", text: `▽ delivered  ${marco.package}--${marco.id}  evidence: bun test` },
    { phase: "deliver", tone: "delivered", text: `▽ delivered  ${jane.package}--${jane.id}  evidence: playwright` },
  ];

  for (const a of facts.agents) {
    lines.push({ phase: "pr-dev", tone: "info", text: `$ gh pr create --repo ${a.repo} --base dev` });
    lines.push({ phase: "pr-dev", tone: "ok", text: `+ PR #${a.pr} opened  ${a.package}--${a.id} → dev` });
  }

  for (const qa of facts.qaTeam) {
    lines.push({ phase: "qa-review", tone: "info", text: `$ aipe journey record --repo ${qa.repo} --by ${qa.persona}   # ${script.reviewAfter}` });
    lines.push({ phase: "qa-review", tone: "ok", text: `~ ${qa.persona} reviewing  ${qa.repo}` });
  }

  if (rejectedQa) {
    lines.push({ phase: "qa-reject", tone: "info", text: `$ aipe journey record --status failed --by ${rejectedQa.persona} --unit ${rejected.fqid}` });
    lines.push({ phase: "qa-reject", tone: "failed", text: `✕ failed  ${rejected.fqid}  # ${script.rejectionFinding}` });
  }

  lines.push({ phase: "dev-fix", tone: "work", text: `~ ${rejected.id.padEnd(6)} fixing on dev · red → green` });
  lines.push({ phase: "dev-fix", tone: "info", text: `$ git -C ${rejected.repo} push origin dev` });

  for (const qa of facts.qaTeam) {
    lines.push({ phase: "qa-approve", tone: "info", text: `$ aipe journey record --status verified --repo ${qa.repo} --by ${qa.persona}` });
    lines.push({ phase: "qa-approve", tone: "verified", text: `✓ verified  ${qa.repo} ×${facts.agents.filter((a) => a.repo === qa.repo).length}` });
  }

  for (const a of facts.agents) {
    lines.push({ phase: "merge-dev", tone: "info", text: `$ gh pr merge --repo ${a.repo} ${a.pr}` });
    lines.push({ phase: "merge-dev", tone: "merged", text: `⬢ merged  ${a.package}--${a.id} → dev` });
  }

  for (const repo of facts.repos) {
    lines.push({ phase: "promote", tone: "info", text: `$ gh pr create --repo ${repo} --base main --head dev` });
    lines.push({ phase: "promote", tone: "ok", text: `+ PR #${facts.promotionPr[repo]} opened  ${repo}  dev → main` });
  }

  for (const repo of facts.repos) {
    lines.push({ phase: "merge-main", tone: "info", text: `$ gh pr merge --repo ${repo} ${facts.promotionPr[repo]}` });
    lines.push({ phase: "merge-main", tone: "merged", text: `⬢ merged  ${repo}  dev → main` });
  }
  lines.push({ phase: "merge-main", tone: "merged", text: `⬢ ledger closed  ×${facts.agents.length} · immutable` });

  return lines;
}

/* ------------------------------------------------------------------ the fold */

export type AgentPhase = "idle" | "placed" | "running" | "delivered" | "in-review" | "rejected" | "fixing" | "verified" | "merged";
export type QaVerdict = "reviewing" | "rejected" | "approved";

export interface FlowAgentState {
  id: string;
  persona: string;
  role: string;
  repo: string;
  package: string;
  fqid: string;
  pr: number;
  wave: number;
  envelope: ActorEnvelope;
  worktree: boolean;
  state: AgentPhase;
  /** This agent's dev PR (into `dev`) has entered the scene. */
  prDevVisible: boolean;
  /** That dev PR has merged into `dev` — distinct from, and before, promotion. */
  prDevMerged: boolean;
}

export interface FlowPromotionState {
  number: number;
  visible: boolean;
  merged: boolean;
}

export interface FlowRepoGroup {
  repo: string;
  agents: FlowAgentState[];
  qa: FlowQaVisibleState | null;
  promotion: FlowPromotionState;
}

export interface FlowQaVisibleState {
  persona: string;
  repo: string;
  envelope: ActorEnvelope;
  verdict: QaVerdict;
}

/** What the previous cycle finished with — carried into the next cycle's open. */
export interface FlowCarry {
  merged: number;
  repos: number;
}

export interface FlowState {
  phase: FlowPhaseId;
  coordinator: boolean;
  /** The law verdict is on screen (the "OK parallel" moment). */
  validated: boolean;
  verdict: { ok: boolean; batch: number; repos: number };
  /** Agents grouped by repo, in first-seen repo order. A repo is omitted until it has a visible agent. */
  groups: FlowRepoGroup[];
  /** Aggregate ledger stations lit, in lifecycle order. */
  ledger: LedgerStatus[];
  /** true on the final phase — the settled, complete frame. */
  settled: boolean;
  captionKey: FlowPhaseId;
  /**
   * Total actors + artifacts on screen at this phase (visible agents + QAs +
   * revealed dev PRs + revealed promotion PRs). Must strictly grow at several
   * distinct phases — that growth IS the progression the PE asked for.
   */
  entityCount: number;
  /** What the previous cycle closed with, or null on this run's first-ever cycle. */
  previousCycle: FlowCarry | null;
}

/** The agent's badge state once it has joined the scene, by phase and rejection branch. */
function agentStateAt(agent: FlowAgentFact, order: number, rejectedAgentId: string | null): AgentPhase {
  const o = phaseOrder;
  if (order < o(agent.joinPhase)) return "idle";
  if (order < o("work")) return "placed";
  if (order < o("deliver")) return "running";
  if (order < o("qa-review")) return "delivered";
  if (order < o("qa-reject")) return "in-review";
  if (agent.id === rejectedAgentId && order === o("qa-reject")) return "rejected";
  if (agent.id === rejectedAgentId && order === o("dev-fix")) return "fixing";
  if (order < o("merge-main")) return "verified";
  return "merged";
}

/** The per-repo QA's verdict — independent repos approve independently. */
function qaVerdictAt(repoHasRejection: boolean, order: number): QaVerdict {
  const o = phaseOrder;
  if (order <= o("qa-review")) return "reviewing";
  if (repoHasRejection) return order < o("qa-approve") ? "rejected" : "approved";
  return "approved";
}

/** Which ledger stations are lit by the time the clock reaches `phase`. */
function ledgerAt(order: number): LedgerStatus[] {
  const o = phaseOrder;
  const lit: LedgerStatus[] = [];
  if (order >= o("dispatch-1")) lit.push("dispatched");
  if (order >= o("deliver")) lit.push("delivered");
  if (order >= o("qa-approve")) lit.push("verified");
  if (order >= o("merge-main")) lit.push("merged");
  return lit;
}

/**
 * Summarize a folded (ideally settled) state into what the NEXT cycle should
 * carry forward, so the loop's next opening is provably not a total wipe.
 */
export function summarizeCycle(state: FlowState): FlowCarry {
  const merged = state.groups.reduce((n, g) => n + g.agents.filter((a) => a.state === "merged").length, 0);
  return { merged, repos: state.groups.length };
}

/**
 * Fold a phase index into the cumulative scene. Pure: the components render
 * whatever this returns, so the reduced-motion still frame is just the fold at
 * the last phase, and every beat is a re-fold. An agent/QA/PR/promotion is
 * absent — not merely dimmed — until the clock reaches its own beat.
 *
 * `carry` is the previous cycle's `summarizeCycle` output (or null on the
 * very first cycle): it rides in `FlowState.previousCycle` so the SCENE can
 * show what just finished even while this cycle's own stage starts empty —
 * the "no reset seco" fix. It does not affect any of the DERIVED law facts.
 */
export function foldFlow(phaseIndex: number, facts: FlowFacts = buildFlowFacts(), carry: FlowCarry | null = null): FlowState {
  const clamped = Math.max(0, Math.min(phaseIndex, FLOW_LAST_PHASE));
  const phase = FLOW_PHASE_IDS[clamped]!;
  const order = phaseOrder(phase);
  const prDevOrder = phaseOrder("pr-dev");
  const mergeDevOrder = phaseOrder("merge-dev");
  const promoteOrder = phaseOrder("promote");
  const mergeMainOrder = phaseOrder("merge-main");

  const groups: FlowRepoGroup[] = [];
  for (const repo of facts.repos) {
    const agents: FlowAgentState[] = facts.agents
      .filter((a) => a.repo === repo && order >= phaseOrder(a.joinPhase))
      .map((a) => ({
        id: a.id,
        persona: a.persona,
        role: a.role,
        repo: a.repo,
        package: a.package,
        fqid: a.fqid,
        pr: a.pr,
        wave: a.wave,
        envelope: a.envelope,
        worktree: true,
        state: agentStateAt(a, order, facts.rejectedAgentId),
        prDevVisible: order >= prDevOrder,
        prDevMerged: order >= mergeDevOrder,
      }));
    if (agents.length === 0) continue;

    const qaFact = facts.qaTeam.find((q) => q.repo === repo) ?? null;
    const qaVisible = qaFact !== null && order >= phaseOrder("qa-review");
    const qa: FlowQaVisibleState | null = qaVisible
      ? {
          persona: qaFact!.persona,
          repo: qaFact!.repo,
          envelope: qaFact!.envelope,
          verdict: qaVerdictAt(repo === facts.agents.find((a) => a.id === facts.rejectedAgentId)?.repo, order),
        }
      : null;

    groups.push({
      repo,
      agents,
      qa,
      promotion: {
        number: facts.promotionPr[repo] ?? 0,
        visible: order >= promoteOrder,
        merged: order >= mergeMainOrder,
      },
    });
  }

  const visibleAgents = groups.reduce((n, g) => n + g.agents.length, 0);
  const visibleQas = groups.reduce((n, g) => n + (g.qa ? 1 : 0), 0);
  const visibleDevPrs = groups.reduce((n, g) => n + g.agents.filter((a) => a.prDevVisible).length, 0);
  const visiblePromotions = groups.reduce((n, g) => n + (g.promotion.visible ? 1 : 0), 0);

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
    ledger: ledgerAt(order),
    settled: clamped >= FLOW_LAST_PHASE,
    captionKey: phase,
    entityCount: visibleAgents + visibleQas + visibleDevPrs + visiblePromotions,
    previousCycle: carry,
  };
}
