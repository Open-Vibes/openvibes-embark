/**
 * Harness COMPATIBILITY — the honest, per-harness accordion truth.
 *
 * This is a *presentation* model (the pricer's `HarnessId`/`HARNESSES` in
 * ./harness.ts stays the 4-id adapter union it always was — envelope pricing and
 * the dispatch law depend on that union and must not change). Here we answer a
 * different question, the one the PE asked: for EACH harness the agentop print
 * lists, how compatible is it with AIPe, what is missing, why, and how do you
 * run AIPe on it anyway?
 *
 * The row set is the ten harnesses agentop can HOST a session on — the same list
 * the PDD reaches (Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI,
 * Antigravity, Factory Droid, Kimi Code, OpenCode, Pi). Modelling all ten is the
 * point: it makes the host × contain gap legible instead of hiding the smaller
 * number.
 *
 * INSTALL CONTENT × CONTAIN SESSION — the axis the whole section teaches. The
 * PDD reaches ten because it installs *content* (skills, prompts): any harness
 * that reads a file passes. AIPe must *contain the session*, and containment
 * needs an interception hook that is trusted with NO human present — the rule is
 * written verbatim in aipe/src/harness/types.ts:40-42: "A harness whose adapter
 * returns null cannot be contained — and is therefore NOT eligible for
 * session-mode dispatch. That is the whole eligibility rule: AIPe never starts a
 * session it cannot govern."
 *
 * Every boolean below is a fact checkable in aipe/src/harness — never a vibe.
 * The five capability checks ARE the visible ruler the percentage is derived
 * from; a number without a ruler is a guess wearing a data costume.
 */

import { HARNESSES, isSessionEligible, sessionRejectReason, type HarnessId } from "./harness";

export type CompatId =
  | "claude-code"
  | "codex"
  | "cursor"
  | "copilot"
  | "gemini"
  | "antigravity"
  | "factory-droid"
  | "kimi-code"
  | "opencode"
  | "pi";

/**
 * The five verifiable capabilities the compatibility percentage is built from.
 * In ascending order of what they demand — the first two are the PDD-parity
 * floor (content install + a host), the last is the AIPe-only bar (containment
 * that holds unattended). Shown on the page as the ruler.
 */
export const CAPABILITY_KEYS = [
  "contentInstall",
  "agentopHost",
  "dedicatedAdapter",
  "interceptionHook",
  "headlessContainment",
] as const;
export type CapabilityKey = (typeof CAPABILITY_KEYS)[number];

/** How the row's copy is sourced: a per-harness block, or the shared no-adapter one. */
export type CompatCopyKey = HarnessId | "no-adapter";

export interface CompatHarness {
  id: CompatId;
  /** Display name from the PDD list — a proper noun, identical in both locales. */
  label: string;
  /** The name agentop knows it by (the HOST axis). Every row has one — all ten are hosted. */
  agentopName: string;
  /** The aipe adapter id backing this row, or null when only the generic path reaches it. */
  adapter: HarnessId | null;
  /** The five capability facts, each checkable in aipe/src/harness. */
  caps: Record<CapabilityKey, boolean>;
  /** Which i18n copy block explains this row (`why` / `missing` / `howAnyway` / `lose`). */
  copyKey: CompatCopyKey;
}

/** A harness with a dedicated aipe adapter. `caps` derives from the real adapter facts. */
function adapterRow(
  id: CompatId & HarnessId,
  label: string,
  agentopName: string,
): CompatHarness {
  const contained = isSessionEligible(id);
  return {
    id,
    label,
    agentopName,
    adapter: id,
    caps: {
      contentInstall: true, // installIntegration writes personas/flow-skills
      agentopHost: true, // agentopHarness !== null
      dedicatedAdapter: true, // present in aipe/src/harness/registry.ts
      interceptionHook: true, // the adapter writes a PreToolUse/BeforeTool hook…
      headlessContainment: contained, // …but only claude-code/gemini's is trusted with no human
    },
    copyKey: id,
  };
}

/** A harness agentop hosts but aipe has NO dedicated adapter for — the generic path only. */
function genericOnlyRow(id: CompatId, label: string, agentopName: string): CompatHarness {
  return {
    id,
    label,
    agentopName,
    adapter: null,
    caps: {
      contentInstall: true, // the generic AGENTS.md adapter installs content anywhere a file is read…
      agentopHost: true, // …and agentop lists it as a host
      dedicatedAdapter: false, // but no native adapter in aipe/src/harness/registry.ts
      interceptionHook: false,
      headlessContainment: false,
    },
    copyKey: "no-adapter",
  };
}

/**
 * The ten rows, in the PDD list's own order so a reader comparing the two lists
 * lands on the same sequence. The four adapter rows carry real adapter truth;
 * the six generic-only rows are marked as such and never dressed up as supported.
 */
export const COMPAT_HARNESSES: readonly CompatHarness[] = [
  adapterRow("claude-code", "Claude Code", "claude"),
  adapterRow("codex", "Codex", "codex"),
  genericOnlyRow("cursor", "Cursor", "cursor"),
  adapterRow("copilot", "GitHub Copilot", "copilot"),
  adapterRow("gemini", "Gemini CLI", "gemini"),
  genericOnlyRow("antigravity", "Antigravity", "antigravity"),
  genericOnlyRow("factory-droid", "Factory Droid", "factory-droid"),
  genericOnlyRow("kimi-code", "Kimi Code", "kimi"),
  genericOnlyRow("opencode", "OpenCode", "opencode"),
  genericOnlyRow("pi", "Pi", "pi"),
] as const;

/** The compatibility percentage: how many of the five ruler checks this harness passes. */
export function compatPercent(h: CompatHarness): number {
  const passed = CAPABILITY_KEYS.filter((k) => h.caps[k]).length;
  return Math.round((passed / CAPABILITY_KEYS.length) * 100);
}

/** True once the harness clears the decisive check — a session AIPe can contain unattended. */
export function isFullyContained(h: CompatHarness): boolean {
  return h.caps.headlessContainment;
}

/** The `aipe dispatch validate` line this harness would print in session mode. */
export function compatDispatchLine(h: CompatHarness): string {
  if (h.adapter === null) {
    return `harness-not-adapted ${h.id} — generic path only`;
  }
  const reject = sessionRejectReason(h.adapter);
  return reject ?? `aipe dispatch --mode session --harness ${h.adapter} validate → OK`;
}

/** How many harnesses agentop can HOST a session on (the bigger, host-axis number). */
export const AGENTOP_HOSTED_COUNT = COMPAT_HARNESSES.length;

/** How many AIPe can fully CONTAIN in session mode (the smaller, honest number). */
export const FULLY_CONTAINED_COUNT = COMPAT_HARNESSES.filter(isFullyContained).length;

/** How many carry a dedicated aipe adapter (contain-ready or not). */
export const ADAPTER_COUNT = COMPAT_HARNESSES.filter((h) => h.adapter !== null).length;

/**
 * Guard: the site's contained set must never drift from the pricer's domain
 * truth. If aipe/src/harness flips a `containmentHook()`, `HARNESSES[...]`
 * changes, `isSessionEligible` changes, and this stays in lockstep because the
 * adapter rows read it directly. The compat test asserts exactly this.
 */
export function containedAdapterIds(): HarnessId[] {
  return (Object.keys(HARNESSES) as HarnessId[]).filter(isSessionEligible);
}
