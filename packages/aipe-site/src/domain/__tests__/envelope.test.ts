import { describe, it, expect } from "bun:test";
import {
  costIndex,
  isGated,
  envelopeViability,
  priceEnvelope,
  DEFAULT_POLICY,
  type Envelope,
} from "../envelope";

const base: Envelope = { mode: "subagent", intensity: "normal", harness: "claude-code", tier: "fast" };

describe("costIndex = mode × tier × intensity", () => {
  it("prices the cheapest envelope at 1", () => {
    expect(costIndex({ mode: "subagent", intensity: "normal", tier: "fast" })).toBe(1);
  });

  it("multiplies session(2) × reasoning(4) × normal(1) = 8", () => {
    expect(costIndex({ mode: "session", intensity: "normal", tier: "reasoning" })).toBe(8);
  });

  it("multiplies subagent(1) × frontier(6) × ultracode(8) = 48", () => {
    expect(costIndex({ mode: "subagent", intensity: "ultracode", tier: "frontier" })).toBe(48);
  });

  it("ignores harness (not a multiplier)", () => {
    const a = costIndex({ mode: "session", intensity: "normal", tier: "standard" });
    expect(a).toBe(4);
  });
});

describe("isGated — policy signature gates", () => {
  it("does not gate the cheapest normal/fast subagent", () => {
    expect(isGated(base).gated).toBe(false);
  });

  it("gates ultracode intensity", () => {
    const r = isGated({ ...base, intensity: "ultracode" });
    expect(r.gated).toBe(true);
    expect(r.reasons).toContain("intensity:ultracode");
  });

  it("gates the frontier tier", () => {
    const r = isGated({ ...base, tier: "frontier" });
    expect(r.gated).toBe(true);
    expect(r.reasons).toContain("tier:frontier");
  });

  it("never gates a single envelope on the wave-level cost ceiling", () => {
    // session(2) × reasoning(4) × ultracode(8) = 64, well over maxCostIndexPerWave (24) —
    // yet a LONE envelope is gated only by its ultracode intensity. The summed-cost ceiling
    // is a wave-level gate, never a single-envelope one (mirrors the reference propose.ts).
    const r = isGated({ ...base, mode: "session", tier: "reasoning", intensity: "ultracode" });
    expect(r.gated).toBe(true);
    expect(r.reasons).toContain("intensity:ultracode");
    expect(r.reasons.some((x) => x.startsWith("cost-index"))).toBe(false);
    expect(64).toBeGreaterThan(DEFAULT_POLICY.maxCostIndexPerWave);
  });
});

describe("envelopeViability — harness containment", () => {
  it("marks a session dispatch to codex non-viable", () => {
    const r = envelopeViability({ ...base, mode: "session", harness: "codex" });
    expect(r).toEqual({ viable: false, reason: "harness-not-containable codex" });
  });

  it("keeps subagent mode viable for any harness", () => {
    expect(envelopeViability({ ...base, mode: "subagent", harness: "copilot" }).viable).toBe(true);
  });

  it("keeps a session dispatch to gemini viable", () => {
    expect(envelopeViability({ ...base, mode: "session", harness: "gemini" }).viable).toBe(true);
  });
});

describe("priceEnvelope", () => {
  it("bundles index, gate and viability like one propose line", () => {
    const p = priceEnvelope({ mode: "session", intensity: "ultracode", harness: "codex", tier: "frontier" });
    expect(p.costIndex).toBe(2 * 6 * 8);
    expect(p.gated).toBe(true);
    expect(p.viable).toBe(false);
    expect(p.viabilityReason).toBe("harness-not-containable codex");
  });
});
