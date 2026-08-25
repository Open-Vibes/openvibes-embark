import { describe, it, expect } from "bun:test";
import { formatRejectLine, acceptedRecordsUpTo } from "./LedgerScrubber";
import { LEDGER_SCENARIOS, reduceLedger } from "../../../domain/ledger";

const framesOf = (id: string) =>
  reduceLedger(LEDGER_SCENARIOS.find((s) => s.id === id)!.attempts);

describe("formatRejectLine", () => {
  it("leads with the evidence-required gate code and drops the message's own prefix", () => {
    const reject = framesOf("no-evidence").find((f) => !f.accepted)!;
    const line = formatRejectLine(reject);
    expect(line.startsWith("REJECT evidence-required — ")).toBe(true);
    // no doubled prefix
    expect(line.indexOf("evidence-required")).toBe(line.lastIndexOf("evidence-required"));
  });

  it("leads a skipped-verification merge with the QA gate, never a ledger REJECT code", () => {
    const blocked = framesOf("merge-without-qa").find((f) => f.gateCode === "qa-gate")!;
    const line = formatRejectLine(blocked);
    // The QA gate is a process gate — it must NOT be dressed as a ledger reject code.
    expect(line.startsWith("QA gate — ")).toBe(true);
    expect(line.includes("REJECT")).toBe(false);
  });
});

describe("acceptedRecordsUpTo", () => {
  it("accumulates only accepted frames up to and including the index", () => {
    const frames = framesOf("no-evidence"); // frame 1 (index 1) is the reject
    expect(acceptedRecordsUpTo(frames, 0).length).toBe(1); // dispatched
    expect(acceptedRecordsUpTo(frames, 1).length).toBe(1); // reject adds nothing
    expect(acceptedRecordsUpTo(frames, 1).every((f) => f.accepted)).toBe(true);
  });

  it("includes every frame on the fully-accepted happy path", () => {
    const frames = framesOf("happy");
    expect(acceptedRecordsUpTo(frames, frames.length - 1).length).toBe(frames.length);
  });
});
