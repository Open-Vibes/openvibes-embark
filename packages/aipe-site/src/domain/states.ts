/**
 * Semantic states — the spine of the product and of this site's palette.
 *
 * The canonical ledger statuses are the eight `DispatchStatus` values from the
 * aipe repo (src/journey/types.ts). `running` is the session-mode transient
 * (src/session) — part of the state vocabulary but not a ledger status. Every
 * state is rendered as color + glyph + label, never color alone, so it stays
 * legible under color-vision deficiency and in reduced-motion mode.
 */

export type LedgerStatus =
  | "dispatched"
  | "delivered"
  | "verified"
  | "failed"
  | "escalated"
  | "merged"
  | "removed"
  | "redirected";

/** Session-mode transient classification (not a ledger status). */
export type SessionState = "running";

export type StateKey = LedgerStatus | SessionState;

export interface StateMeta {
  key: StateKey;
  label: string;
  /** Paired with the color so state is never carried by hue alone. */
  glyph: string;
  /** One-line meaning, traceable to the aipe repo. */
  blurb: string;
  kind: "ledger" | "session";
}

/** The eight canonical ledger statuses, in lifecycle-ish order. */
export const LEDGER_STATUSES: readonly LedgerStatus[] = [
  "dispatched",
  "delivered",
  "verified",
  "failed",
  "escalated",
  "merged",
  "removed",
  "redirected",
];

export const STATE_META: Record<StateKey, StateMeta> = {
  dispatched: {
    key: "dispatched",
    label: "dispatched",
    glyph: "◇",
    blurb: "Handed to a specialist, in-flight in its own worktree.",
    kind: "ledger",
  },
  running: {
    key: "running",
    label: "running",
    glyph: "◐",
    blurb: "Session-mode transient — the detached session is still alive.",
    kind: "session",
  },
  delivered: {
    key: "delivered",
    label: "delivered",
    glyph: "▽",
    blurb: "A PR from a dev — must carry evidence, or the ledger REJECTs it.",
    kind: "ledger",
  },
  verified: {
    key: "verified",
    label: "verified",
    glyph: "✓",
    blurb: "Passed its QA gate with the QA's own evidence — cleared for the PE.",
    kind: "ledger",
  },
  failed: {
    key: "failed",
    label: "failed",
    glyph: "✕",
    blurb: "QA rejected it. The unit is not done; it loops back to the dev.",
    kind: "ledger",
  },
  escalated: {
    key: "escalated",
    label: "escalated",
    glyph: "⤴",
    blurb: "A cross-repo need — the PE decides before the next wave.",
    kind: "ledger",
  },
  merged: {
    key: "merged",
    label: "merged",
    glyph: "⬢",
    blurb: "The PR merged. The unit is immutable and never re-dispatched.",
    kind: "ledger",
  },
  removed: {
    key: "removed",
    label: "removed",
    glyph: "⌫",
    blurb: "The worktree was torn down after merge.",
    kind: "ledger",
  },
  redirected: {
    key: "redirected",
    label: "redirected",
    glyph: "↻",
    blurb: "The PE redirected it live via agentop attach; needs a reason.",
    kind: "ledger",
  },
};

/** CSS custom-property name holding this state's RGB triple, per theme. */
export function stateColorVar(key: StateKey): string {
  return `--st-${key === "running" ? "running" : key}`;
}

/** Inline style using the state's themed color as `color`. */
export function stateColorStyle(key: StateKey): { color: string } {
  return { color: `rgb(var(${stateColorVar(key)}))` };
}

export function stateMeta(key: StateKey): StateMeta {
  return STATE_META[key];
}
