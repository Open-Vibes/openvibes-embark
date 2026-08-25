/**
 * The Console Split — the pure, framework-free model the scene plays.
 *
 * Two synchronised panes: a real TERMINAL on the left (the PE's demand, the
 * coordinator's reply, and real `aipe`/`agentop` commands with their real output
 * shapes) and, on the right, the MEANING of each line (the decision it causes).
 * The binding is 1:1: `step.id === step.meaning.id`, so hovering or stepping one
 * pane can highlight its partner in the other — the two-way trace that is the
 * whole point.
 *
 * Everything on the right is DERIVED, never hand-set:
 *  - the specialists' waves come from the real `scheduleWaves` (same package →
 *    serialize into consecutive waves);
 *  - the batch verdict comes from the real `validateBatch`;
 *  - the envelope cost-index + GATED marker come from the real `priceEnvelope`;
 *  - the skill routing comes from the real `matchSkills`;
 *  - the evidence gate and QA gate come from the real ledger `evaluateAttempt`.
 *
 * The material is this site's own creation journey (j-20260825-s2): the demand
 * that made it, the coordinator (Heisenberg), and the two real specialists —
 * Lawson (dev-fullstack) and Viola (QA), both on `openvibes-embark/aipe-site`,
 * which is exactly why the law serializes them. That is why this file is
 * unit-tested.
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
import type { LedgerStatus } from "../../../domain/states";
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

/* ------------------------------------------------------------------ the flow */

export type LineTone = "ok" | "reject" | "gated" | "info" | "queued" | "muted";

export interface LeftLine {
  kind: "prompt" | "reply" | "command" | "output";
  text: string;
  tone?: LineTone;
}

export interface TerminalStep {
  lines: LeftLine[];
}

export type MeaningKind =
  | "demand"
  | "journey"
  | "decompose"
  | "skill-match"
  | "envelope"
  | "law"
  | "worktree"
  | "dispatch"
  | "deliver"
  | "evidence-gate"
  | "qa-gate"
  | "merged"
  | "verify";

export interface Meaning {
  id: string;
  kind: MeaningKind;
  /** Short title of the decision this line causes. */
  title: string;
  /** Plain-language explanation, assuming NO prior AIPe vocabulary. */
  plain: string;
  /** The ledger status this step advances the unit to (for the state ramp). */
  status?: LedgerStatus;
}

export interface Step {
  id: string;
  terminal: TerminalStep;
  meaning: Meaning;
}

/** A step whose meaning shares its id — the binding is 1:1 by construction. */
function step(
  id: string,
  meaning: Omit<Meaning, "id">,
  lines: LeftLine[],
): Step {
  return { id, terminal: { lines }, meaning: { id, ...meaning } };
}

