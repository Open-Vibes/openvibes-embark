import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import FlowFloor, { type FlowFloorLabels } from "./FlowFloor";
import FlowTerminal from "./FlowTerminal";
import { buildFlowFacts, buildFlowTerminal, foldFlow, FLOW_LAST_PHASE } from "./flowModel";

const facts = buildFlowFacts();

const LABELS: FlowFloorLabels = {
  ariaLabel: "AIPe dispatching three agents across two repositories in parallel",
  coordinator: "coordinator",
  dispatchLaw: "dispatch law",
  parallel: "parallel",
  units: "units",
  repos: "repos",
  wave: "wave",
  placed: "placed",
  running: "running",
  worktree: "worktree",
  ledger: "ledger",
  receiving: "receiving…",
  caption: "all merged · immutable",
};

/* ------------------------------------------------ the reduced-motion still frame */

describe("Flow — the reduced-motion still frame is COMPLETE", () => {
  // The scene under prefers-reduced-motion opens on the folded last phase. That
  // one frame must carry the SAME information as the whole animation: every
  // agent, both repos, every state, the full ledger.
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

  it("carries a real alt text (role=img + aria-label), not aria-hidden decoration", () => {
    expect(html).toContain('role="img"');
    expect(html).toContain(LABELS.ariaLabel);
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
