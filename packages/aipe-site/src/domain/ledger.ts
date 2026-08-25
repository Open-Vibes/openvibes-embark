/**
 * The journey-ledger state machine that drives the scrubber. Traceable to
 * src/journey/types.ts (evidence-required statuses, immutable statuses) and
 * src/journey/ledger.ts (`recordDispatchGuarded`, `LedgerGateCode`).
 *
 * The ledger is the durable, human-inspectable record. Its OWN reject codes are
 * exactly the four the reference `LedgerGateCode` carries — no more:
 *  - delivered / verified must carry evidence     → `evidence-required`
 *  - verified must carry the QA's OWN evidence     → `evidence-required`
 *  - a merged unit is immutable                    → `unit-immutable`
 *  - reopening a delivered/verified unit needs one → `redispatch-needs-reason`
 *  - redirected needs a reason                     → `redirect-needs-reason`
 *
 * The **QA gate** — a delivery must be independently verified before it may
 * merge — is a distinct thing: in the reference the ledger does NOT block a
 * `merged` write on a prior `verified` (see `recordDispatchGuarded`). The QA
 * gate lives in the *operate flow* (dev delivers → the coordinator dispatches an
 * independent QA → only a `verified` unit is cleared to merge; see
 * `skills/operate` and the `/review-delivery` skill). The scrubber shows it
 * holding a premature merge, but it is marked `kind: "process"`, never dressed
 * up as one of the ledger's own machine reject codes.
 *
 * `REJECT` is a CLI output line, not a status — a blocked write leaves the
 * unit's status unchanged.
 */

import type { LedgerStatus } from "./states";

/** The ledger's own reject codes — exactly the reference `LedgerGateCode` set. */
export type LedgerGateCode =
  | "evidence-required"
  | "unit-immutable"
  | "redispatch-needs-reason"
  | "redirect-needs-reason";

/** The operate-flow QA gate — a process gate, not a ledger reject code. */
export type ProcessGateCode = "qa-gate";

/** Any gate the scrubber can surface: a ledger reject code or the QA process gate. */
export type GateCode = LedgerGateCode | ProcessGateCode;

/** Which layer blocked the write: the ledger's own guard, or the operate flow. */
export type GateKind = "ledger" | "process";

export interface Evidence {
  by: "dev" | "qa";
  commands: string[];
  summary: string;
}

export interface LedgerAttempt {
  status: LedgerStatus;
  evidence?: Evidence;
  reason?: string;
  /** Human label for the scrubber frame, e.g. "dev opens the PR". */
  note?: string;
}

export interface LedgerFrame {
  attempt: LedgerAttempt;
  accepted: boolean;
  gateCode?: GateCode;
  /** Whether the block came from the ledger's own guard or the operate-flow QA gate. */
  gateKind?: GateKind;
  message?: string;
  /** The unit's status after this frame (unchanged when the write is blocked). */
  status: LedgerStatus;
}

const EVIDENCE_REQUIRED: ReadonlySet<LedgerStatus> = new Set(["delivered", "verified"]);

function hasEvidence(ev: Evidence | undefined): ev is Evidence {
  return !!ev && ev.commands.length > 0 && ev.summary.trim().length > 0;
}

/**
 * Evaluate one attempted write against the current status. Pure — returns the
 * gate outcome and the resulting status.
 */
