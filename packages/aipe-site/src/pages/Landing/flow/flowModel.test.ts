import { describe, it, expect } from "bun:test";
import {
  buildFlowFacts,
  buildFlowTerminal,
  deriveQaTeam,
  envelopePool,
  envelopeForActor,
  flowUnits,
  foldFlow,
  summarizeCycle,
  FLOW_PHASES,
  FLOW_PHASE_IDS,
  FLOW_LAST_PHASE,
  FLOW_SCRIPT_EN,
  FLOW_REJECTED_AGENT_ID,
  type FlowPhaseId,
} from "./flowModel";
import { validateBatch, scheduleWaves, packageKey } from "../../../domain/dispatchLaw";
import { HARNESS_IDS, isSessionEligible } from "../../../domain/harness";

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
    expect(facts.waves).toHaveLength(1);
    expect(facts.verdict.ok).toBe(true);
  });

  it("each agent's own joinPhase is one of the three dispatch beats, in seed order", () => {
    expect(facts.agents.map((a) => a.joinPhase)).toEqual(["dispatch-1", "dispatch-2", "dispatch-3"]);
  });
});

/* -------------------------------------------------------- QA per repo, derived */

describe("QA team — derived PER REPO from the real facts, never a fixed headcount", () => {
  it("one QA per distinct repo — 2 repos in, 2 QAs out", () => {
    const facts = buildFlowFacts();
    expect(facts.repos).toHaveLength(2);
    expect(facts.qaTeam).toHaveLength(2);
  });

  it("deriveQaTeam's count tracks the LENGTH of the repo list it's given, generically", () => {
    // This is the anti-hardcode proof: change the number of repos in the input
    // and the number of QAs must follow, for arbitrary repo counts.
    for (const n of [1, 2, 3, 5]) {
      const repos = Array.from({ length: n }, (_, i) => `repo-${i}`);
      expect(deriveQaTeam(repos)).toHaveLength(n);
    }
  });

  it("a batch built from a 3-repo seed derives 3 QAs, and a 1-repo seed derives 1", () => {
    const threeRepoSeed = [
      { id: "a", persona: "A", role: "dev-fullstack", repo: "repo-x", package: "pkg", sessionId: "1" },
      { id: "b", persona: "B", role: "dev-fullstack", repo: "repo-y", package: "pkg", sessionId: "2" },
      { id: "c", persona: "C", role: "dev-fullstack", repo: "repo-z", package: "pkg", sessionId: "3" },
    ];
    const oneRepoSeed = [{ id: "a", persona: "A", role: "dev-fullstack", repo: "repo-x", package: "pkg", sessionId: "1" }];

    expect(buildFlowFacts(threeRepoSeed).qaTeam).toHaveLength(3);
    expect(buildFlowFacts(oneRepoSeed).qaTeam).toHaveLength(1);
  });

  it("each QA is scoped to exactly one repo, and no repo has more than one QA", () => {
    const facts = buildFlowFacts();
    const repoCounts = new Map<string, number>();
    for (const qa of facts.qaTeam) repoCounts.set(qa.repo, (repoCounts.get(qa.repo) ?? 0) + 1);
    for (const count of repoCounts.values()) expect(count).toBe(1);
    expect(new Set(facts.qaTeam.map((q) => q.repo))).toEqual(new Set(facts.repos));
  });
});

/* --------------------------------------------------- harness/tier, from the registry */

