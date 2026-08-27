import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import Stage, { type StageLabels } from "./Stage";
import { buildBeats, foldScene } from "./sceneModel";

const beats = buildBeats();
const stageIndex = (decision: string) => beats.findIndex((b) => b.decision === decision && b.side === "stage");

const LABELS: StageLabels = {
  header: "stage", coordinator: "coordinator", unit: "unit", floor: "floor", envelope: "envelope",
  costIndex: "cost-index", gated: "gated", notMoney: "not money", wave: "wave", queued: "queued",
  running: "running", worktree: "worktree", evidenceGate: "evidence", qaGate: "QA", blocked: "blocked",
  open: "open", rejected: "rejected", ledger: "ledger",
  axes: [
    { gloss: "mode", value: "session" },
    { gloss: "harness", value: "claude-code" },
    { gloss: "tier", value: "reasoning" },
    { gloss: "effort", value: "ultracode" },
  ],
};

describe("Stage — renders standalone", () => {
  it("renders on its own with no provider and no sibling component", () => {
    const scene = foldScene(beats, stageIndex("law"));
    const html = renderToStaticMarkup(<Stage scene={scene} caption="same package → serialize" activeDecision="law" labels={LABELS} />);
    expect(html).toContain("stage");
    expect(html.length).toBeGreaterThan(0);
  });

  it("the envelope beat shows the derived cost-index and a gated lock", () => {
    const scene = foldScene(beats, stageIndex("envelope"));
    const html = renderToStaticMarkup(<Stage scene={scene} caption="envelope 64 · gated" activeDecision="envelope" labels={LABELS} />);
    expect(html).toContain("64");
    expect(html).toContain("gated");
  });

  it("serialised work places both specialists, Viola queued", () => {
    const scene = foldScene(beats, stageIndex("law"));
    const html = renderToStaticMarkup(<Stage scene={scene} caption="same package → serialize" activeDecision="law" labels={LABELS} />);
    expect(html).toContain("Lawson");
    expect(html).toContain("Viola");
    expect(html).toContain("queued");
  });

  it("the QA gate reads blocked on a premature merge", () => {
    const scene = foldScene(beats, stageIndex("qa-block"));
    const html = renderToStaticMarkup(<Stage scene={scene} caption="can't merge unverified" activeDecision="qa-block" labels={LABELS} />);
    expect(html).toContain("blocked");
  });

  it("shows the caption it is given, and it is a single short line", () => {
    const scene = foldScene(beats, stageIndex("merged"));
    const caption = "merged · locked";
    const html = renderToStaticMarkup(<Stage scene={scene} caption={caption} activeDecision="merged" labels={LABELS} />);
    expect(html).toContain(caption);
    expect(caption).not.toContain("\n");
  });

  it("does not import or render the Terminal component's content", () => {
    const scene = foldScene(beats, stageIndex("journey"));
    const html = renderToStaticMarkup(<Stage scene={scene} caption="one demand → one journey" activeDecision="journey" labels={LABELS} />);
    // a terminal-only artefact (the shell prompt) must never appear on the stage
    expect(html).not.toContain("pe›");
    expect(html).not.toContain("aipe journey start");
  });
});
