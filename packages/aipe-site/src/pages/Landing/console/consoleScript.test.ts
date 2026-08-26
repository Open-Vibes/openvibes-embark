import { describe, it, expect } from "bun:test";
import {
  buildFacts,
  buildConsoleSpecialists,
  consoleWaves,
  sameBatchVerdict,
  evidenceGateOutcome,
  qaGateOutcome,
  AIPE_UNIT_TASK,
  JOURNEY,
} from "./consoleScript";
import { matchSummary } from "../../../domain/skillMatch";

describe("consoleScript — the proven derivations survive, still derived not hand-set", () => {
  it("prices the real envelopes (Lawson 64/GATED, Viola 8/ungated)", () => {
    const [lawson, viola] = buildConsoleSpecialists();
    expect(lawson?.envelope.costIndex).toBe(64);
    expect(lawson?.envelope.gated).toBe(true);
    expect(viola?.envelope.costIndex).toBe(8);
    expect(viola?.envelope.gated).toBe(false);
  });

  it("the law rejects the two same-package units in one batch", () => {
    const verdict = sameBatchVerdict();
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) expect(verdict.reason).toBe("same-package openvibes-embark/aipe-site");
  });

  it("serializes into two waves — Lawson then Viola", () => {
    const waves = consoleWaves();
    expect(waves.length).toBe(2);
    const [lawson, viola] = buildConsoleSpecialists();
    expect(lawson?.wave).toBe(0);
    expect(viola?.wave).toBe(1);
  });

  it("routes the aipe-site unit (frontend · large) to the sdd-lite floor only", () => {
    expect(AIPE_UNIT_TASK).toEqual({ taskType: "frontend", size: "large" });
    expect(matchSummary(AIPE_UNIT_TASK).routed).toEqual(["sdd-lite"]);
  });

  it("the ledger gates fold: evidence-required, then qa-gate", () => {
    expect(evidenceGateOutcome().accepted).toBe(false);
    expect(evidenceGateOutcome().gateCode).toBe("evidence-required");
    expect(qaGateOutcome().accepted).toBe(false);
    expect(qaGateOutcome().gateCode).toBe("qa-gate");
  });
});

describe("consoleScript — buildFacts bundles the whole derived truth", () => {
  it("carries the demand, coordinator, journey, both specialists and the derived gates", () => {
    const facts = buildFacts();
    expect(facts.journey).toBe(JOURNEY);
    expect(facts.coordinator).toBe("Heisenberg");
    expect(facts.demand.author).toBe("PE");
    expect(facts.specialists.map((s) => s.persona)).toEqual(["Lawson", "Viola"]);
    expect(facts.skill.routed).toEqual(["sdd-lite"]);
    expect(facts.law.ok).toBe(false);
  });
});
