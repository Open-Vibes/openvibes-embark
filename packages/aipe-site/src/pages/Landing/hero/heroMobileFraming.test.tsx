import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "../../../i18n";
import Hero from "../Hero";

/**
 * Guards the ONE thing this round changed: on a phone the hero scene must be a
 * self-contained CARD with its legend attached — NOT the full-bleed backdrop that
 * hides the pipeline behind the paragraph. It cannot measure pixel legibility
 * (no DOM/visual harness in this repo; that is covered by device screenshots in
 * the PR), but it does bite the structural regression.
 *
 * SSR has no `window`, so `useMediaQuery` resolves `false` and Hero renders its
 * NARROW branch — exactly the mobile framing we want to lock. If someone reverts
 * mobile to the desktop backdrop, the card/scrim assertions below fail.
 */
const render = (node: unknown) => renderToStaticMarkup(h(I18nProvider, null, node as never) as never);

describe("Hero — mobile framing (the narrow branch SSR renders)", () => {
  const html = render(h(Hero));

  it("frames the scene as a dedicated card (a <figure>), not a bare backdrop", () => {
    expect(html).toContain("<figure");
  });

  it("mounts exactly one canvas — the card's panel, with no backdrop copy behind text", () => {
    expect(html.match(/<canvas/g)?.length ?? 0).toBe(1);
  });

  it("drops the desktop contrast scrim (which only exists behind a full-bleed backdrop)", () => {
    // Its reappearance on mobile would mean the backdrop framing regressed.
    expect(html).not.toContain("linear-gradient(100deg");
  });

  it("keeps the four-beat legend the card names", () => {
    for (const beat of ["coordinator", "fan-out", "QA rejects", "merged to repos"]) {
      expect(html, `legend beat "${beat}" missing on mobile`).toContain(beat);
    }
  });

  it("keeps the install command in the mobile column", () => {
    expect(html).toContain("curl -fsSL");
  });
});
