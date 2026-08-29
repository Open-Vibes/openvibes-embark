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

/* --------------------------------------------------- envelope axes (stage panel) */

/**
 * The four axes the stage's envelope panel prints, as `[gloss-key, literal-value]`.
 * The KEYS are glosses the reader reads *about* the dispatch, so they are localised
 * (see `console.axes` in the i18n dicts); the VALUES are literal identifiers from the
 * real envelope (`priceEnvelope` inputs) and stay English in both locales. This is
 * the single source the stage renders and `captions.i18n.test.ts` asserts against.
 */
export const ENVELOPE_AXIS_KEYS = ["mode", "harness", "tier", "effort"] as const;
export type EnvelopeAxisKey = (typeof ENVELOPE_AXIS_KEYS)[number];

/** The literal axis values, derived from the wave-1 specialist's priced envelope. */
export function envelopeAxisValues(specialist: ConsoleSpecialist): Record<EnvelopeAxisKey, string> {
  return {
    mode: specialist.mode,
    harness: specialist.harness,
    tier: specialist.tier,
    effort: specialist.intensity,
  };
}

/* ----------------------------------------------- plain-language glossary keys */

/**
 * The console is dense with AIPe vocabulary a newcomer has never seen (journey,
 * unit, envelope, wave, worktree, gate, ledger). Team policy: unexplained jargon is
 * a finding — a reader with no AIPe vocabulary must be able to follow the console. So
 * every noun the stage prints as a standing label gets one plain-language definition,
 * shown as a key beneath the console. `label` is the term exactly as the stage renders
 * it; `key` indexes its definition in `console.glossary` (localised, both locales).
 * This is the single source the glossary component and its i18n test share.
 */
/**
 * Each term carries its NATURE, so the glossary can show the order of the work
 * without lying about what each word is (the PE's v4 note). Classified against
 * the aipe operate flow, justified in SPEC.md:
 *  - `kind: "step"` + an `order` → a stage that happens, in sequence (journey →
 *    unit → sdd-lite → wave → gate). These are numbered.
 *  - `kind: "decision"` → what a dispatch is priced/gated as (envelope, tier,
 *    cost-index, gated). Not a stage; attaches to one. Not numbered.
 *  - `kind: "thing"` → the machinery a stage runs on or writes to (harness,
 *    worktree, ledger). Not a stage. Not numbered.
 * `loops: true` marks the one non-linear stage: a gate that rejects sends the
 * work back (the correction loop). Ordered first (steps 1–5), then the concepts,
 * so the array's own order is the reading order.
 */
export const GLOSSARY_TERMS = [
  { key: "journey", label: "journey", kind: "step", order: 1 },
  { key: "unit", label: "unit", kind: "step", order: 2 },
  { key: "sddLite", label: "sdd-lite", kind: "step", order: 3 },
  { key: "wave", label: "wave", kind: "step", order: 4 },
  { key: "gate", label: "gate", kind: "step", order: 5, loops: true },
  { key: "envelope", label: "envelope", kind: "decision", order: null },
  { key: "tier", label: "tier", kind: "decision", order: null },
  { key: "costIndex", label: "cost-index", kind: "decision", order: null },
  { key: "gated", label: "gated", kind: "decision", order: null },
  { key: "harness", label: "harness", kind: "thing", order: null },
  { key: "worktree", label: "worktree", kind: "thing", order: null },
  { key: "ledger", label: "ledger", kind: "thing", order: null },
] as const;
export type GlossaryKey = (typeof GLOSSARY_TERMS)[number]["key"];
export type GlossaryKind = (typeof GLOSSARY_TERMS)[number]["kind"];

