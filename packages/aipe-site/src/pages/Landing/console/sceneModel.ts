/**
 * The coordination layer between the two independent hero components.
 *
 * Neither `Terminal` nor `Stage` imports the other; they share only this module —
 * a **shared step index** into one ordered **beat stream**. Each beat belongs to
 * exactly ONE side and the stream strictly alternates: a decision is a `terminal`
 * beat (a command runs, left acts) immediately followed by its `stage` beat (the
 * consequence enacts, right responds). One thing changes at a time, one side at a
 * time, with a beat between — so a reader paused on any beat can say what just
 * happened.
 *
 * The stage never shows prose. Each stage beat carries a single small **state
 * change** the `Stage` folds into a scene of moving objects, plus a one-line
 * caption (a label or clause, budget-capped and asserted in the tests). Every
 * value is DERIVED from `consoleScript`'s facts (the proven domain layer), never
 * hand-set.
 */

import { buildFacts, fillScript, type ConsoleFacts, type ConsoleScript, type LeftLine } from "./consoleScript";
import type { LedgerStatus } from "../../../domain/states";
import en from "../../../i18n/en";

export type DecisionId =
  | "demand"
  | "journey"
  | "unit"
  | "route"
  | "envelope"
  | "law"
  | "worktree"
  | "dispatch"
  | "deliver"
  | "evidence"
  | "qa-block"
  | "verify"
  | "merged";

/** A single visible change the Stage folds into scene state. Exactly one per stage beat. */
export type StageChange =
  | { t: "coordinator" }
  | { t: "journey" }
  | { t: "unit" }
  | { t: "route" }
  | { t: "envelope" }
  | { t: "serialize" }
  | { t: "worktree"; who: string }
  | { t: "run"; who: string }
  | { t: "ledger"; status: LedgerStatus }
  | { t: "reject"; gate: "evidence" | "qa" }
  | { t: "verify" }
  | { t: "merged" };

export interface Beat {
  index: number;
  decision: DecisionId;
  side: "terminal" | "stage";
  /** Terminal beats: the command/output lines to bring to the fore. */
  commands?: LeftLine[];
  /** Stage beats: the single change to enact, and the caption key for its one line. */
  change?: StageChange;
  captionKey?: string;
}

/** Wave index → human lane number (wave 0 → lane 1). */
export function laneOf(wave: number): number {
  return wave + 1;
}

/**
 * The default English captions — one short line per stage beat. The UI overrides
 * these via i18n; the budget is asserted against THIS map in the tests so a
 * paragraph can never sneak back in.
 */
export const CAPTION_BUDGET = 40;
export const CAPTIONS_EN: Record<string, string> = {
  demand: "coordinator takes the demand",
  journey: "one demand → one journey",
  unit: "one unit · aipe-site",
  route: "routed → sdd-lite (floor)",
  envelope: "envelope 64 · gated",
  law: "same package → serialize",
  worktree: "worktree carved · isolated",
  dispatch: "wave 1 runs · wave 2 waits",
  deliver: "delivered · with evidence",
  evidence: "no evidence → rejected",
  "qa-block": "can't merge unverified",
  verify: "verified by QA",
  merged: "merged · locked",
};

/* -------------------------------------------------------------- the beat stream */

/** Build one decision as its terminal beat + its stage beat (kept adjacent). */
function decision(
  id: DecisionId,
  commands: LeftLine[],
  change: StageChange,
  captionKey: string = id,
): [Omit<Beat, "index">, Omit<Beat, "index">] {
  return [
    { decision: id, side: "terminal", commands },
    { decision: id, side: "stage", change, captionKey },
  ];
}

/**
 * Build the beat stream. `script` is the localised narration (the SPEECH half of
 * the roteiro); it defaults to English so the pure derivations stay locale-free in
 * tests. The COMMAND / machine-output half is written inline below and is
 * identical in every locale — see the boundary rule in `consoleScript.ts`.
 */