export function evaluateAttempt(
  current: LedgerStatus | null,
  attempt: LedgerAttempt,
): Omit<LedgerFrame, "attempt"> {
  const { status } = attempt;

  // Ledger gate — a merged unit is immutable; only teardown (removed) may follow.
  if (current === "merged" && status !== "removed") {
    return {
      accepted: false,
      gateCode: "unit-immutable",
      gateKind: "ledger",
      message: `unit-immutable — a merged unit is never re-dispatched`,
      status: current,
    };
  }

  // Ledger gate — reopening a cleared unit needs a reason.
  if ((current === "delivered" || current === "verified") && status === "dispatched" && !attempt.reason) {
    return {
      accepted: false,
      gateCode: "redispatch-needs-reason",
      gateKind: "ledger",
      message: `redispatch-needs-reason — reopening a ${current} unit requires --reason`,
      status: current,
    };
  }

  // Ledger gate — evidence is required for delivered / verified.
  if (EVIDENCE_REQUIRED.has(status) && !hasEvidence(attempt.evidence)) {
    return {
      accepted: false,
      gateCode: "evidence-required",
      gateKind: "ledger",
      message: `evidence-required — status ${status} requires the command(s) run and a summary of what the output showed`,
      status: current ?? "dispatched",
    };
  }

  // Ledger gate — verified must carry the QA's own evidence.
  if (status === "verified" && attempt.evidence && attempt.evidence.by !== "qa") {
    return {
      accepted: false,
      gateCode: "evidence-required",
      gateKind: "ledger",
      message: `evidence-required — verified must carry the QA's own evidence, not the dev's self-report`,
      status: current ?? "dispatched",
    };
  }

  // QA gate — a PROCESS gate, not a ledger reject code: the operate flow dispatches
  // an independent QA after each delivery, so a delivery that isn't verified yet is
  // not cleared to merge. (The reference ledger itself does not block this write; the
  // operate loop does — see the module comment.)
  if (status === "merged" && current !== "verified") {
    return {
      accepted: false,
      gateCode: "qa-gate",
      gateKind: "process",
      message: `QA gate — the operate flow verifies a delivery with independent QA before it may merge; this unit is not verified yet`,
      status: current ?? "dispatched",
    };
  }

  // Ledger gate — redirected needs a reason.
  if (status === "redirected" && !attempt.reason) {
    return {
      accepted: false,
      gateCode: "redirect-needs-reason",
      gateKind: "ledger",
      message: `redirect-needs-reason — a live redirect requires --reason`,
      status: current ?? "dispatched",
    };
  }

  return { accepted: true, status };
}

/** Reduce a scenario of attempts into scrubber frames. */
export function reduceLedger(attempts: LedgerAttempt[]): LedgerFrame[] {
  const frames: LedgerFrame[] = [];
  let current: LedgerStatus | null = null;
  for (const attempt of attempts) {
    const outcome = evaluateAttempt(current, attempt);
    frames.push({ attempt, ...outcome });
    if (outcome.accepted) current = outcome.status;
  }
  return frames;
}

export interface LedgerScenario {
  id: string;
  title: string;
  caption: string;
  attempts: LedgerAttempt[];
}

const devEvidence: Evidence = {
  by: "dev",
  commands: ["bun run --filter @embark/aipe-site build", "bun test"],
  summary: "build clean, 42 tests pass",
};
const qaEvidence: Evidence = {
  by: "qa",
  commands: ["bun test", "tsc --noEmit"],
  summary: "re-ran against the diff — green, acceptance criteria met",
};

/** The happy path and the two gate-tripping scenarios the scrubber demonstrates. */
export const LEDGER_SCENARIOS: LedgerScenario[] = [
  {
    id: "happy",
    title: "The happy path",
    caption: "dispatched → delivered (with evidence) → verified → merged",
    attempts: [
      { status: "dispatched", note: "coordinator dispatches the specialist" },
      { status: "delivered", evidence: devEvidence, note: "dev opens the PR, attaches evidence" },
      { status: "verified", evidence: qaEvidence, note: "independent QA re-runs against the diff" },
      { status: "merged", note: "PR merges — the unit is now immutable" },
    ],
  },
  {
    id: "no-evidence",
    title: "Delivered with no evidence",
    caption: "the evidence gate REJECTs a bare self-report",
    attempts: [
      { status: "dispatched", note: "coordinator dispatches the specialist" },
      { status: "delivered", note: "dev claims done — but attaches no evidence" },
      { status: "delivered", evidence: devEvidence, note: "re-record with the commands and what they showed" },
      { status: "verified", evidence: qaEvidence, note: "QA passes" },
    ],
  },
  {
    id: "merge-without-qa",
    title: "Merge without QA",
    caption: "the operate flow's QA gate holds a merge that skipped verification",
    attempts: [
      { status: "dispatched", note: "coordinator dispatches the specialist" },
      { status: "delivered", evidence: devEvidence, note: "dev delivers with evidence" },
      { status: "merged", note: "try to merge straight from delivered" },
      { status: "verified", evidence: qaEvidence, note: "run the QA gate first" },
      { status: "merged", note: "now the merge is lawful" },
    ],
  },
];
