import { describe, it, expect } from "bun:test";
import {
  buildConsole,
  buildConsoleSpecialists,
  buildSteps,
  sameBatchVerdict,
  consoleWaves,
  AIPE_UNIT_TASK,
  evidenceGateOutcome,
  qaGateOutcome,
  JOURNEY,
} from "./consoleScript";
import { matchSummary } from "../../../domain/skillMatch";

describe("consoleScript — the left↔right binding is total and bijective", () => {
  const steps = buildSteps();

  it("every step carries a meaning with the SAME id (1:1)", () => {
    for (const step of steps) {
      expect(step.meaning.id).toBe(step.id);
    }
  });

  it("no meaning is shared or orphaned — ids are unique across steps and meanings", () => {
    const stepIds = steps.map((s) => s.id);
    const meaningIds = steps.map((s) => s.meaning.id);
    expect(new Set(stepIds).size).toBe(stepIds.length);
    expect(new Set(meaningIds).size).toBe(meaningIds.length);
    expect(new Set(meaningIds)).toEqual(new Set(stepIds));
  });

  it("buildConsole exposes a meaningById lookup covering exactly the steps", () => {
    const model = buildConsole();
    expect(model.meaningById.size).toBe(model.steps.length);
    for (const step of model.steps) {
      expect(model.meaningById.get(step.id)).toBe(step.meaning);
    }
  });

  it("every step has at least one left-pane terminal line", () => {
    for (const step of steps) {
      expect(step.terminal.lines.length).toBeGreaterThan(0);
    }
  });
});

describe("consoleScript — opens on the demand, closes on the verify lint", () => {
  const steps = buildSteps();
  it("first step is the demand, last is the journey-verify", () => {
    expect(steps[0]?.meaning.kind).toBe("demand");
    expect(steps.at(-1)?.meaning.kind).toBe("verify");
  });
});

describe("consoleScript — every fact is derived, not hand-set", () => {
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

  it("the law step's terminal output carries the derived reject reason verbatim", () => {
    const lawStep = buildSteps().find((s) => s.meaning.kind === "law");
    const reason = sameBatchVerdict();
    const rejectText = lawStep?.terminal.lines.map((l) => l.text).join("\n") ?? "";
    if (!reason.ok) expect(rejectText).toContain(reason.reason);
  });

  it("routes the aipe-site unit (frontend · large) to the sdd-lite floor only", () => {
    expect(AIPE_UNIT_TASK).toEqual({ taskType: "frontend", size: "large" });
    expect(matchSummary(AIPE_UNIT_TASK).routed).toEqual(["sdd-lite"]);
  });
});

describe("consoleScript — the ledger gates fold in and hold", () => {
  it("a delivery with no evidence is rejected (evidence-required)", () => {
    const outcome = evidenceGateOutcome();
    expect(outcome.accepted).toBe(false);
    expect(outcome.gateCode).toBe("evidence-required");
  });

  it("a merge before verification is held by the QA gate", () => {
    const outcome = qaGateOutcome();
    expect(outcome.accepted).toBe(false);
    expect(outcome.gateCode).toBe("qa-gate");
  });
});

describe("consoleScript — the model wires together", () => {
  it("carries the demand, coordinator, journey and both specialists", () => {
    const model = buildConsole();
    expect(model.journey).toBe(JOURNEY);
    expect(model.coordinator).toBe("Heisenberg");
    expect(model.demand.author).toBe("PE");
    expect(model.specialists.map((s) => s.persona)).toEqual(["Lawson", "Viola"]);
    expect(model.steps.length).toBeGreaterThan(8);
  });

  it("advances the ledger ramp through dispatched → delivered → verified → merged", () => {
    const statuses = buildSteps()
      .map((s) => s.meaning.status)
      .filter(Boolean);
    expect(statuses).toContain("dispatched");
    expect(statuses).toContain("delivered");
    expect(statuses).toContain("verified");
    expect(statuses).toContain("merged");
    // the ramp is monotonic in lifecycle order where present
    const order = ["dispatched", "delivered", "verified", "merged"];
    const seen = statuses.filter((s) => order.includes(s as string));
    const ranks = seen.map((s) => order.indexOf(s as string));
    for (let i = 1; i < ranks.length; i++) expect(ranks[i]!).toBeGreaterThanOrEqual(ranks[i - 1]!);
  });
});