export function buildSteps(): Step[] {
  const [lawson, viola] = buildConsoleSpecialists();
  if (!lawson || !viola) return [];

  const law = sameBatchVerdict();
  const lawReason = law.ok ? "" : law.reason;
  const skill = matchSummary(AIPE_UNIT_TASK);
  const env = lawson.envelope;

  return [
    step(
      "demand",
      {
        kind: "demand",
        title: "The whole input is one sentence",
        plain:
          "A Product Engineer hands over a demand in plain words. That is the entire input. Everything on this side is the coordinator turning it into dispatched, recorded work — no one writes tickets or wires up agents by hand.",
      },
      [{ kind: "prompt", text: DEMAND.text, tone: "info" }],
    ),

    step(
      "journey",
      {
        kind: "journey",
        title: "One demand → one journey",
        plain:
          "The demand opens a journey: a durable ledger that will record every step from here to a merged PR. Nothing has been dispatched yet — this is just the record being opened.",
      },
      [
        { kind: "command", text: `aipe journey start --demand "aipe public site"` },
        { kind: "output", text: `JOURNEY ${JOURNEY}  ·  1 demand → 1 ledger`, tone: "ok" },
      ],
    ),

    step(
      "decompose",
      {
        kind: "decompose",
        title: "One unit of work, and its reliability floor",
        plain:
          "The coordinator reads how the repos relate. aipe-site is a brand-new node — nothing else depends on it and it depends on nothing — so there is exactly one unit of work. The floor for any unit is two people: one dev to build it and one independent QA to check it.",
      },
      [
        {
          kind: "reply",
          text: `⎇ ${COORDINATOR} › one producing unit: ${REPO}/${PACKAGE} (0 edges). floor = 1 dev + 1 QA.`,
          tone: "info",
        },
      ],
    ),

    step(
      "skill-match",
      {
        kind: "skill-match",
        title: "Which method fits — and which is overkill",
        plain:
          "Before building, the coordinator asks which framework fits the work. sdd-lite — a short spec plus a plan — is the always-on floor. The heavy spec-driven kits are declined here: a UI-dominant site isn't what they're for. The same rule keeps a heavy kit off a one-line change; it is routed mechanically, not by feel.",
      },
      [
        { kind: "command", text: `aipe skill match --task-type ${AIPE_UNIT_TASK.taskType} --size ${AIPE_UNIT_TASK.size}` },
        ...skill.verdicts.map(
          (v): LeftLine => ({
            kind: "output",
            text: `${v.matched ? "MATCH" : "SKIP "} ${v.kit.padEnd(9)} ${v.reason}`,
            tone: v.matched ? "ok" : "muted",
          }),
        ),
        { kind: "output", text: `STATE matched=${skill.matchedCount} · routed → ${skill.routed.join(", ")}`, tone: "info" },
      ],
    ),

    step(
      "envelope",
      {
        kind: "envelope",
        title: "How much muscle — and does it need sign-off",
        plain:
          "Every unit gets an execution envelope on four axes: run mode, model tier, effort, and which harness. Their product is a coarse relative cost-index (never money). This one lands at 64 and uses a gated axis (ultracode effort), so it can't dispatch until the PE signs it off.",
        status: undefined,
      },
      [
        { kind: "command", text: `aipe execution propose --unit ${PACKAGE}--${lawson.id}` },
        {
          kind: "output",
          text: `${lawson.mode} · ${lawson.harness} · ${lawson.tier} · ${lawson.intensity}   cost-index ${env.costIndex}`,
          tone: "info",
        },
        { kind: "output", text: `GATED ${env.gateReasons.join(", ")} — awaiting PE signature`, tone: "gated" },
      ],
    ),

    step(
      "law",
      {
        kind: "law",
        title: "The one law the coordinator can't bend",
        plain:
          "Lawson and Viola are both on aipe-site. The dispatch law forbids the same package running twice at once, so proposing them together is rejected as written — and serialized instead: Lawson in wave 1, Viola's QA in wave 2 on his branch. Two DIFFERENT repos would have run side by side, up to 16 at once.",
      },
      [
        { kind: "command", text: `aipe dispatch validate --batch ${lawson.id},${viola.id}` },
        { kind: "output", text: `REJECT ${lawReason}`, tone: "reject" },
        {
          kind: "output",
          text: `→ serialize: wave 1 [${lawson.id}]  ·  wave 2 [${viola.id}]`,
          tone: "info",
        },
      ],
    ),

    step(
      "worktree",
      {
        kind: "worktree",
        title: "An isolated copy to work in",
        plain:
          "Wave 1's specialist gets its own git worktree — a separate working copy of the repo. Parallel specialists never step on each other's files, and each one's changes arrive as their own pull request.",
      },
      [
        { kind: "command", text: `aipe worktree create ${PACKAGE}--${lawson.id}` },
        { kind: "output", text: `OK ${lawson.worktree}`, tone: "ok" },
      ],
    ),

    step(
      "dispatch",
      {
        kind: "dispatch",
        title: "Wave 1 goes out; wave 2 waits",
        plain:
          "The dev is dispatched as a detached session with its own full context window. The QA stays queued behind him — same package, next wave — so the two never run at once. The ledger now reads: dispatched.",
        status: "dispatched",
      },
      [
        { kind: "command", text: `aipe session dispatch --journey ${JOURNEY}` },
        { kind: "output", text: `OK ${lawson.fqid} → ${lawson.sessionId}`, tone: "ok" },
        { kind: "output", text: `queued ${viola.fqid} (wave 2)`, tone: "queued" },
      ],
    ),

    step(
      "deliver",
      {
        kind: "deliver",
        title: "Delivered — with proof",
        plain:
          "Lawson opens the PR and records it as delivered, attaching the exact command he ran and what it showed. A delivery MUST carry that evidence; the record is the command and its result, not a claim.",
        status: "delivered",
      },
      [
        {
          kind: "command",
          text: `aipe journey record --status delivered --pr #${PR_NUMBER} \\`,
        },
        { kind: "command", text: `  --evidence-cmd "bun test" --evidence-summary "74 green · build clean"` },
        { kind: "output", text: `OK delivered  ${lawson.fqid}`, tone: "ok" },
      ],
    ),

    step(
      "evidence-gate",
      {
        kind: "evidence-gate",
        title: "A bare claim is rejected outright",
        plain:
          "Had he recorded 'delivered' with no command and no result, the ledger rejects the write — evidence-required. 'It should work' is not evidence. That is exactly why the delivery above carried a command and its output.",
      },
      [
        { kind: "command", text: `aipe journey record --status delivered   # no evidence` },
        { kind: "output", text: `REJECT ${evidenceGateOutcome().gateCode}`, tone: "reject" },
      ],
    ),

    step(
      "qa-gate",
      {
        kind: "qa-gate",
        title: "You can't merge on the dev's word",
        plain:
          "A merge straight from delivered is held: the unit isn't verified. Wave 2 runs — Viola, an independent QA in her own worktree, re-checks against the diff, not against Lawson's report — and records verified with her own evidence. Only now is the unit cleared.",
        status: "verified",
      },
      [
        { kind: "command", text: `aipe journey record --status merged   # straight from delivered` },
        { kind: "output", text: `REJECT ${qaGateOutcome().gateCode}: not verified`, tone: "reject" },
        { kind: "command", text: `aipe journey record --status verified --by qa` },
        { kind: "output", text: `OK verified  ${viola.fqid}`, tone: "ok" },
      ],
    ),

    step(
      "merged",
      {
        kind: "merged",
        title: "Merged, and now immutable",
        plain:
          "With a verified QA in hand, the PR merges. The unit becomes immutable — it is never re-dispatched — and its worktree is torn down.",
        status: "merged",
      },
      [
        { kind: "command", text: `aipe journey record --status merged` },
        { kind: "output", text: `OK merged  (immutable)`, tone: "ok" },
      ],
    ),

    step(
      "verify",
      {
        kind: "verify",
        title: "The record checks itself",
        plain:
          "A final deterministic lint reads the whole ledger back and confirms it's consistent: every delivery carried evidence, every merge was verified first, no dangling worktrees. One demand, dispatched and recorded, end to end.",
      },
      [
        { kind: "command", text: `aipe journey verify --journey ${JOURNEY}` },
        { kind: "output", text: `OK 0 findings · dispatched → delivered → verified → merged`, tone: "ok" },
      ],
    ),
  ];
}

export interface ConsoleModel {
  demand: typeof DEMAND;
  coordinator: string;
  journey: string;
  prNumber: number;
  task: SkillMatchTask;
  specialists: ConsoleSpecialist[];
  skill: ReturnType<typeof matchSummary>;
  waves: Wave[];
  steps: Step[];
  meaningById: Map<string, Meaning>;
}

export function buildConsole(): ConsoleModel {
  const steps = buildSteps();
  return {
    demand: DEMAND,
    coordinator: COORDINATOR,
    journey: JOURNEY,
    prNumber: PR_NUMBER,
    task: AIPE_UNIT_TASK,
    specialists: buildConsoleSpecialists(),
    skill: matchSummary(AIPE_UNIT_TASK),
    waves: consoleWaves(),
    steps,
    meaningById: new Map(steps.map((s) => [s.id, s.meaning])),
  };
}
