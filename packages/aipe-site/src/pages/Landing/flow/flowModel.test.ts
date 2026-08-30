import { describe, it, expect } from "bun:test";
import {
  buildFlowFacts,
  buildFlowTerminal,
  flowUnits,
  foldFlow,
  FLOW_PHASES,
  FLOW_PHASE_IDS,
  FLOW_LAST_PHASE,
  FLOW_SCRIPT_EN,
  type FlowPhaseId,
} from "./flowModel";
import { validateBatch, scheduleWaves, packageKey } from "../../../domain/dispatchLaw";

describe("flow facts — parallelism proven by the real law", () => {
  const facts = buildFlowFacts();

  it("is exactly 3 agents across 2 distinct repos (the honest minimum)", () => {
    expect(facts.agents).toHaveLength(3);
    expect(facts.repos).toHaveLength(2);
    expect(new Set(facts.agents.map((a) => a.repo)).size).toBe(2);
  });

  it("the three units have DISTINCT package keys — so nothing serializes", () => {
    const keys = flowUnits().map(packageKey);
    expect(new Set(keys).size).toBe(3);
  });

  it("the real law ACCEPTS the batch (ok) — it is a lawful parallel dispatch", () => {
    const verdict = validateBatch(flowUnits());
    expect(verdict.ok).toBe(true);
    if (verdict.ok) expect(verdict.batch).toBe(3);
  });

  it("the real scheduler lands all three in ONE wave — they run at once", () => {
    const waves = scheduleWaves(flowUnits());
    expect(waves).toHaveLength(1);
    expect(facts.agents.every((a) => a.wave === 0)).toBe(true);
  });

  it("derives the facts through the law, not by hand", () => {
    // If a future edit made two units share a package key, the law would split
    // them into two waves and this guard would fail loudly.
    expect(facts.waves).toHaveLength(1);
    expect(facts.verdict.ok).toBe(true);
  });
});

describe("flow fold — cumulative, and complete at the end", () => {
  it("opens with only the coordinator, no agents placed yet", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("demand"));
    expect(s.coordinator).toBe(true);
    expect(s.validated).toBe(false);
    expect(s.groups.flatMap((g) => g.agents).every((a) => a.state === "idle")).toBe(true);
    expect(s.ledger).toHaveLength(0);
  });

  it("places the agents once the law has validated", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("validate"));
    expect(s.validated).toBe(true);
    expect(s.verdict.ok).toBe(true);
    expect(s.verdict.repos).toBe(2);
    expect(s.groups.flatMap((g) => g.agents)).toHaveLength(3);
    expect(s.groups.flatMap((g) => g.agents).every((a) => a.state === "placed")).toBe(true);
  });

  it("runs all three in parallel on dispatch (none queued behind another)", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("dispatch"));
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents.every((a) => a.state === "running")).toBe(true);
    expect(agents.every((a) => a.worktree)).toBe(true);
    expect(s.ledger).toContain("dispatched");
  });

  it("review arrives AFTER delivery, never before (deliver → verified order)", () => {
    const deliver = foldFlow(FLOW_PHASE_IDS.indexOf("deliver"));
    const review = foldFlow(FLOW_PHASE_IDS.indexOf("review"));
    expect(deliver.groups.flatMap((g) => g.agents).every((a) => a.state === "delivered")).toBe(true);
    expect(deliver.ledger).toContain("delivered");
    expect(deliver.ledger).not.toContain("verified");
    expect(review.groups.flatMap((g) => g.agents).every((a) => a.state === "verified")).toBe(true);
    expect(review.ledger).toContain("verified");
  });

  it("the LAST phase is the complete, settled frame (the reduced-motion still)", () => {
    const s = foldFlow(FLOW_LAST_PHASE);
    expect(s.settled).toBe(true);
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents).toHaveLength(3);
    expect(agents.every((a) => a.state === "merged")).toBe(true);
    // Every ledger station is lit — no information is missing from the still frame.
    expect(s.ledger).toEqual(["dispatched", "delivered", "verified", "merged"]);
  });

  it("clamps out-of-range indices instead of throwing", () => {
    expect(foldFlow(-5).phase).toBe("demand");
    expect(foldFlow(999).phase).toBe("merged");
  });
});

describe("flow terminal — reveals per phase, states the parallel truth", () => {
  const facts = buildFlowFacts();
  const lines = buildFlowTerminal(facts);

  it("prints the real 'parallel' verdict with the derived unit/repo/wave counts", () => {
    const verdictLine = lines.find((l) => l.text.includes("parallel"));
    expect(verdictLine).toBeDefined();
    expect(verdictLine!.text).toContain("3 units");
    expect(verdictLine!.text).toContain("2 repos");
    expect(verdictLine!.text).toContain("wave 1");
  });

  it("names all three fqids as running (the dispatch is visible in the log)", () => {
    const dispatch = lines.filter((l) => l.phase === "dispatch");
    for (const a of facts.agents) {
      expect(dispatch.some((l) => l.text.includes(a.fqid))).toBe(true);
    }
  });

  it("keeps literal aipe commands English (command/speech boundary)", () => {
    const cmd = lines.find((l) => l.text.startsWith("$ aipe dispatch validate"));
    expect(cmd).toBeDefined();
    // A command line carries no narration prose that would ever be translated.
    expect(cmd!.text).not.toContain(FLOW_SCRIPT_EN.demand);
  });
});

describe("flow phases — a bounded arc, not an endless jitter", () => {
  it("is a single ordered pass ending on the settled merge", () => {
    expect(FLOW_PHASES.at(-1)!.id).toBe("merged");
    const order: FlowPhaseId[] = ["demand", "validate", "dispatch", "work", "deliver", "review", "merged"];
    expect(FLOW_PHASE_IDS).toEqual(order);
  });

  it("every phase has a positive dwell", () => {
    expect(FLOW_PHASES.every((p) => p.ms > 0)).toBe(true);
  });
});