describe("actor envelopes — harness+tier come from the REAL registry, not literals", () => {
  it("every default-pool envelope's harness is session-eligible per the real HARNESSES registry", () => {
    const eligible = new Set(HARNESS_IDS.filter(isSessionEligible));
    for (const e of envelopePool()) expect(eligible.has(e.harness)).toBe(true);
  });

  it("changing the harness registry passed in changes the pool — proves it's not hand-set", () => {
    const basePool = envelopePool();
    const widerPool = envelopePool(["claude-code", "gemini", "codex"], ["fast", "standard", "reasoning"]);
    expect(widerPool.length).toBeGreaterThan(basePool.length);
    expect(widerPool.some((e) => e.harness === "codex")).toBe(true);
  });

  it("the flow's actors carry at least THREE distinct harness+tier combinations", () => {
    const facts = buildFlowFacts();
    const combos = new Set([
      ...facts.agents.map((a) => `${a.envelope.harness}:${a.envelope.tier}`),
      ...facts.qaTeam.map((q) => `${q.envelope.harness}:${q.envelope.tier}`),
    ]);
    expect(combos.size).toBeGreaterThanOrEqual(3);
  });

  it("envelopeForActor cycles the pool deterministically (same index → same envelope)", () => {
    expect(envelopeForActor(0)).toEqual(envelopeForActor(0));
    expect(envelopeForActor(0)).not.toEqual(envelopeForActor(1));
  });
});

/* ------------------------------------------------------------- the fold */

describe("flow fold — cumulative, and complete at the end", () => {
  it("opens with only the coordinator, no agents, no QA, no PRs on screen", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("demand"));
    expect(s.coordinator).toBe(true);
    expect(s.validated).toBe(false);
    expect(s.groups).toHaveLength(0);
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

  it("each dev PR opens at pr-dev — a NEW artifact, none before", () => {
    const deliver = foldFlow(FLOW_PHASE_IDS.indexOf("deliver"));
    expect(deliver.groups.flatMap((g) => g.agents).every((a) => a.prDevVisible)).toBe(false);

    const prDev = foldFlow(FLOW_PHASE_IDS.indexOf("pr-dev"));
    const agents = prDev.groups.flatMap((g) => g.agents);
    expect(agents.every((a) => a.prDevVisible)).toBe(true);
    expect(prDev.entityCount).toBeGreaterThan(deliver.entityCount);
  });

  it("QA enters at qa-review, one per repo, after the dev PRs are open", () => {
    const prDev = foldFlow(FLOW_PHASE_IDS.indexOf("pr-dev"));
    expect(prDev.groups.every((g) => g.qa === null)).toBe(true);

    const qaReview = foldFlow(FLOW_PHASE_IDS.indexOf("qa-review"));
    expect(qaReview.groups.every((g) => g.qa !== null)).toBe(true);
    expect(qaReview.groups).toHaveLength(2);
    expect(qaReview.entityCount).toBeGreaterThan(prDev.entityCount);
  });
});

/* --------------------------------------------------- the rejection, the crux */

describe("rejection — visible, and fixed by the SAME dev, never the QA", () => {
  const facts = buildFlowFacts();
  const rejected = facts.agents.find((a) => a.id === FLOW_REJECTED_AGENT_ID)!;
  const rejectedRepoQa = facts.qaTeam.find((q) => q.repo === rejected.repo)!;

  it("the rejected agent exists and its repo's QA persona differs from every dev persona", () => {
    expect(rejected).toBeDefined();
    for (const a of facts.agents) expect(rejectedRepoQa.persona).not.toBe(a.persona);
  });

  it("at qa-reject, the rejected agent's state is 'rejected' — a real, distinct instant", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("qa-reject"), facts);
    const agent = s.groups.flatMap((g) => g.agents).find((a) => a.id === rejected.id)!;
    expect(agent.state).toBe("rejected");
    const group = s.groups.find((g) => g.repo === rejected.repo)!;
    expect(group.qa!.verdict).toBe("rejected");
  });

  it("at dev-fix, the SAME dev (not the QA) is the one shown fixing", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("dev-fix"), facts);
    const agent = s.groups.flatMap((g) => g.agents).find((a) => a.id === rejected.id)!;
    expect(agent.state).toBe("fixing");
    expect(agent.persona).toBe(rejected.persona);
    expect(agent.persona).not.toBe(rejectedRepoQa.persona);
  });

  it("the other two agents (not rejected) are never shown as rejected or fixing", () => {
    for (const phase of ["qa-reject", "dev-fix"] as FlowPhaseId[]) {
      const s = foldFlow(FLOW_PHASE_IDS.indexOf(phase), facts);
      const others = s.groups.flatMap((g) => g.agents).filter((a) => a.id !== rejected.id);
      for (const a of others) expect(a.state === "rejected" || a.state === "fixing").toBe(false);
    }
  });

  it("after qa-approve, the rejected agent is verified — same as everyone else", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("qa-approve"), facts);
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents.every((a) => a.state === "verified")).toBe(true);
    expect(s.groups.every((g) => g.qa!.verdict === "approved")).toBe(true);
  });

  it("a repo with no rejection approves independently, without waiting on the other repo's fix", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("qa-reject"), facts);
    const cleanGroup = s.groups.find((g) => g.repo !== rejected.repo)!;
    expect(cleanGroup.qa!.verdict).toBe("approved");
  });
});

