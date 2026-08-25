/**
 * The journey-ledger state machine that drives the scrubber. Traceable to
 * src/journey/types.ts (evidence-required statuses, immutable statuses) and
 * src/journey/ledger.ts (gate codes).
 *
 * The ledger is the durable, human-inspectable record. It REJECTs writes that
 * violate a gate:
 *  - delivered / verified must carry evidence  → `evidence-required`
 *  - verified must carry the QA's OWN evidence → `evidence-required`
 *  - merged requires the unit to have passed QA (verified) → the QA gate blocks
 *  - a merged unit is immutable → `unit-immutable`
 *  - redirected needs a reason → `redirect-needs-reason`
 *  - reopening a delivered/verified unit needs a reason → `redispatch-needs-reason`
 *
 * `REJECT` is a CLI output line, not a status — a rejected write leaves the
 * unit's status unchanged.
 */

import type { LedgerStatus } from "./states";

export type LedgerGateCode =
  | "evidence-required"
  | "unit-immutable"
  | "redispatch-needs-reason"
  | "redirect-needs-reason"
  | "qa-gate";

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
  gateCode?: LedgerGateCode;
  message?: string;
  /** The unit's status after this frame (unchanged when the write is rejected). */
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

  // A merged unit is immutable — only teardown (removed) may follow.
  if (current === "merged" && status !== "removed") {
    return {
      accepted: false,
      gateCode: "unit-immutable",
      message: `unit-immutable — a merged unit is never re-dispatched`,
      status: current,
    };
  }

  // Reopening a cleared unit needs a reason.
  if ((current === "delivered" || current === "verified") && status === "dispatched" && !attempt.reason) {
    return {
      accepted: false,
      gateCode: "redispatch-needs-reason",
      message: `redispatch-needs-reason — reopening a ${current} unit requires --reason`,
      status: current,
    };
  }

  // Evidence gate.
  if (EVIDENCE_REQUIRED.has(status) && !hasEvidence(attempt.evidence)) {
    return {
      accepted: false,
      gateCode: "evidence-required",
      message: `evidence-required — status ${status} requires the command(s) run and a summary of what the output showed`,
      status: current ?? "dispatched",
    };
  }

  // verified must be the QA's own evidence.
  if (status === "verified" && attempt.evidence && attempt.evidence.by !== "qa") {
    return {
      accepted: false,
      gateCode: "evidence-required",
      message: `evidence-required — verified must carry the QA's own evidence, not the dev's self-report`,
      status: current ?? "dispatched",
    };
  }

  // QA gate: merged requires a prior verified.
  if (status === "merged" && current !== "verified") {
    return {
      accepted: false,
      gateCode: "qa-gate",
      message: `QA gate — merged is blocked until the unit is verified (passed independent QA)`,
      status: current ?? "dispatched",
    };
  }

  // redirected needs a reason.
  if (status === "redirected" && !attempt.reason) {
    return {
      accepted: false,
      gateCode: "redirect-needs-reason",
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
    caption: "the QA gate blocks a merge that skipped verification",
    attempts: [
      { status: "dispatched", note: "coordinator dispatches the specialist" },
      { status: "delivered", evidence: devEvidence, note: "dev delivers with evidence" },
      { status: "merged", note: "try to merge straight from delivered" },
      { status: "verified", evidence: qaEvidence, note: "run the QA gate first" },
      { status: "merged", note: "now the merge is lawful" },
    ],
  },
];
