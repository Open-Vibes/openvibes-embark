import { describe, it, expect } from "bun:test";
import { HARNESS_IDS, HARNESSES, isSessionEligible, sessionRejectReason } from "../harness";

describe("harness truth", () => {
  it("probes exactly the four harnesses", () => {
    expect(HARNESS_IDS).toEqual(["claude-code", "gemini", "codex", "copilot"]);
  });

  it("claude-code and gemini are containable / session-eligible", () => {
    expect(isSessionEligible("claude-code")).toBe(true);
    expect(isSessionEligible("gemini")).toBe(true);
  });

  it("codex and copilot are not containable", () => {
    expect(isSessionEligible("codex")).toBe(false);
    expect(isSessionEligible("copilot")).toBe(false);
  });

  it("keeps id and bin as separate namespaces", () => {
    expect(HARNESSES["claude-code"].bin).toBe("claude");
  });

  it("returns the harness-not-containable reject reason for codex/copilot only", () => {
    expect(sessionRejectReason("codex")).toBe("harness-not-containable codex");
    expect(sessionRejectReason("copilot")).toBe("harness-not-containable copilot");
    expect(sessionRejectReason("claude-code")).toBeNull();
    expect(sessionRejectReason("gemini")).toBeNull();
  });
});
