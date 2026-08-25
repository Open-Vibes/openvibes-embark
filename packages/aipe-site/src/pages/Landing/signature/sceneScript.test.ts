import { describe, it, expect } from "bun:test";
import {
  buildScene,
  buildBeats,
  buildSpecialists,
  specialistPhaseAt,
  runningCountAt,
  peakRunning,
  sameBatchVerdict,
  pricedEnvelopeFor,
  REASONING,
  MAX_CONCURRENT,
  SESSION_MAX_CONCURRENT,
} from "./sceneScript";

describe("sceneScript — the law is derived, not hand-set", () => {
  it("serializes Lawson and Viola into consecutive waves (same package)", () => {
    const [lawson, viola] = buildSpecialists();
    expect(lawson?.wave).toBe(0);
    expect(viola?.wave).toBe(1);
  });

  it("the two same-package units are rejected in one batch by the real law", () => {
    const verdict = sameBatchVerdict();
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.reason).toBe("same-package openvibes-embark/aipe-site");
    }
  });

  it("prices the envelopes with the real cost model (Lawson 64/gated, Viola 8/ungated)", () => {
    const [lawson, viola] = buildSpecialists();
    expect(lawson?.envelope.costIndex).toBe(64);
    expect(lawson?.envelope.gated).toBe(true);
    expect(viola?.envelope.costIndex).toBe(8);
    expect(viola?.envelope.gated).toBe(false);
  });
});

describe("sceneScript — causality: every specialist traces to a reasoning line", () => {
  it("each specialist's fromReasoningId exists in the reasoning", () => {
    const ids = new Set(REASONING.map((r) => r.id));
    for (const s of buildSpecialists()) {
      expect(ids.has(s.fromReasoningId)).toBe(true);
    }
  });
});

describe("sceneScript — beats are ordered by act and never regress", () => {
  const beats = buildBeats();

  it("act numbers are non-decreasing (each act lands before the next)", () => {
    for (let i = 1; i < beats.length; i++) {
      expect(beats[i]!.act).toBeGreaterThanOrEqual(beats[i - 1]!.act);
    }
  });

  it("opens on the demand and closes on the ledger", () => {
    expect(beats[0]?.kind).toBe("demand");
    expect(beats.at(-1)?.kind).toBe("ledger");
  });

  it("every reasoning line has its own beat", () => {
    for (const r of REASONING) {
      expect(beats.some((b) => b.kind === "reason" && b.refId === r.id)).toBe(true);
    }
  });

  it("beat ids are unique", () => {
    const ids = beats.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("sceneScript — concurrency stays lawful and shows the serialize", () => {
  const beats = buildBeats();
  const ids = ["lawson", "viola"];

  it("the two never run at once — peak running is 1, well under the caps", () => {
    const peak = peakRunning(beats, ids);
    expect(peak).toBe(1);
    expect(peak).toBeLessThanOrEqual(SESSION_MAX_CONCURRENT);
    expect(peak).toBeLessThanOrEqual(MAX_CONCURRENT);
  });

  it("Viola is queued (serialized) while Lawson is still running", () => {
    const spawnViola = beats.findIndex((b) => b.id === "spawn-viola");
    expect(specialistPhaseAt(beats, "lawson", spawnViola)).toBe("running");
    expect(specialistPhaseAt(beats, "viola", spawnViola)).toBe("queued");
    expect(runningCountAt(beats, ids, spawnViola)).toBe(1);
  });

  it("Viola only runs after Lawson has delivered (the QA gate)", () => {
    const qa = beats.findIndex((b) => b.id === "qa-gate");
    expect(specialistPhaseAt(beats, "lawson", qa)).toBe("delivered");
    expect(specialistPhaseAt(beats, "viola", qa)).toBe("running");
  });

  it("ends with Lawson delivered and Viola verified", () => {
    const last = beats.length - 1;
    expect(specialistPhaseAt(beats, "lawson", last)).toBe("delivered");
    expect(specialistPhaseAt(beats, "viola", last)).toBe("verified");
  });
});

describe("sceneScript — buildScene wires the whole thing", () => {
  it("returns the demand, the coordinator, reasoning, specialists and beats", () => {
    const scene = buildScene();
    expect(scene.coordinator).toBe("Heisenberg");
    expect(scene.demand.author).toBe("PE");
    expect(scene.specialists.map((s) => s.persona)).toEqual(["Lawson", "Viola"]);
    expect(scene.beats.length).toBeGreaterThan(10);
  });

  it("pricedEnvelopeFor matches a specialist's stored envelope", () => {
    const [lawson] = buildSpecialists();
    const priced = pricedEnvelopeFor(lawson!);
    expect(priced.costIndex).toBe(lawson!.envelope.costIndex);
    expect(priced.gated).toBe(lawson!.envelope.gated);
  });
});
