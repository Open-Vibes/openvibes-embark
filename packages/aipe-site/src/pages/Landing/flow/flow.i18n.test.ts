import { describe, it, expect } from "bun:test";
import en from "../../../i18n/en";
import pt from "../../../i18n/pt";
import { buildFlowFacts, buildFlowTerminal, FLOW_PHASE_IDS, FLOW_SCRIPT_KEYS } from "./flowModel";

/**
 * Flow i18n gate — the same discipline as the console's `script.i18n.test.ts`.
 * Prose translates and must actually differ; literal `aipe`/`gh` commands and
 * the status/law tokens (parallel, dispatched, harness ids, tiers, …) stay
 * byte-identical across locales. A caption or narration line with no real
 * EN/PT pair fails the build.
 */

describe("flow captions — one localised line per phase, in both locales", () => {
  it("both locales key captions by exactly the phase ids", () => {
    const ids = [...FLOW_PHASE_IDS].sort();
    expect(Object.keys(en.flow.captions).sort()).toEqual(ids);
    expect(Object.keys(pt.flow.captions).sort()).toEqual(ids);
  });

  it("every caption is actually translated (EN ≠ PT)", () => {
    for (const id of FLOW_PHASE_IDS) {
      expect(pt.flow.captions[id]).not.toBe(en.flow.captions[id]);
    }
  });

  it("no caption is a paragraph (single short line)", () => {
    for (const id of FLOW_PHASE_IDS) {
      expect(en.flow.captions[id]).not.toContain("\n");
      expect(en.flow.captions[id].length).toBeLessThanOrEqual(48);
      expect(pt.flow.captions[id].length).toBeLessThanOrEqual(48);
    }
  });
});

describe("flow narration — the spoken clauses translate", () => {
  it("both locales define exactly the FLOW_SCRIPT_KEYS", () => {
    const keys = [...FLOW_SCRIPT_KEYS].sort();
    expect(Object.keys(en.flow.script).sort()).toEqual(keys);
    expect(Object.keys(pt.flow.script).sort()).toEqual(keys);
  });

  it("each spoken clause differs between locales", () => {
    for (const key of FLOW_SCRIPT_KEYS) {
      expect(pt.flow.script[key]).not.toBe(en.flow.script[key]);
    }
  });
});

describe("flow — the previous-cycle summary is a localised template in both locales", () => {
  it("produces a real, differing phrase for the same numbers", () => {
    const enText = en.flow.previousCycle(3, 2);
    const ptText = pt.flow.previousCycle(3, 2);
    expect(enText).not.toBe(ptText);
    expect(enText).toContain("3");
    expect(enText).toContain("2");
    expect(ptText).toContain("3");
    expect(ptText).toContain("2");
  });
});

describe("flow labels — the new per-repo/rejection/promotion labels are translated", () => {
  // `prToDev`/`promotePr` name literal branches (`dev`, `main`) the same way
  // harness ids stay English — jargon, not prose — so both locales are
  // allowed (expected) to agree on those two.
  const LITERAL_KEYS = ["prToDev", "promotePr"] as const;
  const PROSE_KEYS = ["prMergedToDev", "promoteMerged", "inReview", "rejected", "fixing", "reviewing", "approved"] as const;

  it("both locales define the literal branch labels, present in both", () => {
    for (const key of LITERAL_KEYS) {
      expect(en.flow.labels[key]).toBeTruthy();
      expect(pt.flow.labels[key]).toBeTruthy();
    }
  });

  it("both locales define every prose label, and each actually translates", () => {
    for (const key of PROSE_KEYS) {
      expect(en.flow.labels[key]).toBeTruthy();
      expect(pt.flow.labels[key]).toBeTruthy();
      expect(pt.flow.labels[key]).not.toBe(en.flow.labels[key]);
    }
  });
});

describe("flow terminal — commands stay identical across locales", () => {
  const facts = buildFlowFacts();
  const enLines = buildFlowTerminal(facts, en.flow.script).map((l) => l.text);
  const ptLines = buildFlowTerminal(facts, pt.flow.script).map((l) => l.text);

  it("only the narrated lines change; every command/output is otherwise byte-identical", () => {
    let changed = 0;
    for (let i = 0; i < enLines.length; i++) {
      if (enLines[i] === ptLines[i]) continue;
      changed++;
      const isNarration =
        enLines[i] === en.flow.script.demand ||
        enLines[i]!.includes(en.flow.script.reviewAfter) ||
        enLines[i]!.includes(en.flow.script.rejectionFinding);
      expect(isNarration).toBe(true);
    }
    // demand + one reviewAfter comment per QA + one rejectionFinding line.
    expect(changed).toBe(1 + facts.qaTeam.length + 1);
  });

  it("the parallel verdict token is not translated", () => {
    expect(enLines.some((t) => t.includes("OK parallel"))).toBe(true);
    expect(ptLines.some((t) => t.includes("OK parallel"))).toBe(true);
  });

  it("harness and tier identifiers are not translated", () => {
    for (const a of facts.agents) {
      expect(enLines.some((t) => t.includes(a.envelope.harness))).toBe(true);
      expect(ptLines.some((t) => t.includes(a.envelope.harness))).toBe(true);
    }
  });
});