/* --------------------------------------------------------------- the two PRs */

describe("two distinct PRs — the dev PR and the promotion are different artifacts", () => {
  const facts = buildFlowFacts();

  it("promotion PR numbers are disjoint from every agent's dev PR number", () => {
    const devPrs = new Set(facts.agents.map((a) => a.pr));
    for (const num of Object.values(facts.promotionPr)) expect(devPrs.has(num)).toBe(false);
  });

  it("the promotion PR is invisible until merge-dev has already happened", () => {
    const mergeDev = foldFlow(FLOW_PHASE_IDS.indexOf("merge-dev"), facts);
    expect(mergeDev.groups.every((g) => !g.promotion.visible)).toBe(true);
    expect(mergeDev.groups.every((g) => g.agents.every((a) => a.prDevMerged))).toBe(true);

    const promote = foldFlow(FLOW_PHASE_IDS.indexOf("promote"), facts);
    expect(promote.groups.every((g) => g.promotion.visible)).toBe(true);
    // The dev PR chips are still there — this is an ADDITIONAL artifact, not a relabel.
    expect(promote.groups.every((g) => g.agents.every((a) => a.prDevVisible))).toBe(true);
    expect(promote.entityCount).toBeGreaterThan(mergeDev.entityCount);
  });

  it("the promotion merges only at merge-main, distinctly from the dev-PR merge at merge-dev", () => {
    const promote = foldFlow(FLOW_PHASE_IDS.indexOf("promote"), facts);
    expect(promote.groups.every((g) => !g.promotion.merged)).toBe(true);

    const mergeMain = foldFlow(FLOW_LAST_PHASE, facts);
    expect(mergeMain.groups.every((g) => g.promotion.merged)).toBe(true);
  });
});

/* ------------------------------------------------------------- the settled end */

describe("flow fold — the settled end and its progression", () => {
  it("the LAST phase is the complete, settled frame (the reduced-motion still)", () => {
    const s = foldFlow(FLOW_LAST_PHASE);
    expect(s.settled).toBe(true);
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents).toHaveLength(3);
    expect(agents.every((a) => a.state === "merged")).toBe(true);
    expect(agents.every((a) => a.prDevVisible && a.prDevMerged)).toBe(true);
    expect(s.groups.every((g) => g.qa !== null && g.qa.verdict === "approved")).toBe(true);
    expect(s.groups.every((g) => g.promotion.visible && g.promotion.merged)).toBe(true);
    expect(s.ledger).toEqual(["dispatched", "delivered", "verified", "merged"]);
  });

  it("clamps out-of-range indices instead of throwing", () => {
    expect(foldFlow(-5).phase).toBe("demand");
    expect(foldFlow(999).phase).toBe("merge-main");
  });

  it("PROVES the progression: entityCount strictly grows across many distinct beats, not just the final frame", () => {
    const facts = buildFlowFacts();
    const samples: { phase: FlowPhaseId; count: number }[] = FLOW_PHASE_IDS.map((phase) => ({
      phase,
      count: foldFlow(FLOW_PHASE_IDS.indexOf(phase), facts).entityCount,
    }));

    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]!.count).toBeGreaterThanOrEqual(samples[i - 1]!.count);
    }

    const growthPoints = samples.filter((s, i) => i > 0 && s.count > samples[i - 1]!.count);
    expect(growthPoints.length).toBeGreaterThanOrEqual(3);

    expect(samples[0]!.count).toBe(0);
    expect(samples.at(-1)!.count).toBeGreaterThanOrEqual(7);
  });
});

