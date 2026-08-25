/**
 * Harness truth — which agent CLIs AIPe can dispatch a specialist to, and which
 * are eligible for session mode. Traceable to src/capabilities/probe.ts and
 * docs/dossie/15-session-dispatch.md.
 *
 * The rule (verbatim gist): a harness is eligible for `mode: session` iff its
 * adapter implements containment. Only claude-code and gemini do; codex and
 * copilot each need an interactive trust step that AIPe's unattended dispatch
 * cannot clear, so their adapters return a null containment hook and dispatch
 * validation REJECTs them with `harness-not-containable <id>`.
 *
 * This is truthful differentiation — do not fake parity.
 */

export type HarnessId = "claude-code" | "gemini" | "codex" | "copilot";

export type WorkspaceStatus = "available" | "experimental" | "coming-soon";

export interface HarnessInfo {
  id: HarnessId;
  /** The literal binary probed (a deliberately separate namespace from `id`). */
  bin: string;
  /** Implements a real containment hook → eligible for session mode. */
  containable: boolean;
  /** Why it is / isn't containable. */
  why: string;
  /**
   * Whether it's offered as a *workspace* harness at `aipe start` today. This is
   * independent of unit session-eligibility: a claude-code workspace can still
   * dispatch a QA unit to gemini.
   */
  workspaceStatus: WorkspaceStatus;
}

export const HARNESS_IDS: readonly HarnessId[] = ["claude-code", "gemini", "codex", "copilot"];

export const HARNESSES: Record<HarnessId, HarnessInfo> = {
  "claude-code": {
    id: "claude-code",
    bin: "claude",
    containable: true,
    why: "Writes a PreToolUse hook into .claude/settings.json — session containment holds unattended.",
    workspaceStatus: "available",
  },
  gemini: {
    id: "gemini",
    bin: "gemini",
    containable: true,
    why: "Writes a BeforeTool hook into .gemini/settings.json — containable, so it's session-eligible (and enables cross-model QA).",
    workspaceStatus: "coming-soon",
  },
  codex: {
    id: "codex",
    bin: "codex",
    containable: false,
    why: "Requires a human to interactively trust each hook via its /hooks command — no config-file way to self-declare trust for an unattended dispatch.",
    workspaceStatus: "coming-soon",
  },
  copilot: {
    id: "copilot",
    bin: "copilot",
    containable: false,
    why: "Gates on a default-on directory-trust prompt for any new folder (a fresh worktree always is) — no confirmed headless bypass.",
    workspaceStatus: "coming-soon",
  },
};

/** `session eligible` is exactly `containable`. */
export function isSessionEligible(id: HarnessId): boolean {
  return HARNESSES[id].containable;
}

/**
 * The reject reason `aipe dispatch validate` would print for a session-mode
 * dispatch to this harness, or null if it's lawful.
 */
export function sessionRejectReason(id: HarnessId): string | null {
  return HARNESSES[id].containable ? null : `harness-not-containable ${id}`;
}
