import { describe, it, expect } from "bun:test";
import {
  buildFlowFacts,
  buildFlowTerminal,
  deriveQaTeam,
  envelopePool,
  envelopeForActor,
  flowUnits,
  foldFlow,
  nextPhaseIndex,
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

/* ---------------------------------------------- QA per DELIVERY, derived (v3) */

describe("QA team — one gate PER DELIVERY (in-flight unit), never per repo, never fixed", () => {
  it("3 units in flight → 3 QA gates out, even though there are only 2 repos", () => {
    const facts = buildFlowFacts();
    expect(facts.agents).toHaveLength(3);
    expect(facts.repos).toHaveLength(2);
    // The v3 crux: NOT one-per-repo (that would be 2). One gate per delivery.
    expect(facts.qaTeam).toHaveLength(3);
  });

  it("deriveQaTeam's count tracks the NUMBER OF UNITS it's given, generically", () => {
    // Anti-hardcode proof: change how many units ship and the gate count follows,
    // for arbitrary unit counts — the number does NOT come from the repo count.
    for (const n of [1, 2, 3, 5]) {
      const units = Array.from({ length: n }, (_, i) => ({ id: `u${i}`, repo: `repo-${i % 2}` }));
      expect(deriveQaTeam(units)).toHaveLength(n);
    }
  });

  it("5 units across 2 repos derives 5 gates (not 2); 1 unit derives 1", () => {
    const fiveUnitSeed = Array.from({ length: 5 }, (_, i) => ({
      id: `a${i}`,
      persona: `A${i}`,
      role: "dev-fullstack",
      repo: i < 3 ? "repo-x" : "repo-y",
      package: `pkg-${i}`,
      sessionId: `${i}`,
    }));
    const oneUnitSeed = [{ id: "a", persona: "A", role: "dev-fullstack", repo: "repo-x", package: "pkg", sessionId: "1" }];

    expect(buildFlowFacts(fiveUnitSeed).qaTeam).toHaveLength(5);
    expect(buildFlowFacts(fiveUnitSeed).repos).toHaveLength(2); // still 2 repos, 5 gates
    expect(buildFlowFacts(oneUnitSeed).qaTeam).toHaveLength(1);
  });

  it("each gate reviews exactly one delivery; two deliveries in one repo carry the SAME persona in two DISTINCT gates", () => {
    const facts = buildFlowFacts();
    // Every gate names a real in-flight unit, one-to-one.
    expect(facts.qaTeam.map((q) => q.unitId).sort()).toEqual(facts.agents.map((a) => a.id).sort());
    // openvibes-embark ships two devs → two gates, same reviewer persona, different units.
    const oveGates = facts.qaTeam.filter((q) => q.repo === "openvibes-embark");
    expect(oveGates).toHaveLength(2);
    expect(new Set(oveGates.map((q) => q.persona)).size).toBe(1); // same persona
    expect(new Set(oveGates.map((q) => q.unitId)).size).toBe(2); // distinct deliveries
  });

  it("a gate's persona is its repo's reviewer, distinct from the other repo's reviewer", () => {
    const facts = buildFlowFacts();
    const personaByRepo = new Map<string, Set<string>>();
    for (const q of facts.qaTeam) {
      (personaByRepo.get(q.repo) ?? personaByRepo.set(q.repo, new Set()).get(q.repo)!).add(q.persona);
    }
    // one persona per repo, and the two repos' personas differ.
    const personas = [...personaByRepo.values()].map((s) => [...s]);
    for (const p of personas) expect(p).toHaveLength(1);
    expect(new Set(personas.flat()).size).toBe(personaByRepo.size);
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
    const combos = new Set<string>([
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

  it("QA enters at qa-review, one gate PER DELIVERY, after the dev PRs are open", () => {
    const prDev = foldFlow(FLOW_PHASE_IDS.indexOf("pr-dev"));
    expect(prDev.groups.every((g) => g.qaGates.every((gate) => gate === null))).toBe(true);

    const qaReview = foldFlow(FLOW_PHASE_IDS.indexOf("qa-review"));
    // one gate per agent (delivery), aligned to the agents array in each group.
    expect(qaReview.groups.every((g) => g.qaGates.length === g.agents.length)).toBe(true);
    expect(qaReview.groups.every((g) => g.qaGates.every((gate) => gate !== null))).toBe(true);
    const gates = qaReview.groups.flatMap((g) => g.qaGates).filter(Boolean);
    expect(gates).toHaveLength(3); // 3 deliveries → 3 gates, though only 2 repos
    expect(qaReview.entityCount).toBeGreaterThan(prDev.entityCount);
  });
});

/* --------------------------------------------------- the rejection, the crux */

describe("rejection — visible, and fixed by the SAME dev, never the QA", () => {
  const facts = buildFlowFacts();
  const rejected = facts.agents.find((a) => a.id === FLOW_REJECTED_AGENT_ID)!;
  const rejectedGate = facts.qaTeam.find((q) => q.unitId === rejected.id)!;

  /** The gate object for a given agent id in a folded scene (aligned to agents). */
  const gateFor = (s: ReturnType<typeof foldFlow>, agentId: string) => {
    for (const g of s.groups) {
      const i = g.agents.findIndex((a) => a.id === agentId);
      if (i >= 0) return g.qaGates[i];
    }
    return null;
  };

  it("the rejected agent's gate reviews that exact delivery, and its persona is a QA, not a dev", () => {
    expect(rejected).toBeDefined();
    expect(rejectedGate.unitId).toBe(rejected.id);
    for (const a of facts.agents) expect(rejectedGate.persona).not.toBe(a.persona);
  });

  it("at qa-reject, the rejected agent's state is 'rejected' and ITS gate reads 'rejected'", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("qa-reject"), facts);
    const agent = s.groups.flatMap((g) => g.agents).find((a) => a.id === rejected.id)!;
    expect(agent.state).toBe("rejected");
    expect(gateFor(s, rejected.id)!.verdict).toBe("rejected");
  });

  it("at dev-fix, the SAME dev (not the QA) is the one shown fixing", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("dev-fix"), facts);
    const agent = s.groups.flatMap((g) => g.agents).find((a) => a.id === rejected.id)!;
    expect(agent.state).toBe("fixing");
    expect(agent.persona).toBe(rejected.persona);
    expect(agent.persona).not.toBe(rejectedGate.persona);
  });

  it("the other two agents (not rejected) are never shown as rejected or fixing", () => {
    for (const phase of ["qa-reject", "dev-fix"] as FlowPhaseId[]) {
      const s = foldFlow(FLOW_PHASE_IDS.indexOf(phase), facts);
      const others = s.groups.flatMap((g) => g.agents).filter((a) => a.id !== rejected.id);
      for (const a of others) expect(a.state === "rejected" || a.state === "fixing").toBe(false);
    }
  });

  it("after qa-approve, the rejected agent is verified and every gate reads 'approved'", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("qa-approve"), facts);
    const agents = s.groups.flatMap((g) => g.agents);
    expect(agents.every((a) => a.state === "verified")).toBe(true);
    expect(s.groups.flatMap((g) => g.qaGates).every((gate) => gate!.verdict === "approved")).toBe(true);
  });

  it("the OTHER delivery in the SAME repo approves independently, without waiting on the rejected one's fix", () => {
    const s = foldFlow(FLOW_PHASE_IDS.indexOf("qa-reject"), facts);
    // a sibling delivery in the rejected agent's own repo (per-delivery gates are independent).
    const sibling = facts.agents.find((a) => a.repo === rejected.repo && a.id !== rejected.id)!;
    expect(sibling).toBeDefined();
    expect(gateFor(s, sibling.id)!.verdict).toBe("approved");
    // and the clean repo's delivery too.
    const cleanUnit = facts.agents.find((a) => a.repo !== rejected.repo)!;
    expect(gateFor(s, cleanUnit.id)!.verdict).toBe("approved");
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

/* ------------------------------------ item 2: independence IS the product */

describe("unit independence — an approved unit lands without waiting on a bounced sibling", () => {
  const facts = buildFlowFacts();
  const rejected = facts.agents.find((a) => a.id === FLOW_REJECTED_AGENT_ID)!;
  const sibling = facts.agents.find((a) => a.repo === rejected.repo && a.id !== rejected.id)!;
  const cleanRepoUnit = facts.agents.find((a) => a.repo !== rejected.repo)!;
  const agentIn = (s: ReturnType<typeof foldFlow>, id: string) => s.groups.flatMap((g) => g.agents).find((a) => a.id === id)!;

  it("has a same-repo sibling and a clean-repo unit to compare against", () => {
    expect(sibling).toBeDefined();
    expect(sibling.repo).toBe(rejected.repo);
    expect(cleanRepoUnit.repo).not.toBe(rejected.repo);
  });

  // The crux the aceite demands: TWO facts true at the SAME instant.
  for (const phase of ["qa-reject", "dev-fix"] as FlowPhaseId[]) {
    it(`at ${phase}: the approved units are ALREADY merged into their repo while the bounced one is not`, () => {
      const s = foldFlow(FLOW_PHASE_IDS.indexOf(phase), facts);
      // approved units have LANDED (dev PR merged) — sent to the destination repo…
      expect(agentIn(s, sibling.id).prDevMerged).toBe(true);
      expect(agentIn(s, cleanRepoUnit.id).prDevMerged).toBe(true);
      // …at the SAME instant the bounced unit has NOT landed and is still bouncing/fixing.
      expect(agentIn(s, rejected.id).prDevMerged).toBe(false);
      expect(["rejected", "fixing"]).toContain(agentIn(s, rejected.id).state);
    });
  }

  it("the bounced unit only lands once its OWN re-review clears (qa-approve), never before", () => {
    expect(agentIn(foldFlow(FLOW_PHASE_IDS.indexOf("dev-fix"), facts), rejected.id).prDevMerged).toBe(false);
    expect(agentIn(foldFlow(FLOW_PHASE_IDS.indexOf("qa-approve"), facts), rejected.id).prDevMerged).toBe(true);
  });

  it("with NO rejection in the batch the scene invents no wait — nothing bounces, all land together", () => {
    const cleanSeed = [
      { id: "ada", persona: "Ada", role: "dev-fullstack", repo: "openvibes-embark", package: "aipe-site", sessionId: "1" },
      { id: "boone", persona: "Boone", role: "dev-fullstack", repo: "openvibes-embark", package: "embark-site", sessionId: "2" },
      { id: "cleo", persona: "Cleo", role: "dev-fullstack", repo: "agentistics", package: "web", sessionId: "3" },
    ];
    const clean = buildFlowFacts(cleanSeed);
    expect(clean.rejectedAgentId).toBeNull();

    // No unit is EVER shown rejected or fixing, at any beat.
    for (let i = 0; i <= FLOW_LAST_PHASE; i++) {
      const agents = foldFlow(i, clean).groups.flatMap((g) => g.agents);
      for (const a of agents) expect(a.state === "rejected" || a.state === "fixing").toBe(false);
    }
    // And every approved unit lands together at qa-reject — no dev-fix detour.
    const atReject = foldFlow(FLOW_PHASE_IDS.indexOf("qa-reject"), clean);
    expect(atReject.groups.flatMap((g) => g.agents).every((a) => a.prDevMerged)).toBe(true);
  });
});

/* --------------------------------- item 3: distinct branches, one destination */

describe("branches — each unit sends its own head branch, distinct within a repo", () => {
  const facts = buildFlowFacts();

  it("every branch is derived from the unit's own structure, never a literal dev/main", () => {
    for (const a of facts.agents) {
      expect(a.branch).toContain(a.package);
      expect(a.branch).toContain(a.id);
      expect(a.branch).not.toBe("dev");
      expect(a.branch).not.toBe("main");
      expect(a.branch.startsWith("aipe/")).toBe(true);
    }
  });

  it("the two units in the SAME repo carry DIFFERENT branches — the point of the two-arrow promotion", () => {
    const ove = facts.agents.filter((a) => a.repo === "openvibes-embark");
    expect(ove).toHaveLength(2);
    expect(new Set(ove.map((a) => a.branch)).size).toBe(2);
  });

  it("the folded agent state carries the branch through to the view layer", () => {
    const s = foldFlow(FLOW_LAST_PHASE, facts);
    for (const a of facts.agents) {
      const folded = s.groups.flatMap((g) => g.agents).find((x) => x.id === a.id)!;
      expect(folded.branch).toBe(a.branch);
    }
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
    expect(s.groups.flatMap((g) => g.qaGates).every((gate) => gate !== null && gate.verdict === "approved")).toBe(true);
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

/* --------------------------------------- D: the settled end is KEPT, not wiped */

describe("no reset seco — the arc plays once and HOLDS the final state, never wiping to empty", () => {
  // The v4 gate measured the WRONG thing: it asserted the next cycle's stage was
  // EMPTY (`groups` length 0, "the fan-out genuinely restarts") and only checked a
  // `previousCycle` summary proxy — so a proxy became the assertion and the test
  // PROTECTED the reset defect. These assert the PE's real requirement instead:
  // the completed scene stays on screen. Each one FAILS on the old wipe-to-0 clock.

  it("the clock HOLDS at the settled end — it does not wipe back to the empty first frame", () => {
    // The whole finding in one line: old behaviour returned 0 here (wipe); the fix holds.
    expect(nextPhaseIndex(FLOW_LAST_PHASE)).toBe(FLOW_LAST_PHASE);
    expect(nextPhaseIndex(FLOW_LAST_PHASE)).not.toBe(0);
  });

  it("still advances one step at a time on the way there (it is not frozen from the start)", () => {
    for (let i = 0; i < FLOW_LAST_PHASE; i++) expect(nextPhaseIndex(i)).toBe(i + 1);
    expect(nextPhaseIndex(FLOW_LAST_PHASE - 1)).toBe(FLOW_LAST_PHASE);
  });

  it("the frame the clock holds on is the COMPLETE, fully-populated scene — nothing erased", () => {
    const held = foldFlow(nextPhaseIndex(FLOW_LAST_PHASE), buildFlowFacts());
    expect(held.settled).toBe(true);
    const agents = held.groups.flatMap((g) => g.agents);
    expect(agents).toHaveLength(3); // every unit still on screen
    expect(agents.every((a) => a.state === "merged" && a.prDevMerged)).toBe(true);
    expect(held.groups.every((g) => g.promotion.visible && g.promotion.merged)).toBe(true);
    expect(held.entityCount).toBeGreaterThanOrEqual(7); // the built population is intact, not wiped
    expect(held.ledger).toEqual(["dispatched", "delivered", "verified", "merged"]);
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
