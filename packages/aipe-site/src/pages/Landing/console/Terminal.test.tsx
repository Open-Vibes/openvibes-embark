import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import Terminal from "./Terminal";
import { buildBeats } from "./sceneModel";

const beats = buildBeats();

/** The Terminal renders on its own — no provider, no sibling component, no DOM. */
describe("Terminal — renders standalone", () => {
  it("renders without throwing and shows its header", () => {
    const html = renderToStaticMarkup(
      <Terminal beats={beats} activeBeat={3} activeDecision="journey" header="terminal" runningLabel="running" />,
    );
    expect(html).toContain("terminal");
    expect(html.length).toBeGreaterThan(0);
  });

  it("brings the current command to the fore and its running label", () => {
    // activeBeat 4 is the 'route' terminal beat (index 6? compute by lookup).
    const routeTerminal = beats.find((b) => b.decision === "route" && b.side === "terminal")!;
    const html = renderToStaticMarkup(
      <Terminal beats={beats} activeBeat={routeTerminal.index} activeDecision="route" header="terminal" runningLabel="running now" />,
    );
    // the running command line is present in full
    expect(html).toContain("aipe skill match");
    expect(html).toContain("running now");
    // it is marked as the current step
    expect(html).toContain('aria-current="step"');
  });

  it("recedes earlier commands (does not show their later output lines)", () => {
    const dispatchTerminal = beats.find((b) => b.decision === "dispatch" && b.side === "terminal")!;
    const html = renderToStaticMarkup(
      <Terminal beats={beats} activeBeat={dispatchTerminal.index} activeDecision="dispatch" header="terminal" runningLabel="now" />,
    );
    // the current dispatch command shows in full...
    expect(html).toContain("aipe session dispatch");
    // ...but the earlier journey command's OUTPUT line is collapsed away (only its
    // first line survives as a dimmed history entry).
    expect(html).not.toContain("1 demand → 1 ledger");
  });
});