export function buildBeats(
  facts: ConsoleFacts = buildFacts(),
  script: ConsoleScript = en.console.script,
): Beat[] {
  const [lawson, viola] = facts.specialists;
  if (!lawson || !viola) return [];

  const env = lawson.envelope;
  const skill = facts.skill;
  const lawReason = facts.law.ok ? "" : facts.law.reason;

  const pairs: [Omit<Beat, "index">, Omit<Beat, "index">][] = [
    decision(
      "demand",
      // SPEECH — the PE's spoken demand.
      [{ kind: "prompt", text: script.demand, tone: "info" }],
      { t: "coordinator" },
    ),
    decision(
      "journey",
      [
        // COMMAND — literal, English in both locales.
        { kind: "command", text: `aipe journey start --demand "aipe public site"` },
        // OUTPUT — the id is literal; the tail ("1 demand → 1 ledger") is narration.
        { kind: "output", text: `JOURNEY ${facts.journey}  ·  ${script.oneDemandOneLedger}`, tone: "ok" },
      ],
      { t: "journey" },
    ),
    decision(
      "unit",
      [
        {
          kind: "reply",
          // SPEECH — the coordinator's reply; `{unit}` is a literal identifier.
          text: `⎇ ${facts.coordinator} › ${fillScript(script.oneUnit, { unit: `${lawson.repo}/${lawson.package}` })}`,
          tone: "info",
        },
      ],
      { t: "unit" },
    ),
    decision(
      "route",
      [
        { kind: "command", text: `aipe skill match --task-type ${facts.task.taskType} --size ${facts.task.size}` },
        ...skill.verdicts.map(
          (v): LeftLine => ({
            kind: "output",
            text: `${v.matched ? "MATCH" : "SKIP "} ${v.kit.padEnd(9)} ${v.reason}`,
            tone: v.matched ? "ok" : "muted",
          }),
        ),
        // "STATE" is the CLI banner (literal); "routed" is narration; the kit is literal.
        { kind: "output", text: `STATE ${script.routed} → ${skill.routed.join(", ")}`, tone: "info" },
      ],
      { t: "route" },
    ),
    decision(
      "envelope",
      [
        { kind: "command", text: `aipe execution propose --unit ${lawson.package}--${lawson.id}` },
        {
          kind: "output",
          text: `${lawson.mode} · ${lawson.harness} · ${lawson.tier} · ${lawson.intensity}   cost-index ${env.costIndex}`,
          tone: "info",
        },
        // "GATED" banner + literal reason token; "awaiting PE signature" is narration.
        { kind: "output", text: `GATED ${env.gateReasons.join(", ")} — ${script.awaitingSignature}`, tone: "gated" },
      ],
      { t: "envelope" },
    ),
    decision(
      "law",
      [
        { kind: "command", text: `aipe dispatch validate --batch ${lawson.id},${viola.id}` },
        { kind: "output", text: `REJECT ${lawReason}`, tone: "reject" },
        // "serialize" is narration; wave numbers and ids are literal.
        { kind: "output", text: `→ ${script.serialize}: wave 1 [${lawson.id}] · wave 2 [${viola.id}]`, tone: "info" },
      ],
      { t: "serialize" },
    ),
    decision(
      "worktree",
      [
        { kind: "command", text: `aipe worktree create ${lawson.package}--${lawson.id}` },
        { kind: "output", text: `OK ${lawson.worktree}`, tone: "ok" },
      ],
      { t: "worktree", who: lawson.id },
    ),
    decision(
      "dispatch",
      [
        { kind: "command", text: `aipe session dispatch --journey ${facts.journey}` },
        { kind: "output", text: `OK ${lawson.fqid} → ${lawson.sessionId}`, tone: "ok" },
        { kind: "output", text: `queued ${viola.fqid} (wave 2)`, tone: "queued" },
      ],
      { t: "run", who: lawson.id },
    ),
    decision(
      "deliver",
      [
        { kind: "command", text: `aipe journey record --status delivered --pr #${facts.prNumber} \\` },
        { kind: "command", text: `  --evidence-cmd "bun test" --evidence-summary "74 green · build clean"` },
        { kind: "output", text: `OK delivered  ${lawson.fqid}`, tone: "ok" },
      ],
      { t: "ledger", status: "delivered" },
    ),
    decision(
      "evidence",
      [
        // The command is literal; the trailing `#` comment is narration.
        { kind: "command", text: `aipe journey record --status delivered   # ${script.noEvidence}` },
        { kind: "output", text: `REJECT ${facts.evidenceGate.gateCode}`, tone: "reject" },
      ],
      { t: "reject", gate: "evidence" },
    ),
    decision(
      "qa-block",
      [
        // The command is literal; the `#` comment is narration; "delivered" stays a status token.
        { kind: "command", text: `aipe journey record --status merged   # ${script.straightFromDelivered}` },
        { kind: "output", text: `REJECT ${facts.qaGate.gateCode}: ${script.notVerified}`, tone: "reject" },
      ],
      { t: "reject", gate: "qa" },
    ),
    decision(
      "verify",
      [
        { kind: "command", text: `aipe journey record --status verified --by qa` },
        { kind: "output", text: `OK verified  ${viola.fqid}`, tone: "ok" },
      ],
      { t: "verify" },
    ),
    decision(
      "merged",
      [
        { kind: "command", text: `aipe journey record --status merged` },
        // "OK merged" is banner + status token (literal); "(immutable)" is narration.
        { kind: "output", text: `OK merged  (${script.immutable})`, tone: "ok" },
      ],
      { t: "merged" },
    ),
  ];

  return pairs.flat().map((b, index) => ({ ...b, index }));
}

