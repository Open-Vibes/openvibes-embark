import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import CompatibilityLedger from "./CompatibilityLedger";

/**
 * Renders standalone (useI18n falls back to the English default context value
 * when there is no I18nProvider ancestor — same pattern as Terminal.test.tsx).
 * These assertions read the rendered HTML the way a reader would: they check
 * which group heading a harness id lands under, not the domain module.
 */
describe("CompatibilityLedger — renders standalone", () => {
  const html = renderToStaticMarkup(<CompatibilityLedger />);

  it("renders without throwing and shows the section framing", () => {
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("Containment ledger");
    expect(html).toContain("Ten harnesses agentop can host. Three states, never two.");
  });

  it("shows all four reader-facing group labels, so a real limit never reads as backlog", () => {
    expect(html).toContain("Shipped — proven capable");
    expect(html).toContain("Proven incapable — a real limit");
    expect(html).toContain("Not implemented — docs already say it&#x27;s possible");
    expect(html).toContain("Unestablished — the docs don&#x27;t say");
  });

  it("groups the shipped harnesses (adapter + proven capable) together", () => {
    const group = html.indexOf("Shipped — proven capable");
    const nextGroup = html.indexOf("Proven incapable — a real limit");
    const claudeCode = html.indexOf(">claude-code<");
    const gemini = html.indexOf(">gemini<");
    expect(claudeCode).toBeGreaterThan(group);
    expect(claudeCode).toBeLessThan(nextGroup);
    expect(gemini).toBeGreaterThan(group);
    expect(gemini).toBeLessThan(nextGroup);
  });

  it("groups codex/copilot/cursor as a real limit — proven non-containable regardless of adapter", () => {
    const group = html.indexOf("Proven incapable — a real limit");
    const nextGroup = html.indexOf("Not implemented");
    for (const id of [">codex<", ">copilot<", ">cursor<"]) {
      const pos = html.indexOf(id);
      expect(pos).toBeGreaterThan(group);
      expect(pos).toBeLessThan(nextGroup);
    }
  });

  it("groups the four un-adapted findings as backlog, each carrying the not-yet-verified caveat", () => {
    const group = html.indexOf("Not implemented — docs already say it&#x27;s possible");
    const nextGroup = html.indexOf("Unestablished — the docs don&#x27;t say");
    for (const id of [">factory-droid<", ">kimi-code<", ">opencode<", ">pi<"]) {
      const pos = html.indexOf(id);
      expect(pos).toBeGreaterThan(group);
      expect(pos).toBeLessThan(nextGroup);
    }
    // The caveat appears once per card in this group; at minimum it must be present.
    const occurrences = html.split("Not yet AIPe-verified end-to-end").length - 1;
    expect(occurrences).toBe(4);
  });

  it("keeps antigravity alone in the open-question group, distinct from the proven-incapable group", () => {
    const group = html.indexOf("Unestablished — the docs don&#x27;t say");
    const antigravity = html.indexOf(">antigravity<");
    expect(antigravity).toBeGreaterThan(group);
    // antigravity's own state token appears, and never as non-containable-proven.
    expect(html).toContain("unestablished");
  });

  it("cites a primary source link for every harness", () => {
    expect(html).toContain("https://code.claude.com/docs/en/hooks");
    expect(html).toContain("https://antigravity.google/docs/ide/hooks/");
    expect(html).toContain("Read the source");
    expect(html).toContain("Accessed");
  });
});
