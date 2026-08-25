import { describe, it, expect } from "bun:test";
import { gateReasonLabel } from "./EnvelopePricer";
import { priceEnvelope, type Envelope } from "../../../domain/envelope";

/**
 * The pricer's math and gate/viability truth are already covered in
 * src/domain/__tests__/envelope.test.ts. Here we only pin the NEW presentation
 * logic this component adds: turning raw `gateReasons` tokens into copy without
 * ever dropping or mislabelling one — proven against the exact tokens
 * priceEnvelope emits, so the copy can't drift from the policy.
 */
describe("gateReasonLabel", () => {
  it("labels a gated intensity", () => {
    expect(gateReasonLabel("intensity:ultracode")).toBe("ultracode intensity needs your signature");
  });

  it("labels a gated tier", () => {
    expect(gateReasonLabel("tier:frontier")).toBe("frontier tier needs your signature");
  });

  it("passes an unknown reason through verbatim (never dropped)", () => {
    expect(gateReasonLabel("something-new")).toBe("something-new");
  });

  it("never emits a per-wave cost-index reason for a single envelope", () => {
    // The summed-cost ceiling is a wave-level gate; a lone envelope is never
    // gated on it, so the pricer never has a `cost-index>` token to label.
    const maxed: Envelope = { mode: "session", intensity: "ultracode", harness: "claude-code", tier: "frontier" };
    const { gateReasons } = priceEnvelope(maxed);
    expect(gateReasons.some((r) => r.startsWith("cost-index"))).toBe(false);
  });

  it("covers every reason priceEnvelope actually emits for a maximal gated envelope", () => {
    const maxed: Envelope = { mode: "session", intensity: "ultracode", harness: "claude-code", tier: "frontier" };
    const { gateReasons } = priceEnvelope(maxed);
    expect(gateReasons.length).toBeGreaterThan(0);
    for (const r of gateReasons) {
      const label = gateReasonLabel(r);
      // every emitted token is transformed into human copy, none passed through raw
      expect(label).not.toBe(r);
      expect(label.length).toBeGreaterThan(r.length);
    }
  });
});
