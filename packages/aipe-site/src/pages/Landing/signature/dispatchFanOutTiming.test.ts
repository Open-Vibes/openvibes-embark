import { describe, it, expect } from "bun:test";
import { MAX_CONCURRENT } from "../../../domain/dispatchLaw";
import {
  FANOUT_UNITS,
  HOLD_STEPS,
  LIFECYCLE,
  WAVE_STRIDE,
  isInFlight,
  mergedCount,
  peakConcurrency,
  phaseAt,
  placeUnits,
  runningCount,
} from "./dispatchFanOutTiming";

describe("placeUnits — derived from the real dispatch law", () => {
  it("puts the five distinct packages in wave 0 (parallel)", () => {
    const { waves } = placeUnits();
    expect(waves[0]?.units.length).toBe(5);
  });

  it("serializes the duplicate web/aipe-site into wave 1", () => {
    const { waves } = placeUnits();
    expect(waves.length).toBe(2);
    expect(waves[1]?.units.length).toBe(1);
    expect(waves[1]?.units[0]).toEqual({ repo: "web", package: "aipe-site" });
  });

  it("places the two web/aipe-site units in different waves, same key", () => {
    const { placed } = placeUnits();
    const pair = placed.filter((p) => p.key === "web/aipe-site");
    expect(pair.length).toBe(2);
    expect(pair[0]?.wave).toBe(0);
    expect(pair[1]?.wave).toBe(1);
  });

  it("keeps one row per listed unit, in order", () => {
    const { placed } = placeUnits();
    expect(placed.length).toBe(FANOUT_UNITS.length);
    expect(placed.map((p) => p.row)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("computes loopSteps = maxWave*stride + lifecycle + hold", () => {
    const { loopSteps } = placeUnits();
    expect(loopSteps).toBe(1 * WAVE_STRIDE + LIFECYCLE.length + HOLD_STEPS);
  });
});

describe("phaseAt — serialize is visible on the clock", () => {
  it("wave-0 unit is dispatched at step 0 while the wave-1 unit still waits", () => {
    const { placed } = placeUnits();
    const first = placed.find((p) => p.wave === 0)!;
    const waiter = placed.find((p) => p.wave === 1)!;
    expect(phaseAt(first, 0)).toBe("dispatched");
    expect(phaseAt(waiter, 0)).toBe("pending");
  });

  it("the wave-1 unit only becomes dispatched once wave 0 has merged", () => {
    const { placed } = placeUnits();
    const first = placed.find((p) => p.wave === 0)!;
    const waiter = placed.find((p) => p.wave === 1)!;
    // At the stride boundary: wave 0 merged, wave 1 just dispatched.
    expect(phaseAt(first, WAVE_STRIDE)).toBe("merged");
    expect(phaseAt(waiter, WAVE_STRIDE)).toBe("dispatched");
    expect(phaseAt(waiter, WAVE_STRIDE - 1)).toBe("pending");
  });

  it("walks the full lifecycle in order for a wave-0 unit", () => {
    const { placed } = placeUnits();
    const first = placed.find((p) => p.wave === 0)!;
    expect(LIFECYCLE.map((_, i) => phaseAt(first, i))).toEqual([...LIFECYCLE]);
  });
});

describe("the concurrency cap of 16 is respected and never faked", () => {
  it("running count never exceeds MAX_CONCURRENT at any step", () => {
    const { placed, loopSteps } = placeUnits();
    for (let step = 0; step < loopSteps; step++) {
      expect(runningCount(placed, step)).toBeLessThanOrEqual(MAX_CONCURRENT);
    }
  });

  it("peak concurrency is the 5 parallel units — far under the ceiling", () => {
    const { placed, loopSteps } = placeUnits();
    const peak = peakConcurrency(placed, loopSteps);
    expect(peak).toBe(5);
    expect(peak).toBeLessThan(MAX_CONCURRENT);
  });

  it("only one unit runs while the serialized wave is in flight", () => {
    const { placed } = placeUnits();
    expect(runningCount(placed, WAVE_STRIDE)).toBe(1);
  });
});

describe("mergedCount — the loop completes", () => {
  it("reaches all units merged during the trailing hold", () => {
    const { placed, loopSteps } = placeUnits();
    expect(mergedCount(placed, loopSteps - 1)).toBe(FANOUT_UNITS.length);
  });
});

describe("isInFlight", () => {
  it("is true only between dispatched and verified", () => {
    expect(isInFlight("pending")).toBe(false);
    expect(isInFlight("dispatched")).toBe(true);
    expect(isInFlight("running")).toBe(true);
    expect(isInFlight("verified")).toBe(true);
    expect(isInFlight("merged")).toBe(false);
  });
});