/* ------------------------------------------------------------------ scene state */

export interface StageSpecialist {
  id: string;
  persona: string;
  role: string;
  /** Human lane number (wave + 1), or null before placement. */
  lane: number | null;
  running: boolean;
  queued: boolean;
  delivered: boolean;
  worktree: boolean;
}

export interface SceneState {
  coordinator: boolean;
  journeyOpen: boolean;
  unit: boolean;
  routed: boolean;
  envelope: { shown: boolean; costIndex: number | null; gated: boolean };
  serialized: boolean;
  specialists: StageSpecialist[];
  gates: { evidence: "idle" | "rejected"; qa: "idle" | "blocked" | "open" };
  /** Ledger stations lit, in lifecycle order. */
  ledger: LedgerStatus[];
  verified: boolean;
  immutable: boolean;
}

function emptyScene(): SceneState {
  return {
    coordinator: false,
    journeyOpen: false,
    unit: false,
    routed: false,
    envelope: { shown: false, costIndex: null, gated: false },
    serialized: false,
    specialists: [],
    gates: { evidence: "idle", qa: "idle" },
    ledger: [],
    verified: false,
    immutable: false,
  };
}

function pushStatus(ledger: LedgerStatus[], status: LedgerStatus): LedgerStatus[] {
  return ledger.includes(status) ? ledger : [...ledger, status];
}

/**
 * Fold every stage change in `beats[0..upTo]` into the scene. Pure and
 * cumulative — the Stage renders whatever this returns for the current index, so
 * stepping/scrubbing is just re-folding to a new index.
 */
export function foldScene(beats: Beat[], upTo: number, facts: ConsoleFacts = buildFacts()): SceneState {
  const scene = emptyScene();
  const specById = new Map(facts.specialists.map((s) => [s.id, s]));

  const spec = (id: string): StageSpecialist => {
    let s = scene.specialists.find((x) => x.id === id);
    if (!s) {
      const f = specById.get(id)!;
      s = { id, persona: f.persona, role: f.role, lane: null, running: false, queued: false, delivered: false, worktree: false };
      scene.specialists.push(s);
    }
    return s;
  };

  for (let i = 0; i <= upTo && i < beats.length; i++) {
    const c = beats[i]!.change;
    if (!c) continue;
    switch (c.t) {
      case "coordinator": scene.coordinator = true; break;
      case "journey": scene.journeyOpen = true; break;
      case "unit": scene.unit = true; break;
      case "route": scene.routed = true; break;
      case "envelope": {
        const e = facts.specialists[0]!.envelope;
        scene.envelope = { shown: true, costIndex: e.costIndex, gated: e.gated };
        break;
      }
      case "serialize": {
        scene.serialized = true;
        for (const f of facts.specialists) {
          const s = spec(f.id);
          s.lane = laneOf(f.wave);
          s.queued = f.wave > 0;
        }
        break;
      }
      case "worktree": spec(c.who).worktree = true; break;
      case "run": {
        const s = spec(c.who);
        s.running = true;
        s.queued = false;
        // Dispatching the wave-1 specialist lights the ramp's first station.
        scene.ledger = pushStatus(scene.ledger, "dispatched");
        break;
      }
      case "ledger": {
        scene.ledger = pushStatus(scene.ledger, c.status);
        if (c.status === "delivered") spec("lawson").delivered = true;
        break;
      }
      case "reject": {
        if (c.gate === "evidence") scene.gates.evidence = "rejected";
        else scene.gates.qa = "blocked";
        break;
      }
      case "verify": {
        scene.gates.qa = "open";
        scene.verified = true;
        scene.ledger = pushStatus(scene.ledger, "verified");
        spec("viola").running = true;
        spec("viola").queued = false;
        break;
      }
      case "merged": {
        scene.ledger = pushStatus(scene.ledger, "merged");
        scene.immutable = true;
        for (const s of scene.specialists) s.running = false;
        break;
      }
    }
  }
  return scene;
}

/** The decision the beat at `index` belongs to — links the two panes for the cross-highlight. */
export function activeDecision(beats: Beat[], index: number): DecisionId | null {
  return beats[Math.max(0, Math.min(index, beats.length - 1))]?.decision ?? null;
}
