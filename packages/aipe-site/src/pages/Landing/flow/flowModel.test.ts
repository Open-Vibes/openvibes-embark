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

  it("each agent's own joinPhase is one of the three dispatch beats, in seed order", () => {
    expect(facts.agents.map((a) => a.joinPhase)).toEqual(["dispatch-1", "dispatch-2", "dispatch-3"]);
  });
});

describe("flow fold — cumulative, and complete at the end", () => {
  it("opens with only the coordinator, no agents, no QA, no PRs on screen", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("demand"));
    expect(s.coordinator).toBe(true);
    expect(s.validated).toBe(false);
    expect(s.groups).toHaveLength(0);
    expect(s.qa.visible).toBe(false);
    expect(s.ledger).toHaveLength(0);
    expect(s.entityCount).toBe(0);
  });

  it("the law validates before any agent is placed — still zero agents on screen", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("validate"));
    expect(s.validated).toBe(true);
    expect(s.verdict.ok).toBe(true);
    expect(s.verdict.repos).toBe(2);
    expect(s.groups.flatMap((g) => g.agents)).toHaveLength(0);
    expect(s.entityCount).toBe(0);
  });

  it("agent 1 enters ALONE at dispatch-1 (one repo, one agent — not all three)", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("dispatch-1"));
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents).toHaveLength(1);
    expect(agents[0]!.id).toBe("lawson");
    expect(s.entityCount).toBe(1);
  });

  it("agent 2 joins at dispatch-2 — two agents, still one repo (both openvibes-embark)", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("dispatch-2"));
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents.map((a) => a.id).sort()).toEqual(["lawson", "marco"]);
    expect(s.groups).toHaveLength(1);
    expect(s.entityCount).toBe(2);
  });

  it("agent 3 joins at dispatch-3 — all three agents, both repos, at once", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("dispatch-3"));
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents).toHaveLength(3);
    expect(s.groups).toHaveLength(2);
    expect(new Set(agents.map((a) => a.repo)).size).toBe(2);
    expect(s.entityCount).toBe(3);
  });

  it("runs all three in parallel on work (none queued behind another)", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("work"));
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents.every((a) => a.state === "running")).toBe(true);
    expect(agents.every((a) => a.worktree)).toBe(true);
    expect(s.ledger).toContain("dispatched");
  });

  it("QA enters as a NEW actor at the qa beat, after delivery — never before", () => {
    const deliver = foldFlow(FLOW_PHASE_IDS.indexOf("deliver"));
    expect(deliver.qa.visible).toBe(false);
    expect(deliver.groups.flatMap((g) => g.agents).every((a) => a.state === "delivered")).toBe(true);
    expect(deliver.ledger).toContain("delivered");
    expect(deliver.ledger).not.toContain("verified");

    const qa = foldFlow(FLOW_PHASE_IDS.indexOf("qa"));
    expect(qa.qa.visible).toBe(true);
    expect(qa.groups.flatMap((g) => g.agents).every((a) => a.state === "verified")).toBe(true);
    expect(qa.ledger).toContain("verified");
    // QA's entrance alone grows the scene beyond the 3 agents.
    expect(qa.entityCount).toBeGreaterThan(deliver.entityCount);
  });

  it("each PR is a NEW artifact that appears at the pr beat, none before", () => {
    const qa = foldFlow(FLOW_PHASE_IDS.indexOf("qa"));
    expect(qa.groups.flatMap((g) => g.agents).every((a) => a.prVisible)).toBe(false);

    const pr = foldFlow(FLOW_PHASE_IDS.indexOf("pr"));
    const agents = pr.groups.flatMap((g) => g.agents);
    expect(agents.every((a) => a.prVisible)).toBe(true);
    expect(pr.entityCount).toBeGreaterThan(qa.entityCount);
  });

  it("the LAST phase is the complete, settled frame (the reduced-motion still)", () => {
    const s = foldFlow(FLOW_LAST_PHASE);
    expect(s.settled).toBe(true);
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents).toHaveLength(3);
    expect(agents.every((a) => a.state === "merged")).toBe(true);
    expect(agents.every((a) => a.prVisible)).toBe(true);
    expect(s.qa.visible).toBe(true);
    // Every ledger station is lit — no information is missing from the still frame.
    expect(s.ledger).toEqual(["dispatched", "delivered", "verified", "merged"]);
  });

  it("clamps out-of-range indices instead of throwing", () => {
    expect(foldFlow(-5).phase).toBe("demand");
    expect(foldFlow(999).phase).toBe("merged");
  });

  it("PROVES the progression: entityCount strictly grows across many distinct beats, not just the final frame", () => {
    // This is the crux of the PE's rejection of v2: a check that only reads the
    // last frame would pass a scene where all actors were present from frame 0.
    // Sampling ≥3 distinct instants and asserting growth is what tells them apart.
    const samples: { phase: FlowPhaseId; count: number }[] = FLOW_PHASE_IDS.map((phase) => ({
      phase,
      count: foldFlow(FLOW_PHASE_IDS.indexOf(phase)).entityCount,
    }));

    // Never shrinks — once an actor/artifact is on screen, it stays.
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]!.count).toBeGreaterThanOrEqual(samples[i - 1]!.count);
    }

    // At least 3 distinct instants where it strictly grows (the PE's bar).
    const growthPoints = samples.filter((s, i) => i > 0 && s.count > samples[i - 1]!.count);
    expect(growthPoints.length).toBeGreaterThanOrEqual(3);

    // The empty open and the full close are unambiguous, distinct pictures.
    expect(samples[0]!.count).toBe(0);
    expect(samples.at(-1)!.count).toBeGreaterThanOrEqual(7);
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

  it("names each agent's fqid on ITS OWN dispatch beat, not all three at once", () => {
    for (const [i, a] of facts.agents.entries()) {
      const phase = `dispatch-${i + 1}` as const;
      const own = lines.filter((l) => l.phase === phase);
      expect(own.some((l) => l.text.includes(a.fqid))).toBe(true);
      // No other agent's fqid leaks into this beat's lines.
      for (const other of facts.agents) {
        if (other.id === a.id) continue;
        expect(own.some((l) => l.text.includes(other.fqid))).toBe(false);
      }
    }
  });

  it("each PR opens on its own pr-beat line, naming the real PR number", () => {
    const prLines = lines.filter((l) => l.phase === "pr");
    for (const a of facts.agents) {
      expect(prLines.some((l) => l.text.includes(`#${a.pr}`))).toBe(true);
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
    const order: FlowPhaseId[] = [
      "demand",
      "validate",
      "dispatch-1",
      "dispatch-2",
      "dispatch-3",
      "work",
      "deliver",
      "qa",
      "pr",
      "merged",
    ];
    expect(FLOW_PHASE_IDS).toEqual(order);
  });

  it("every phase has a positive dwell", () => {
    expect(FLOW_PHASES.every((p) => p.ms > 0)).toBe(true);
  });
});
