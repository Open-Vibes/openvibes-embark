/**
 * The parallel-dispatch law — the one law the coordinator can't break.
 * Traceable to src/dispatch/types.ts (MAX_CONCURRENT, SESSION_MAX_CONCURRENT)
 * and src/dispatch/law.ts (serialization + reject reasons).
 *
 * - The same *package* (unit of work) must not appear twice in one batch:
 *   same-unit work SERIALIZES. A package-less unit is the implicit whole-repo
 *   package, keyed by the bare repo name.
 * - Distinct packages / distinct repos run in PARALLEL.
 * - No more than MAX_CONCURRENT (16) run at once; session mode has its own
 *   lower cap SESSION_MAX_CONCURRENT (4).
 * - Session mode requires a containable harness, else `harness-not-containable`.
 * The law never reorders — a batch is lawful as proposed, or rejected.
 */

import { HARNESSES, type HarnessId } from "./harness";

export const MAX_CONCURRENT = 16;
export const SESSION_MAX_CONCURRENT = 4;

export type DispatchMode = "subagent" | "session";

export interface DispatchUnit {
  repo: string;
  /** Undefined => the implicit whole-repo package. */
  package?: string;
  /** Defaults to "subagent". */
  mode?: DispatchMode;
  /** Session mode only: which harness runs it. */
  harness?: HarnessId;
}

export type LawResult =
  | { ok: true; batch: number }
  | { ok: false; reason: string };

/** The unit's serialization key: `repo/package`, or the bare repo when package-less. */
export function packageKey(u: DispatchUnit): string {
  return u.package ? `${u.repo}/${u.package}` : u.repo;
}

function isBareRepo(u: DispatchUnit): boolean {
  return u.package === undefined || u.package === "";
}

/**
 * Adjudicate a batch. Deterministic check order so the returned reason is
 * stable: same-package first (in listed order), then the concurrency caps, then
 * per-unit harness containment.
 */
export function validateBatch(units: DispatchUnit[]): LawResult {
  // 1. Serialization: no duplicate package key.
  const seen = new Set<string>();
  for (const u of units) {
    const key = packageKey(u);
    if (seen.has(key)) {
      return { ok: false, reason: isBareRepo(u) ? `same-repo ${u.repo}` : `same-package ${key}` };
    }
    seen.add(key);
  }

  // 2. Overall concurrency cap.
  if (units.length > MAX_CONCURRENT) {
    return { ok: false, reason: `cap-exceeded ${units.length}` };
  }

  // 3. Session-mode cap.
  const sessionUnits = units.filter((u) => u.mode === "session");
  if (sessionUnits.length > SESSION_MAX_CONCURRENT) {
    return { ok: false, reason: `session-cap-exceeded ${sessionUnits.length}` };
  }

  // 4. Session-mode harness containment.
  for (const u of sessionUnits) {
    if (u.harness && !HARNESSES[u.harness].containable) {
      return { ok: false, reason: `harness-not-containable ${u.harness}` };
    }
  }

  return { ok: true, batch: units.length };
}

export interface Wave {
  index: number;
  units: DispatchUnit[];
}

/**
 * Sequence desired dispatches into lawful waves for the fan-out visualisation:
 * units on the same package go to *different* waves (serialize); distinct
 * packages share a wave up to `cap`. Preserves input order (the law never
 * reorders); this only assigns each unit the earliest wave that stays lawful.
 */
export function scheduleWaves(units: DispatchUnit[], cap: number = MAX_CONCURRENT): Wave[] {
  const effectiveCap = Math.max(1, Math.min(cap, MAX_CONCURRENT));
  const waves: { keys: Set<string>; units: DispatchUnit[] }[] = [];

  for (const u of units) {
    const key = packageKey(u);
    let placed = false;
    for (const wave of waves) {
      if (!wave.keys.has(key) && wave.units.length < effectiveCap) {
        wave.keys.add(key);
        wave.units.push(u);
        placed = true;
        break;
      }
    }
    if (!placed) {
      waves.push({ keys: new Set([key]), units: [u] });
    }
  }

  return waves.map((w, index) => ({ index, units: w.units }));
}
