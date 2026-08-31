import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import FlowFloor, { type FlowFloorLabels } from "./FlowFloor";
import FlowTerminal from "./FlowTerminal";
import { buildFlowFacts, buildFlowTerminal, foldFlow, FLOW_LAST_PHASE, FLOW_PHASE_IDS, FLOW_REJECTED_AGENT_ID } from "./flowModel";

const facts = buildFlowFacts();

const LABELS: FlowFloorLabels = {
  ariaLabel: "AIPe dispatching three agents across two repositories in parallel",
  coordinator: "coordinator",
  dispatchLaw: "dispatch law",
  parallel: "parallel",
  units: "units",
  repos: "repos",
  placed: "placed",
  worktree: "worktree",
  ledger: "ledger",
  receiving: "receiving…",
  dispatching: "dispatching…",
  qaRole: "QA",
  prOpened: "PR opened",
  prToDev: "PR → dev",
  prMergedToDev: "merged into dev",
  promotePr: "promote → main",
  promoteMerged: "merged into main",
  inReview: "in review",
  rejected: "rejected",
  fixing: "fixing",
  reviewing: "reviewing",
  approved: "approved",
  spec: "spec",
  mainBranch: "main",
  conn: { dispatch: "dispatch", review: "review", promote: "promote", reject: "sent back" },
  caption: "all merged · immutable",
  previousCycle: (merged, repos) => `last cycle: ${merged} merged across ${repos} repos`,
};

/* ------------------------------------------------ the reduced-motion still frame */

describe("Flow — the reduced-motion still frame is COMPLETE", () => {
  const scene = foldFlow(FLOW_LAST_PHASE, facts);
  const html = renderToStaticMarkup(<FlowFloor facts={facts} scene={scene} labels={LABELS} reduced />);

  it("shows all three agents by name", () => {
    expect(html).toContain("Lawson");
    expect(html).toContain("Marco");
    expect(html).toContain("Jane");
  });

  it("shows both repositories", () => {
    expect(html).toContain("openvibes-embark");
    expect(html).toContain("agentistics");
  });

  it("shows the parallel verdict and its derived counts", () => {
    expect(html).toContain("parallel");
    expect(html).toContain("2 repos");
    expect(html).toContain("3 units");
  });

  it("has every ledger station lit, ending in merged", () => {
    expect(html).toContain("dispatched");
    expect(html).toContain("delivered");
    expect(html).toContain("verified");
    expect(html).toContain("merged");
  });

  it("shows every QA persona, one per repo", () => {
    for (const qa of facts.qaTeam) expect(html).toContain(qa.persona);
  });

  it("shows every dev PR and every promotion PR number", () => {
    for (const a of facts.agents) expect(html).toContain(`#${a.pr}`);
    for (const num of Object.values(facts.promotionPr)) expect(html).toContain(`#${num}`);
  });

  it("shows at least 3 distinct harness+tier combinations", () => {
    const combos = new Set<string>();
    for (const a of facts.agents) combos.add(`${a.envelope.harness} · ${a.envelope.tier}`);
    for (const qa of facts.qaTeam) combos.add(`${qa.envelope.harness} · ${qa.envelope.tier}`);
    expect(combos.size).toBeGreaterThanOrEqual(3);
    for (const combo of combos) expect(html).toContain(combo);
  });

  it("carries a real alt text (role=img + aria-label), not aria-hidden decoration", () => {
    expect(html).toContain('role="img"');
    expect(html).toContain(LABELS.ariaLabel);
  });
});

/* ------------------------------------------------- the entrances are real DOM */

