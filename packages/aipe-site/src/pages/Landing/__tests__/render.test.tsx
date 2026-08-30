import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "../../../i18n";
import HarnessSection from "../HarnessSection";
import Statement from "../Statement";
import Hero from "../Hero";
import ConsoleSection from "../ConsoleSection";

/**
 * Render smoke for the j-20260829-b3 surfaces. Complements `tsc` (which proves the
 * i18n key shapes match) by executing the component trees: a bad map, a missing
 * runtime key, or a broken index would throw here where a type check can't reach.
 * Rendered in English (SSR resolves the default locale synchronously; PT mirrors
 * en key-for-key — enforced by `tsc` and the i18n parity gates — so it renders
 * the same tree with different strings, which cannot throw where en doesn't).
 */
const render = (node: unknown) => renderToStaticMarkup(h(I18nProvider, null, node as never) as never);

describe("landing render — j-20260829-b3 surfaces execute", () => {
  it("HarnessSection shows all ten PDD harnesses, the three-state ledger, and the host/contain split — no percentage", () => {
    const html = render(h(HarnessSection));
    for (const id of [
      "claude-code",
      "codex",
      "cursor",
      "copilot",
      "gemini",
      "antigravity",
      "factory-droid",
      "kimi-code",
      "opencode",
      "pi",
    ]) {
      expect(html, `harness "${id}" is not rendered`).toContain(`>${id}<`);
    }
    // The three states, cited sources, and the reader-facing buckets — the
    // ledger that replaced the collapsing five-check percentage (task gate-pr23).
    expect(html).toContain("containable-proven");
    expect(html).toContain("non-containable-proven");
    expect(html).toContain("unestablished");
    expect(html).toContain("Not yet AIPe-verified end-to-end");
    expect(html).toContain("AIPe fully contains");
    expect(html).toContain("agentop hosts");
    expect(html).toContain("AIPe never starts a session it cannot govern");
    // No percentage-based compatibility score survives anywhere in the section.
    expect(html).not.toMatch(/\d+%/);
  });

  it("Statement (the rhythm break) renders its thesis line", () => {
    expect(render(h(Statement))).toContain("Containing a session is the promise");
  });

  it("Hero renders the multi-harness legend and the corrected install ideology", () => {
    const html = render(h(Hero));
    expect(html).toContain("fan-out");
    expect(html).toContain("QA rejects");
    expect(html).toContain("standalone CLI");
    expect(html).not.toContain("a Claude Code plugin");
  });

  it("ConsoleSection renders the ordered glossary (stages, concepts, loop marker)", () => {
    const html = render(h(ConsoleSection));
    expect(html).toContain("The order it happens");
    expect(html).toContain("The concepts that attach to it");
    expect(html).toContain("↺");
  });
});
