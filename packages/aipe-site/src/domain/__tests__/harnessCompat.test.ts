import { describe, it, expect } from "bun:test";
import {
  CONTAINMENT_STATES,
  HARNESS_CONTAINMENT,
  INVESTIGATED_HARNESS_IDS,
  READER_BUCKETS,
  bucketFor,
  containmentFor,
  harnessesInState,
} from "../harnessCompat";
import { HARNESS_IDS } from "../harness";

// The ten harnesses agentop can host, per aipe's src/harness/compat.ts (PR #57).
const TEN = [
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

describe("harness compatibility ledger — transcription of aipe's three-state model", () => {
  it("classifies all ten agentop-hostable harnesses, with no duplicates", () => {
    const ids = HARNESS_CONTAINMENT.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set(TEN));
    expect(INVESTIGATED_HARNESS_IDS).toEqual(ids);
  });

  it("uses exactly three states, in strong→weak→open order, and the third is actually used", () => {
    expect(CONTAINMENT_STATES).toEqual(["containable-proven", "non-containable-proven", "unestablished"]);
    for (const h of HARNESS_CONTAINMENT) {
      expect(CONTAINMENT_STATES).toContain(h.state);
    }
    expect(harnessesInState("unestablished").length).toBeGreaterThan(0);
  });

  it("a proven claim always cites a primary source; an unestablished one always says why", () => {
    for (const h of HARNESS_CONTAINMENT) {
      if (h.state === "unestablished") {
        expect(h.headline.length).toBeGreaterThan(0);
      } else {
        expect(h.sources.length).toBeGreaterThan(0);
      }
      for (const s of h.sources) {
        expect(s.url.startsWith("https://")).toBe(true);
        expect(s.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(s.quote.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("antigravity is a candidate the docs leave open — not collapsed into either proven state", () => {
    const anti = containmentFor("antigravity");
    expect(anti).toBeDefined();
    expect(anti!.state).toBe("unestablished");
    expect(anti!.state).not.toBe("non-containable-proven");
    expect(anti!.state).not.toBe("containable-proven");
    expect(anti!.sources.length).toBeGreaterThan(0); // sourced even though the state is open
    expect(anti!.caveat).toBeDefined();
    expect(anti!.caveat!.length).toBeGreaterThan(0);
  });

  it("the four un-adapted 'containable-proven' findings carry the not-yet-verified caveat", () => {
    const discoveries = HARNESS_CONTAINMENT.filter((h) => h.adapterId === null && h.state === "containable-proven");
    expect(discoveries.map((h) => h.id).sort()).toEqual(["factory-droid", "kimi-code", "opencode", "pi"]);
    for (const h of discoveries) {
      expect(h.caveat).toBeDefined();
      expect(h.caveat!).toContain("Not yet AIPe-verified end-to-end");
    }
  });

  it("exactly the four adapter-backed harnesses carry an adapterId, and they match HARNESS_IDS", () => {
    const withAdapter = HARNESS_CONTAINMENT.filter((h) => h.adapterId !== null).map((h) => h.id);
    expect(new Set(withAdapter)).toEqual(new Set(["claude-code", "gemini", "codex", "copilot"]));
    expect(new Set(withAdapter)).toEqual(new Set(HARNESS_IDS));
  });

  it("containmentFor and harnessesInState stay consistent with the ledger", () => {
    expect(containmentFor("nope")).toBeUndefined();
    expect(containmentFor("gemini")!.id).toBe("gemini");
    const proven = harnessesInState("containable-proven").map((h) => h.id);
    expect(proven).toContain("claude-code");
    expect(proven).not.toContain("codex");
    const total =
      harnessesInState("containable-proven").length +
      harnessesInState("non-containable-proven").length +
      harnessesInState("unestablished").length;
    expect(total).toBe(HARNESS_CONTAINMENT.length);
  });

  it("bucketFor distinguishes a real proven limit from unbuilt backlog and the open question", () => {
    expect(READER_BUCKETS).toEqual(["shipped", "proven-limit", "backlog", "open-question"]);

    // Shipped: adapter exists, docs prove containment.
    expect(bucketFor(containmentFor("claude-code")!)).toBe("shipped");
    expect(bucketFor(containmentFor("gemini")!)).toBe("shipped");

    // Proven limit: non-containable-proven, regardless of adapter presence —
    // building the adapter would not change the verdict.
    expect(bucketFor(containmentFor("codex")!)).toBe("proven-limit");
    expect(bucketFor(containmentFor("copilot")!)).toBe("proven-limit");
    expect(bucketFor(containmentFor("cursor")!)).toBe("proven-limit");

    // Backlog: docs already prove it's possible, AIPe just hasn't built it.
    expect(bucketFor(containmentFor("factory-droid")!)).toBe("backlog");
    expect(bucketFor(containmentFor("kimi-code")!)).toBe("backlog");
    expect(bucketFor(containmentFor("opencode")!)).toBe("backlog");
    expect(bucketFor(containmentFor("pi")!)).toBe("backlog");

    // Open question: neither proven capable nor proven incapable.
    expect(bucketFor(containmentFor("antigravity")!)).toBe("open-question");
  });
});

describe("the four-id dispatch/pricer union stays untouched by this ledger", () => {
  it("HARNESS_IDS from ./harness is still exactly the four adapter-backed ids", () => {
    expect(HARNESS_IDS).toEqual(["claude-code", "gemini", "codex", "copilot"]);
  });
});
