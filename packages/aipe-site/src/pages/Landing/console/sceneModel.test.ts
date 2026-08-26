import { describe, it, expect } from "bun:test";
import {
  buildBeats,
  foldScene,
  activeDecision,
  CAPTIONS_EN,
  CAPTION_BUDGET,
  laneOf,
  type Beat,
} from "./sceneModel";
import { buildFacts } from "./consoleScript";

const beats = buildBeats();

describe("sceneModel — the beat stream is strictly one-side-at-a-time", () => {
  it("alternates terminal → stage → terminal → stage, never two of a side in a row", () => {
    for (let i = 0; i < beats.length; i++) {
      expect(beats[i]!.side).toBe(i % 2 === 0 ? "terminal" : "stage");
    }
  });

  it("pairs each decision as one terminal beat then one stage beat", () => {
    for (let i = 0; i < beats.length; i += 2) {
      expect(beats[i]!.decision).toBe(beats[i + 1]!.decision);
      expect(beats[i]!.side).toBe("terminal");
      expect(beats[i + 1]!.side).toBe("stage");
    }
  });

  it("opens on the demand and closes on the merge", () => {
    expect(beats[0]!.decision).toBe("demand");
    expect(beats.at(-1)!.decision).toBe("merged");
  });

  it("every terminal beat has command lines; every stage beat has a change + caption key", () => {
    for (const b of beats) {
      if (b.side === "terminal") expect((b.commands ?? []).length).toBeGreaterThan(0);
      else {
        expect(b.change).toBeDefined();
        expect(b.captionKey).toBeDefined();
        expect(CAPTIONS_EN[b.captionKey!]).toBeDefined();
      }
    }
  });
});

describe("sceneModel — the right-pane text budget is enforced, not eyeballed", () => {
  it("every caption is a single short line within the budget (a label or clause, no paragraph)", () => {
    for (const [key, caption] of Object.entries(CAPTIONS_EN)) {
      expect(caption.length, `caption "${key}" = "${caption}"`).toBeLessThanOrEqual(CAPTION_BUDGET);
      expect(caption.includes("\n"), `caption "${key}" must be one line`).toBe(false);
      // A clause, not prose: at most one sentence-ending period.
      expect((caption.match(/\. /g) ?? []).length).toBeLessThanOrEqual(0);
    }
  });
});

describe("sceneModel — the scene state is derived from the domain, never hand-set", () => {
  const facts = buildFacts();
  const lastStage = (decision: string) => beats.findIndex((b) => b.decision === decision && b.side === "stage");

  it("the envelope resolves to the real priced cost-index and gate", () => {
    const scene = foldScene(beats, lastStage("envelope"));
    expect(scene.envelope.shown).toBe(true);
    expect(scene.envelope.costIndex).toBe(facts.specialists[0]!.envelope.costIndex); // 64
    expect(scene.envelope.gated).toBe(facts.specialists[0]!.envelope.gated); // true
  });

  it("the law serializes: Lawson to lane 1, Viola queued in lane 2 (from scheduleWaves)", () => {
    const scene = foldScene(beats, lastStage("law"));
    expect(scene.serialized).toBe(true);
    const lawson = scene.specialists.find((s) => s.id === "lawson")!;
    const viola = scene.specialists.find((s) => s.id === "viola")!;
    expect(lawson.lane).toBe(laneOf(facts.specialists.find((s) => s.id === "lawson")!.wave)); // lane 1
    expect(viola.lane).toBe(laneOf(facts.specialists.find((s) => s.id === "viola")!.wave)); // lane 2
    expect(viola.queued).toBe(true);
  });

  it("the law beat's terminal command carries the real reject reason verbatim", () => {
    const lawTerminal = beats.find((b) => b.decision === "law" && b.side === "terminal")!;
    const text = (lawTerminal.commands ?? []).map((l) => l.text).join("\n");
    if (!facts.law.ok) expect(text).toContain(facts.law.reason); // same-package openvibes-embark/aipe-site
  });

  it("the evidence gate rejects an evidenceless delivery", () => {
    const scene = foldScene(beats, lastStage("evidence"));
    expect(scene.gates.evidence).toBe("rejected");
  });

  it("the QA gate blocks a premature merge, then opens on verify", () => {
    const blocked = foldScene(beats, lastStage("qa-block"));
    expect(blocked.gates.qa).toBe("blocked");
    const verified = foldScene(beats, lastStage("verify"));
    expect(verified.gates.qa).toBe("open");
    expect(verified.ledger).toContain("verified");
  });

  it("merged lights the last station and locks the unit immutable", () => {
    const scene = foldScene(beats, beats.length - 1);
    expect(scene.ledger).toContain("merged");
    expect(scene.immutable).toBe(true);
    // the full ramp is lit in lifecycle order
    expect(scene.ledger).toEqual(["dispatched", "delivered", "verified", "merged"]);
  });

  it("nothing has happened before the first beat is folded", () => {
    const scene = foldScene(beats, -1);
    expect(scene.coordinator).toBe(false);
    expect(scene.specialists.length).toBe(0);
    expect(scene.ledger.length).toBe(0);
  });
});

describe("sceneModel — active decision links the two panes for the cross-highlight", () => {
  it("reports the decision of the beat at a given index", () => {
    expect(activeDecision(beats, 0)).toBe("demand");
    const envStage = beats.findIndex((b: Beat) => b.decision === "envelope" && b.side === "stage");
    expect(activeDecision(beats, envStage)).toBe("envelope");
  });
});
