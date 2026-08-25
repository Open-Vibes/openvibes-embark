/**
 * Timing model for the Dispatch Fan-Out hero animation.
 *
 * This module holds the *only* non-trivial logic in the component: it maps the
 * lawful waves returned by `scheduleWaves` onto an animation clock so the
 * serialize/parallel behaviour on screen is derived from the real dispatch law,
 * not hand-authored. It is pure and framework-free, so it is unit-tested with
 * `bun test`.
 */

import {
  packageKey,
  scheduleWaves,
  type DispatchUnit,
  type Wave,
} from "../../../domain/dispatchLaw";
import type { StateKey } from "../../../domain/states";

/**
 * Illustrative batch driving the visual. Five distinct packages fan out in
 * parallel; the trailing `web/aipe-site` is a duplicate of the first unit, so
 * the law forces it into a *later* wave — it must serialize behind the first.
 */
export const FANOUT_UNITS: readonly DispatchUnit[] = [
  { repo: "web", package: "aipe-site" },
  { repo: "api" },
  { repo: "infra" },
  { repo: "web", package: "docs" },
  { repo: "runner" },
  { repo: "web", package: "aipe-site" }, // duplicate key → serializes into wave 1
];

/** The lifecycle a specialist walks, in order. `merged` is terminal. */
export const LIFECYCLE: readonly StateKey[] = [
  "dispatched",
  "running",
  "delivered",
  "verified",
  "merged",
];

/**
 * Steps between consecutive wave starts. A wave reaches `merged` after
 * exactly `LIFECYCLE.length` steps, so a stride of that length means the next
 * wave is `dispatched` on the same step the previous wave `merged` — the
 * serialization is visible, not implied.
 */
export const WAVE_STRIDE = LIFECYCLE.length;

/** Extra steps holding the all-merged frame before the loop restarts. */
export const HOLD_STEPS = 2;

/** A specialist is either not-yet-dispatched (`pending`) or in a real state. */
export type Phase = "pending" | StateKey;

export interface PlacedUnit {
  /** Stable identity for React keys and framer-motion. */
  id: string;
  unit: DispatchUnit;
  /** Serialization key, e.g. `web/aipe-site` or the bare repo. */
  key: string;
  /** Which lawful wave the unit landed in (0 = first, parallel wave). */
  wave: number;
  /** Vertical slot across all waves, in listed order. */
  row: number;
}

export interface Placement {
  waves: Wave[];
  placed: PlacedUnit[];
  /** Total steps in one loop, including the trailing hold. */
  loopSteps: number;
}

/** Assign each unit its lawful wave and a stable row, using the real law. */
export function placeUnits(units: readonly DispatchUnit[] = FANOUT_UNITS): Placement {
  const waves = scheduleWaves([...units]);

  const waveOf = new Map<DispatchUnit, number>();
  for (const wave of waves) {
    for (const unit of wave.units) waveOf.set(unit, wave.index);
  }

  const placed: PlacedUnit[] = units.map((unit, row) => ({
    id: `${packageKey(unit)}#${row}`,
    unit,
    key: packageKey(unit),
    wave: waveOf.get(unit) ?? 0,
    row,
  }));

  const maxWave = waves.length === 0 ? 0 : waves.length - 1;
  const loopSteps = maxWave * WAVE_STRIDE + LIFECYCLE.length + HOLD_STEPS;

  return { waves, placed, loopSteps };
}

/** The phase of one placed unit at a given step of the loop. */
export function phaseAt(placed: PlacedUnit, step: number): Phase {
  const local = step - placed.wave * WAVE_STRIDE;
  if (local < 0) return "pending";
  if (local >= LIFECYCLE.length) return "merged";
  return LIFECYCLE[local]!;
}

/** In-flight = started but not yet merged. This is what the `/ 16` meter counts. */
export function isInFlight(phase: Phase): boolean {
  return phase !== "pending" && phase !== "merged";
}

/** How many specialists are running at `step` — the live meter value. */
export function runningCount(placed: readonly PlacedUnit[], step: number): number {
  return placed.reduce((n, p) => (isInFlight(phaseAt(p, step)) ? n + 1 : n), 0);
}

/** How many specialists have merged at `step` — the coordinator's tally. */
export function mergedCount(placed: readonly PlacedUnit[], step: number): number {
  return placed.reduce((n, p) => (phaseAt(p, step) === "merged" ? n + 1 : n), 0);
}

/** Peak concurrency across the whole loop — the honest number for the static view. */
export function peakConcurrency(placed: readonly PlacedUnit[], loopSteps: number): number {
  let peak = 0;
  for (let step = 0; step < loopSteps; step++) {
    peak = Math.max(peak, runningCount(placed, step));
  }
  return peak;
}