/* ------------------------------------------------------------ no reset seco */

describe("no reset seco — the next cycle's opening carries the last one's close forward", () => {
  it("the very first cycle's opening frame carries nothing (there is nothing before it)", () => {
    const first = foldFlow(FLOW_PHASE_IDS.indexOf("demand"), buildFlowFacts(), null);
    expect(first.previousCycle).toBeNull();
  });

  it("summarizeCycle reads the settled frame's real merged/repo counts", () => {
    const facts = buildFlowFacts();
    const lastFrame = foldFlow(FLOW_LAST_PHASE, facts);
    const carry = summarizeCycle(lastFrame);
    expect(carry.merged).toBe(3);
    expect(carry.repos).toBe(2);
  });

  it("cycle 2's opening frame is provably NOT the same blank picture as cycle 1's", () => {
    const facts = buildFlowFacts();
    const cycle1Last = foldFlow(FLOW_LAST_PHASE, facts, null);
    const carry = summarizeCycle(cycle1Last);

    const cycle1First = foldFlow(FLOW_PHASE_IDS.indexOf("demand"), facts, null);
    const cycle2First = foldFlow(FLOW_PHASE_IDS.indexOf("demand"), facts, carry);

    // Both open with an empty stage (the fan-out genuinely restarts)...
    expect(cycle2First.groups).toHaveLength(0);
    // ...but cycle 2 is NOT an erasure: it carries proof the previous cycle happened.
    expect(cycle1First.previousCycle).toBeNull();
    expect(cycle2First.previousCycle).toEqual({ merged: 3, repos: 2 });
    expect(cycle2First).not.toEqual(cycle1First);
  });
});

/* ------------------------------------------------------------------ the terminal */

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
      for (const other of facts.agents) {
        if (other.id === a.id) continue;
        expect(own.some((l) => l.text.includes(other.fqid))).toBe(false);
      }
    }
  });

  it("each dev PR opens on its own pr-dev-beat line, naming the real PR number", () => {
    const prLines = lines.filter((l) => l.phase === "pr-dev");
    for (const a of facts.agents) {
      expect(prLines.some((l) => l.text.includes(`#${a.pr}`))).toBe(true);
    }
  });

  it("prints a failed line at qa-reject naming the rejected agent's fqid", () => {
    const rejected = facts.agents.find((a) => a.id === FLOW_REJECTED_AGENT_ID)!;
    const rejectLines = lines.filter((l) => l.phase === "qa-reject");
    expect(rejectLines.some((l) => l.tone === "failed" && l.text.includes(rejected.fqid))).toBe(true);
  });

  it("prints each repo's promotion PR number at the promote beat", () => {
    const promoteLines = lines.filter((l) => l.phase === "promote");
    for (const repo of facts.repos) {
      expect(promoteLines.some((l) => l.text.includes(`#${facts.promotionPr[repo]}`))).toBe(true);
    }
  });

  it("keeps literal aipe/gh commands English (command/speech boundary)", () => {
    const cmd = lines.find((l) => l.text.startsWith("$ aipe dispatch validate"));
    expect(cmd).toBeDefined();
    expect(cmd!.text).not.toContain(FLOW_SCRIPT_EN.demand);
  });
});

describe("flow phases — a bounded arc, not an endless jitter", () => {
  it("is a single ordered pass ending on the settled merge into main", () => {
    expect(FLOW_PHASES.at(-1)!.id).toBe("merge-main");
    const order: FlowPhaseId[] = [
      "demand",
      "validate",
      "dispatch-1",
      "dispatch-2",
      "dispatch-3",
      "work",
      "deliver",
      "pr-dev",
      "qa-review",
      "qa-reject",
      "dev-fix",
      "qa-approve",
      "merge-dev",
      "promote",
      "merge-main",
    ];
    expect(FLOW_PHASE_IDS).toEqual(order);
  });

  it("every phase has a positive dwell", () => {
    expect(FLOW_PHASES.every((p) => p.ms > 0)).toBe(true);
  });
});
