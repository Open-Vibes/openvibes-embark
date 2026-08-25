import { describe, it, expect } from "bun:test";
import { dispatchOutcome } from "./HarnessBay";
import { HARNESS_IDS, isSessionEligible, sessionRejectReason } from "../../../domain/harness";

describe("dispatchOutcome", () => {
  it("marks the containable harnesses as OK with a mono validate line", () => {
    expect(dispatchOutcome("claude-code")).toEqual({
      ok: true,
      line: "aipe dispatch --mode session --harness claude-code validate → OK",
    });
    expect(dispatchOutcome("gemini")).toEqual({
      ok: true,
      line: "aipe dispatch --mode session --harness gemini validate → OK",
    });
  });

  it("surfaces the domain reject verbatim for non-containable harnesses", () => {
    expect(dispatchOutcome("codex")).toEqual({
      ok: false,
      line: "harness-not-containable codex",
    });
    expect(dispatchOutcome("copilot")).toEqual({
      ok: false,
      line: "harness-not-containable copilot",
    });
  });

  it("never diverges from the domain source of truth", () => {
    for (const id of HARNESS_IDS) {
      const outcome = dispatchOutcome(id);
      expect(outcome.ok).toBe(isSessionEligible(id));
      const reject = sessionRejectReason(id);
      if (!outcome.ok) {
        expect(reject).not.toBeNull();
        expect(outcome.line).toBe(reject ?? "");
      } else {
        expect(reject).toBeNull();
      }
    }
  });
});
