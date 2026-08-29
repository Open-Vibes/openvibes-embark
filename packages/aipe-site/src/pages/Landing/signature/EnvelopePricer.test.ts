import { describe, it, expect } from "bun:test";
import { gateReasonLabel } from "./EnvelopePricer";
import { priceEnvelope, type Envelope } from "../../../domain/envelope";
import en from "../../../i18n/en";
import pt from "../../../i18n/pt";

/**
 * The pricer's math and gate/viability truth are already covered in
 * src/domain/__tests__/envelope.test.ts. Here we only pin the NEW presentation
 * logic this component adds: turning raw `gateReasons` tokens into copy without
 * ever dropping or mislabelling one — proven against the exact tokens
 * priceEnvelope emits, so the copy can't drift from the policy. The sentence is
 * localised; the token inside it stays English in both locales.
 */
describe("gateReasonLabel", () => {
  it("labels a gated intensity, keeping the token literal", () => {
    expect(gateReasonLabel("intensity:ultracode", en.envelope)).toBe("ultracode intensity needs your signature");
    expect(gateReasonLabel("intensity:ultracode", pt.envelope)).toBe("intensidade ultracode precisa da sua assinatura");
  });

  it("labels a gated tier, keeping the token literal", () => {
    expect(gateReasonLabel("tier:frontier", en.envelope)).toBe("frontier tier needs your signature");
    expect(gateReasonLabel("tier:frontier", pt.envelope)).toBe("tier frontier precisa da sua assinatura");
  });

  it("translates the sentence between locales while the token survives verbatim", () => {
    const enLabel = gateReasonLabel("intensity:ultracode", en.envelope);
    const ptLabel = gateReasonLabel("intensity:ultracode", pt.envelope);
    expect(ptLabel).not.toBe(enLabel);
    expect(enLabel).toContain("ultracode");
    expect(ptLabel).toContain("ultracode");
  });

  it("passes an unknown reason through verbatim (never dropped)", () => {
    expect(gateReasonLabel("something-new", en.envelope)).toBe("something-new");
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
      const label = gateReasonLabel(r, en.envelope);
      // every emitted token is transformed into human copy, none passed through raw
      expect(label).not.toBe(r);
      expect(label.length).toBeGreaterThan(r.length);
    }
  });
});
