import { describe, it, expect } from "bun:test";
import {
  ADAPTER_COUNT,
  AGENTOP_HOSTED_COUNT,
  CAPABILITY_KEYS,
  COMPAT_HARNESSES,
  FULLY_CONTAINED_COUNT,
  compatDispatchLine,
  compatPercent,
  containedAdapterIds,
  isFullyContained,
  type CompatId,
} from "../harnessCompat";
import { HARNESSES, isSessionEligible, sessionRejectReason, type HarnessId } from "../harness";

/**
 * Compatibility fidelity gate. The accepted-copy claim is "checked against
 * aipe/src/harness, not memory" — so this suite pins the row set, the ruler math,
 * and, above all, that the CONTAINED set never diverges from the pricer's domain
 * truth. If someone edits a percentage or adds a "supported" harness by hand, a
 * test breaks, not the site.
 */

/** The PDD list, in order — the exact ten the accordion must show. */
const PDD_TEN: CompatId[] = [
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
];

/** The six with no dedicated adapter in aipe today — must be marked, never inflated. */
const NO_ADAPTER_SIX: CompatId[] = ["cursor", "antigravity", "factory-droid", "kimi-code", "opencode", "pi"];

describe("compat rows — the PDD ten, in order", () => {
  it("shows exactly the ten agentop-hosted harnesses in the PDD list's order", () => {
    expect(COMPAT_HARNESSES.map((h) => h.id)).toEqual(PDD_TEN);
    expect(AGENTOP_HOSTED_COUNT).toBe(10);
  });

  it("every row is hosted by agentop (the host axis is universal for the ten)", () => {
    for (const h of COMPAT_HARNESSES) {
      expect(h.caps.agentopHost, `${h.id} must be an agentop host`).toBe(true);
      expect(h.agentopName.length, `${h.id} needs an agentop name`).toBeGreaterThan(0);
    }
  });
});

describe("compat rows — no adapter is invented", () => {
  it("the six PDD harnesses with no aipe adapter are marked, not inflated", () => {
    for (const h of COMPAT_HARNESSES) {
      const shouldHaveAdapter = !NO_ADAPTER_SIX.includes(h.id);
      expect(h.adapter !== null, `${h.id} adapter presence`).toBe(shouldHaveAdapter);
      if (!shouldHaveAdapter) {
        expect(h.copyKey, `${h.id} must use the shared no-adapter copy`).toBe("no-adapter");
        expect(h.caps.dedicatedAdapter).toBe(false);
        expect(h.caps.interceptionHook).toBe(false);
        expect(h.caps.headlessContainment).toBe(false);
      }
    }
  });

  it("exactly four rows carry a dedicated adapter (claude-code, codex, copilot, gemini)", () => {
    expect(ADAPTER_COUNT).toBe(4);
    const adapters = COMPAT_HARNESSES.filter((h) => h.adapter !== null).map((h) => h.adapter);
    expect(new Set(adapters)).toEqual(new Set<HarnessId>(["claude-code", "codex", "copilot", "gemini"]));
  });
});

describe("compat containment — locked to the pricer's domain truth", () => {
  it("an adapter row's containment equals the domain isSessionEligible, never hardcoded", () => {
    for (const h of COMPAT_HARNESSES) {
      if (h.adapter === null) {
        expect(isFullyContained(h)).toBe(false);
        continue;
      }
      expect(isFullyContained(h), `${h.id} containment must mirror the domain`).toBe(isSessionEligible(h.adapter));
    }
  });

  it("only claude-code and gemini are fully contained — the honest smaller number", () => {
    const contained = COMPAT_HARNESSES.filter(isFullyContained).map((h) => h.id);
    expect(contained).toEqual(["claude-code", "gemini"]);
    expect(FULLY_CONTAINED_COUNT).toBe(2);
  });

  it("host (10) is strictly greater than contain (2) — the number the agentop print confuses", () => {
    expect(AGENTOP_HOSTED_COUNT).toBeGreaterThan(FULLY_CONTAINED_COUNT);
  });

  it("the contained adapter set matches the domain registry exactly", () => {
    expect(new Set(containedAdapterIds())).toEqual(new Set<HarnessId>(["claude-code", "gemini"]));
    for (const id of Object.keys(HARNESSES) as HarnessId[]) {
      expect(isSessionEligible(id)).toBe(HARNESSES[id].containable);
    }
  });
});

describe("compat percentage — derived from the visible five-check ruler", () => {
  it("percent is exactly the share of the five capability checks that pass", () => {
    for (const h of COMPAT_HARNESSES) {
      const passed = CAPABILITY_KEYS.filter((k) => h.caps[k]).length;
      expect(compatPercent(h)).toBe(Math.round((passed / 5) * 100));
    }
  });

  it("fully contained harnesses read 100%, adapter-but-uncontained 80%, generic-only 40%", () => {
    const byId = Object.fromEntries(COMPAT_HARNESSES.map((h) => [h.id, compatPercent(h)]));
    expect(byId["claude-code"]).toBe(100);
    expect(byId["gemini"]).toBe(100);
    expect(byId["codex"]).toBe(80);
    expect(byId["copilot"]).toBe(80);
    for (const id of NO_ADAPTER_SIX) {
      expect(byId[id], `${id} is generic-path only`).toBe(40);
    }
  });

  it("the first two checks (content install + host) pass for all ten — the PDD-parity floor", () => {
    for (const h of COMPAT_HARNESSES) {
      expect(h.caps.contentInstall, `${h.id} content install`).toBe(true);
      expect(h.caps.agentopHost, `${h.id} agentop host`).toBe(true);
    }
  });
});

describe("compat dispatch line — the real validate output per row", () => {
  it("contained rows print an OK validate line", () => {
    const cc = COMPAT_HARNESSES.find((h) => h.id === "claude-code")!;
    expect(compatDispatchLine(cc)).toBe("aipe dispatch --mode session --harness claude-code validate → OK");
  });

  it("adapter-but-uncontained rows surface the domain reject verbatim", () => {
    const codex = COMPAT_HARNESSES.find((h) => h.id === "codex")!;
    const reject = sessionRejectReason("codex");
    expect(reject).not.toBeNull();
    expect(compatDispatchLine(codex)).toBe(reject ?? "");
    expect(compatDispatchLine(codex)).toBe("harness-not-containable codex");
  });

  it("generic-only rows say so, and never claim a containable adapter", () => {
    const cursor = COMPAT_HARNESSES.find((h) => h.id === "cursor")!;
    expect(compatDispatchLine(cursor)).toContain("generic path only");
  });
});