/**
 * The comprehension contract that stops this finding's whole CLASS from returning.
 *
 * Every AIPe-vocabulary token a visitor READS on the console surface — the stage
 * pipeline nodes, the routed-kit pill, the envelope axis chips — that a newcomer
 * cannot be expected to know is declared here, spelled exactly as the stage prints
 * it. `glossary.coverage.test.ts` crosses this list against `GLOSSARY_TERMS` (by
 * `label`) and the two locale glossaries: a term listed here with no rendered,
 * bilingual plain-language entry FAILS the build. That is precisely how this
 * finding was born — `sdd-lite (floor/base)` was shown on the pill but never
 * explained — so surfacing a new jargon term now costs a glossary entry, in both
 * languages, mechanically, instead of depending on anyone to remember.
 *
 * Plain-English status words the stage also prints (queued, running, blocked,
 * open, rejected, delivered, verified, merged) and self-explanatory role/axis
 * words (coordinator, mode, effort) are deliberately NOT here: they carry their
 * ordinary meaning, so a gloss would add noise, not comprehension. See the
 * task's vocabulary sweep for the full ruling on each.
 */
export const PRESENTED_VOCABULARY = [
  "journey",
  "unit",
  "sdd-lite",
  "envelope",
  "harness",
  "tier",
  "cost-index",
  "gated",
  "wave",
  "worktree",
  "gate",
  "ledger",
] as const;
export type PresentedTerm = (typeof PRESENTED_VOCABULARY)[number];

/* ------------------------------------------------------ terminal line shapes */

export type LineTone = "ok" | "reject" | "gated" | "info" | "queued" | "muted";

/** One line in the terminal pane. Command/output lines are real, and stay English. */
export interface LeftLine {
  kind: "prompt" | "reply" | "command" | "output";
  text: string;
  tone?: LineTone;
}

/* --------------------------------------------- the command/speech boundary rule */

/**
 * THE COMMAND/SPEECH BOUNDARY — read this before adding a terminal line.
 *
 * The console types out a roteiro, and it is the part of the page a visitor reads
 * most, because it is the part that moves. Every line is one of two things, and
 * the next line must be born on the right side:
 *
 *  • COMMAND / MACHINE OUTPUT — *code*, English in every locale. It is what the
 *    person would literally type or what the machine literally prints: `aipe`
 *    verbs and flags (`--status merged`, `--pr #15`), the harness/mode/tier/effort
 *    values kept English across this whole site (`session`, `claude-code`,
 *    `reasoning`, `ultracode`), ledger status tokens (`dispatched`/`delivered`/
 *    `verified`/`merged`), identifiers (journey ids, fqids, worktree paths,
 *    `cost-index 64`), the UPPERCASE banners a real CLI prints (`OK`, `REJECT`,
 *    `GATED`, `MATCH`, `SKIP`, `STATE`, `JOURNEY`), and anything DERIVED from the
 *    proven domain layer (skill-match reasons like `floor`, gate codes like
 *    `evidence-required`/`qa-gate`, the law's `same-package …` reason). A
 *    translated command would be a lie — nobody types `aipe jornada registrar`.
 *    In `buildBeats`, write these inline as literal strings.
 *
 *  • NARRATION / SPEECH — *prose*, and it translates. The PE's spoken demand, the
 *    coordinator's spoken reply, the `#` comments, and the explanatory clauses a
 *    real CLI would not print but the console adds to be readable ("one producing
 *    unit …", "awaiting PE signature", "not verified", "1 demand → 1 ledger",
 *    "(immutable)"). In `buildBeats`, these NEVER appear inline — they come from
 *    the localised `console.script` dict, keyed by `SCRIPT_KEYS` below.
 *
 * The gate that keeps it honest is `script.i18n.test.ts` (the brother of
 * `glossary.coverage.test.ts`): every key in `SCRIPT_KEYS` must have an EN/PT pair
 * that actually differs, commands must stay byte-identical across locales, and no
 * English narration may survive in the rendered PT transcript. A roteiro line with
 * no EN/PT pair breaks the build — that is how the roteiro stops regressing.
 */
export const SCRIPT_KEYS = [
  "demand",
  "oneDemandOneLedger",
  "oneUnit",
  "routed",
  "awaitingSignature",
  "serialize",
  "noEvidence",
  "straightFromDelivered",
  "notVerified",
  "immutable",
] as const;
export type ScriptKey = (typeof SCRIPT_KEYS)[number];

/** The localised narration the terminal speaks — one string per `SCRIPT_KEYS` entry. */
export type ConsoleScript = Record<ScriptKey, string>;

/** Interpolate `{name}` placeholders in a narration string with literal values. */
export function fillScript(template: string, vars: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (whole, name) => vars[name] ?? whole);
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