describe("Flow — the markup itself grows across beats (not a relabelled panel)", () => {
  const dispatch1 = renderToStaticMarkup(
    <FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf("dispatch-1"), facts)} labels={LABELS} reduced />,
  );
  const dispatch3 = renderToStaticMarkup(
    <FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf("dispatch-3"), facts)} labels={LABELS} reduced />,
  );
  const qaReview = renderToStaticMarkup(
    <FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf("qa-review"), facts)} labels={LABELS} reduced />,
  );
  const prDev = renderToStaticMarkup(
    <FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf("pr-dev"), facts)} labels={LABELS} reduced />,
  );
  const promote = renderToStaticMarkup(
    <FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf("promote"), facts)} labels={LABELS} reduced />,
  );

  it("at dispatch-1 only Lawson is named — Marco and Jane are absent, not just dimmed", () => {
    expect(dispatch1).toContain("Lawson");
    expect(dispatch1).not.toContain("Marco");
    expect(dispatch1).not.toContain("Jane");
  });

  it("by dispatch-3 all three are named, and the markup has strictly more agent rows than dispatch-1", () => {
    expect(dispatch3).toContain("Lawson");
    expect(dispatch3).toContain("Marco");
    expect(dispatch3).toContain("Jane");
    const rowsAt1 = dispatch1.split(LABELS.worktree).length - 1;
    const rowsAt3 = dispatch3.split(LABELS.worktree).length - 1;
    expect(rowsAt1).toBe(1);
    expect(rowsAt3).toBe(3);
  });

  it("no QA persona appears before qa-review; every QA persona appears once it arrives", () => {
    for (const qa of facts.qaTeam) expect(dispatch3).not.toContain(qa.persona);
    for (const qa of facts.qaTeam) expect(qaReview).toContain(qa.persona);
  });

  it("no dev-PR number appears before pr-dev; every PR number appears once it arrives", () => {
    for (const a of facts.agents) expect(dispatch3).not.toContain(`#${a.pr}`);
    for (const a of facts.agents) expect(prDev).toContain(`#${a.pr}`);
  });

  it("no promotion-PR number appears before promote; every promotion number appears once it arrives", () => {
    for (const num of Object.values(facts.promotionPr)) expect(prDev).not.toContain(`#${num}`);
    for (const num of Object.values(facts.promotionPr)) expect(promote).toContain(`#${num}`);
  });

  it("frame-to-frame the scene is a strictly bigger document, not a same-size relabel", () => {
    expect(dispatch3.length).toBeGreaterThan(dispatch1.length);
    expect(qaReview.length).toBeGreaterThan(dispatch3.length);
    expect(prDev.length).toBeGreaterThanOrEqual(dispatch3.length);
  });
});

/* --------------------------------------------------------- the rejection, rendered */

describe("Flow — the rejection and fix are visible in the rendered markup", () => {
  it("at qa-reject, the agent's ledger badge reads 'failed' and its QA's verdict chip reads 'rejected'", () => {
    const scene = foldFlow(FLOW_PHASE_IDS.indexOf("qa-reject"), facts);
    const html = renderToStaticMarkup(<FlowFloor facts={facts} scene={scene} labels={LABELS} reduced />);
    expect(html).toContain(">failed<");
    expect(html).toContain(LABELS.rejected);
  });

  it("at dev-fix, the fixing chip renders for the same agent, not a QA badge change", () => {
    const scene = foldFlow(FLOW_PHASE_IDS.indexOf("dev-fix"), facts);
    const html = renderToStaticMarkup(<FlowFloor facts={facts} scene={scene} labels={LABELS} reduced />);
    expect(html).toContain(LABELS.fixing);
    const rejected = facts.agents.find((a) => a.id === FLOW_REJECTED_AGENT_ID)!;
    expect(html).toContain(rejected.persona);
  });
});

/* --------------------------------------------------------- zero interactivity */

const SCENE_FILES = ["FlowFloor.tsx", "FlowTerminal.tsx", "FlowScene.tsx", "FlowSection.tsx"];
const FORBIDDEN = [
  "onClick",
  "onMouseDown",
  "onPointerDown",
  "onDoubleClick",
  'role="button"',
  "<button",
  "<a ",
  "href=",
  "tabIndex",
  "cursor-pointer",
];

describe("Flow — proven zero interactivity (no player, nothing clickable)", () => {
  it("no scene source declares any click handler or interactive element", () => {
    for (const file of SCENE_FILES) {
      const src = readFileSync(join(import.meta.dir, file), "utf8");
      for (const token of FORBIDDEN) {
        expect(`${file}: ${src.includes(token) ? `contains ${token}` : "clean"}`).toBe(`${file}: clean`);
      }
    }
  });

  it("the rendered floor contains no <button> and no <a> element", () => {
    const scene = foldFlow(FLOW_LAST_PHASE, facts);
    const html = renderToStaticMarkup(<FlowFloor facts={facts} scene={scene} labels={LABELS} reduced />);
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("onclick");
  });

  it("the rendered terminal contains no interactive element", () => {
    const lines = buildFlowTerminal(facts);
    const html = renderToStaticMarkup(<FlowTerminal header="console" lines={lines} reduced />);
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");
  });
});

/* ------------------------------------------------------ the terminal is a log */

describe("Flow terminal — the log of what the floor dispatched", () => {
  it("is aria-hidden (the labelled floor already carries the information)", () => {
    const lines = buildFlowTerminal(facts);
    const html = renderToStaticMarkup(<FlowTerminal header="console" lines={lines} reduced />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("prints the agents' real fqids (derived, not invented)", () => {
    const lines = buildFlowTerminal(facts);
    const html = renderToStaticMarkup(<FlowTerminal header="console" lines={lines} reduced />);
    for (const a of facts.agents) expect(html).toContain(a.fqid);
  });
});
