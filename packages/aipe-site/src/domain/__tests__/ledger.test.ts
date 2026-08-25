import { describe, it, expect } from "bun:test";
import {
  evaluateAttempt,
  reduceLedger,
  LEDGER_SCENARIOS,
  type Evidence,
} from "../ledger";

const dev: Evidence = { by: "dev", commands: ["bun test"], summary: "green" };
const qa: Evidence = { by: "qa", commands: ["bun test"], summary: "green against the diff" };

describe("evaluateAttempt — the evidence gate", () => {
  it("REJECTs delivered with no evidence", () => {
    const r = evaluateAttempt("dispatched", { status: "delivered" });
    expect(r.accepted).toBe(false);
    expect(r.gateCode).toBe("evidence-required");
    expect(r.status).toBe("dispatched");
  });

  it("REJECTs delivered with empty evidence", () => {
    const r = evaluateAttempt("dispatched", {
      status: "delivered",
      evidence: { by: "dev", commands: [], summary: "" },
    });
    expect(r.gateCode).toBe("evidence-required");
  });

  it("accepts delivered with real evidence", () => {
    const r = evaluateAttempt("dispatched", { status: "delivered", evidence: dev });
    expect(r.accepted).toBe(true);
    expect(r.status).toBe("delivered");
  });

  it("REJECTs verified that carries only the dev's evidence", () => {
    const r = evaluateAttempt("delivered", { status: "verified", evidence: dev });
    expect(r.accepted).toBe(false);
    expect(r.gateCode).toBe("evidence-required");
  });

  it("accepts verified with the QA's own evidence", () => {
    const r = evaluateAttempt("delivered", { status: "verified", evidence: qa });
    expect(r.accepted).toBe(true);
  });
});

describe("evaluateAttempt — the QA gate (a process gate, not a ledger reject code)", () => {
  it("holds a merge straight from delivered", () => {
    const r = evaluateAttempt("delivered", { status: "merged" });
    expect(r.accepted).toBe(false);
    expect(r.gateCode).toBe("qa-gate");
    // Crucial truthfulness distinction: the QA gate is enforced by the operate
    // flow, NOT by one of the ledger's own reject codes.
    expect(r.gateKind).toBe("process");
    expect(r.status).toBe("delivered");
  });

  it("allows merged once verified", () => {
    const r = evaluateAttempt("verified", { status: "merged" });
    expect(r.accepted).toBe(true);
    expect(r.status).toBe("merged");
  });
});

describe("evaluateAttempt — the ledger's own gates are marked ledger-kind", () => {
  it("tags the evidence gate as a ledger reject", () => {
    const r = evaluateAttempt("dispatched", { status: "delivered" });
    expect(r.gateCode).toBe("evidence-required");
    expect(r.gateKind).toBe("ledger");
  });

  it("tags immutability as a ledger reject", () => {
    const r = evaluateAttempt("merged", { status: "dispatched" });
    expect(r.gateCode).toBe("unit-immutable");
    expect(r.gateKind).toBe("ledger");
  });
});

describe("evaluateAttempt — immutability & reasons", () => {
  it("REJECTs re-dispatching a merged unit", () => {
    const r = evaluateAttempt("merged", { status: "dispatched" });
    expect(r.gateCode).toBe("unit-immutable");
  });

  it("allows removed (teardown) after merged", () => {
    expect(evaluateAttempt("merged", { status: "removed" }).accepted).toBe(true);
  });

  it("REJECTs reopening a verified unit without a reason", () => {
    const r = evaluateAttempt("verified", { status: "dispatched" });
    expect(r.gateCode).toBe("redispatch-needs-reason");
  });

  it("allows reopening with a reason", () => {
    expect(evaluateAttempt("verified", { status: "dispatched", reason: "regression found" }).accepted).toBe(true);
  });

  it("REJECTs a redirect with no reason", () => {
    expect(evaluateAttempt("dispatched", { status: "redirected" }).gateCode).toBe("redirect-needs-reason");
  });
});

describe("reduceLedger — scenarios", () => {
  it("happy path ends merged with every frame accepted", () => {
    const happy = LEDGER_SCENARIOS.find((s) => s.id === "happy")!;
    const frames = reduceLedger(happy.attempts);
    expect(frames.every((f) => f.accepted)).toBe(true);
    expect(frames.at(-1)?.status).toBe("merged");
  });

  it("no-evidence scenario shows exactly one REJECT then recovers", () => {
    const scenario = LEDGER_SCENARIOS.find((s) => s.id === "no-evidence")!;
    const frames = reduceLedger(scenario.attempts);
    const rejects = frames.filter((f) => !f.accepted);
    expect(rejects).toHaveLength(1);
    expect(rejects[0]?.gateCode).toBe("evidence-required");
    expect(frames.at(-1)?.status).toBe("verified");
  });

  it("merge-without-qa scenario blocks the early merge then merges after QA", () => {
    const scenario = LEDGER_SCENARIOS.find((s) => s.id === "merge-without-qa")!;
    const frames = reduceLedger(scenario.attempts);
    const blocked = frames.find((f) => f.gateCode === "qa-gate");
    expect(blocked).toBeDefined();
    expect(frames.at(-1)?.status).toBe("merged");
    expect(frames.at(-1)?.accepted).toBe(true);
  });
});
