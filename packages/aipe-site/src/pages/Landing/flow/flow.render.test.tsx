import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import FlowFloor, { type FlowFloorLabels } from "./FlowFloor";
import FlowTerminal from "./FlowTerminal";
import { buildFlowFacts, buildFlowTerminal, foldFlow, FLOW_LAST_PHASE, FLOW_PHASE_IDS, FLOW_REJECTED_AGENT_ID, type FlowPhaseId } from "./flowModel";

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
  inProgress: "in progress",
  landsIn: "lands in",
  spec: "spec",
  mainBranch: "main",
  lawSerial: "shared key → serialized in waves",
  serial: "serial · one step at a time",
  pe: "PE (you)",
  demandText: "ship three units across two repos — and show them run at once",
  peTasks: (n) => `Tasks 1–${n}`,
  classifyDispatch: (n) => `classifies and dispatches ${n} tasks`,
  taskWord: "Task",
  reprovedQ: "reproved?",
  answerNo: "no",
  answerYes: "yes",
  adjustAfterRequest: "adjust after the request",
  prDevSection: "PR DEV",
  prMainSection: "PR MAIN",
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

/* ---------------------------------------- item 1: the amber in-progress signal */

describe("Flow — a unit in progress is amber, from the --st-running token, and labelled", () => {
  const at = (phase: FlowPhaseId) =>
    renderToStaticMarkup(<FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf(phase), facts)} labels={LABELS} reduced />);

  it("at work, running units carry the labelled amber in-progress marker (not colour alone)", () => {
    const html = at("work");
    expect(html).toContain(LABELS.inProgress); // the word — legible without colour
    expect(html).toContain("data-flow-inprogress");
    expect(html).toContain("state-running"); // the canonical token, not a typed value
    // …and it is NOT the escalation amber (that token is reserved for the gate).
    expect(html).not.toContain("state-escalated");
  });

  it("a STOPPED unit (delivered, awaiting review) shows no in-progress marker — the two are distinguishable", () => {
    const html = at("deliver");
    expect(html).not.toContain("data-flow-inprogress");
  });

  it("the token drives the colour: swapping --st-running would repaint every in-progress mark", () => {
    // Every amber affordance binds to the token via the `state-running` utility;
    // none hard-codes a hex/rgb. (Proven structurally — the class is the binding.)
    const html = at("work");
    const runningClasses = html.match(/state-running/g) ?? [];
    expect(runningClasses.length).toBeGreaterThanOrEqual(2);
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}/); // no literal hex colour in the floor markup
  });

  it("fixing is IN PROGRESS (amber), rejected is a STOP (red) — the two never share a colour", () => {
    const reject = at("qa-reject");
    expect(reject).toContain(">failed<"); // the bounce is red
    expect(reject).not.toContain("data-flow-inprogress"); // nobody is working at the bounce instant

    const fix = at("dev-fix");
    expect(fix).toContain("data-flow-inprogress"); // the same dev, now amber, working the fix
    expect(fix).toContain(LABELS.fixing);
  });
});

/* -------------------------------- item 3: two branches, one destination repo */

describe("Flow — the promotion: one repo, two arrows, each carrying repo · branch", () => {
  const scene = foldFlow(FLOW_LAST_PHASE, facts);
  const html = renderToStaticMarkup(<FlowFloor facts={facts} scene={scene} labels={LABELS} reduced />);

  it("the destination repo appears as its own node, once per repo", () => {
    const repoNodes = html.match(/data-flow-node="repo"/g) ?? [];
    expect(repoNodes.length).toBe(facts.repos.length);
  });

  it("EVERY card has its own arrow to the repo — no card left without a destination", () => {
    // Each landing arrow is a connector; once landed its tone is `verified`.
    const landingArrows = html.match(/data-flow-conn="verified"/g) ?? [];
    expect(landingArrows.length).toBe(facts.agents.length);
  });

  it("each arrow's label is repo · branch, DERIVED — two same-repo cards show two DISTINCT branches", () => {
    for (const a of facts.agents) expect(html).toContain(a.branch);
    const ove = facts.agents.filter((a) => a.repo === "openvibes-embark");
    expect(ove).toHaveLength(2);
    expect(new Set(ove.map((a) => a.branch)).size).toBe(2);
    // the branch text is present alongside its repo (the "repo · branch" label).
    expect(html).toContain("data-flow-branch");
    for (const a of ove) {
      expect(html).toContain(a.branch);
      expect(a.branch).not.toBe("dev");
      expect(a.branch).not.toBe("main");
    }
  });

  it("independence is legible in the promotion too: an approved branch is green while a bounced one is amber", () => {
    const fix = renderToStaticMarkup(
      <FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf("dev-fix"), facts)} labels={LABELS} reduced />,
    );
    // at dev-fix, the clean sibling has already landed (a verified landing arrow)…
    expect((fix.match(/data-flow-conn="verified"/g) ?? []).length).toBeGreaterThanOrEqual(1);
    // …while the bounced unit's landing arrow is still amber (running), not yet landed.
    expect(fix).toContain('data-flow-conn="running"');
  });
});

/* ---------------------------- the PE's flow as SCENE, not a transcribed diagram */

describe("Flow — the flow's IDEAS, expressed as scene (v4 read: not the sketch's furniture)", () => {
  const at = (phase: FlowPhaseId) =>
    renderToStaticMarkup(<FlowFloor facts={facts} scene={foldFlow(FLOW_PHASE_IDS.indexOf(phase), facts)} labels={LABELS} reduced />);
  const settled = renderToStaticMarkup(<FlowFloor facts={facts} scene={foldFlow(FLOW_LAST_PHASE, facts)} labels={LABELS} reduced />);
  const reject = at("qa-reject");
  const devFix = at("dev-fix");

  it("keeps the ideas: work enters through the PE, the coordinator splits it, each task has an owner and a QA", () => {
    expect(settled).toContain('data-flow-node="pe"');
    expect(settled).toContain("PE (you)");
    expect(settled).toContain(`classifies and dispatches ${facts.agents.length} tasks`);
    for (const a of facts.agents) {
      expect(settled).toContain(a.persona); // the owner, named
      expect(settled).toContain(a.repo); // and which repo they're on
    }
    for (const qa of facts.qaTeam) expect(settled).toContain(qa.persona);
  });

  it("the repo is ONE place the different branches land in — not separate destinations", () => {
    expect((settled.match(/data-flow-node="repo"/g) ?? []).length).toBe(facts.repos.length);
    for (const a of facts.agents) expect(settled).toContain(a.branch);
    for (const num of Object.values(facts.promotionPr)) expect(settled).toContain(`#${num}`);
  });

  it("DROPS the flowchart furniture: no labelled decision arc, no 'reproved?' caption, no 'adjust' label, no Task-N numbering", () => {
    for (const html of [settled, reject, devFix]) {
      expect(html).not.toContain("data-flow-decision");
      expect(html).not.toContain("reproved?");
      expect(html).not.toContain("adjust after the request");
      expect(html).not.toContain("Task 1 ·");
    }
  });

  it("the rejection is expressed by STATE + MOTION, not a drawn label: the card reddens and its dev↔QA path turns red to travel back", () => {
    expect(reject).toContain(">failed<"); // the card itself reddens
    expect(reject).toContain('data-flow-conn="failed"'); // the same path turns red — the work travels back
    expect(devFix).toContain("data-flow-inprogress"); // then the dev is amber, resuming the rework
    // and none of it is carried by a diagram caption
    expect(reject).not.toContain("reproved?");
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
