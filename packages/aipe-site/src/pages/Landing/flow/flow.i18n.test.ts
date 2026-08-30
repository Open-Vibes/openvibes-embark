import { describe, it, expect } from "bun:test";
import en from "../../../i18n/en";
import pt from "../../../i18n/pt";
import { buildFlowFacts, buildFlowTerminal, FLOW_PHASE_IDS, FLOW_SCRIPT_KEYS } from "./flowModel";

/**
 * Flow i18n gate — the same discipline as the console's `script.i18n.test.ts`.
 * Prose translates and must actually differ; literal `aipe` commands and the
 * status/law tokens (parallel, dispatched, …) stay byte-identical across locales.
 * A caption or narration line with no real EN/PT pair fails the build.
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

describe("flow narration — the two spoken clauses translate", () => {
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

describe("flow terminal — commands stay identical across locales", () => {
  const facts = buildFlowFacts();
  const enLines = buildFlowTerminal(facts, en.flow.script).map((l) => l.text);
  const ptLines = buildFlowTerminal(facts, pt.flow.script).map((l) => l.text);

  it("only the two narration lines change; every command/output is byte-identical", () => {
    const enNarration = new Set([en.flow.script.demand, `# ${en.flow.script.reviewAfter}`]);
    let changed = 0;
    for (let i = 0; i < enLines.length; i++) {
      if (enLines[i] === ptLines[i]) continue;
      changed++;
      // A line that differs must be one that CONTAINS the translated narration.
      const isNarration = enNarration.has(enLines[i]!) || enLines[i]!.includes(en.flow.script.reviewAfter);
      expect(isNarration).toBe(true);
    }
    // demand line + reviewAfter comment line = exactly two changed lines.
    expect(changed).toBe(2);
  });

  it("the parallel verdict token is not translated", () => {
    expect(enLines.some((t) => t.includes("OK parallel"))).toBe(true);
    expect(ptLines.some((t) => t.includes("OK parallel"))).toBe(true);
  });
});
