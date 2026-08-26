import { describe, it, expect } from "bun:test";
import en from "../../../i18n/en";
import pt from "../../../i18n/pt";
import { buildBeats, CAPTION_BUDGET } from "./sceneModel";

const stageCaptionKeys = buildBeats()
  .filter((b) => b.side === "stage" && b.captionKey)
  .map((b) => b.captionKey!);

/**
 * The stage's per-step text budget is a hard limit, not a guideline. Assert it on
 * the ACTUAL rendered captions in both locales — a paragraph can never creep back.
 */
describe("console captions — within the one-line budget in every locale", () => {
  for (const [locale, dict] of [
    ["en", en],
    ["pt", pt],
  ] as const) {
    it(`${locale}: every stage caption is a short single line`, () => {
      for (const key of stageCaptionKeys) {
        const caption = dict.console.captions[key as keyof typeof dict.console.captions];
        expect(caption, `${locale} caption "${key}" is missing`).toBeDefined();
        expect(caption.length, `${locale} "${key}" = "${caption}" (${caption.length} chars)`).toBeLessThanOrEqual(
          CAPTION_BUDGET,
        );
        expect(caption.includes("\n")).toBe(false);
        expect((caption.match(/\. /g) ?? []).length).toBe(0);
      }
    });
  }

  it("both locales define a caption for every stage beat", () => {
    for (const key of stageCaptionKeys) {
      expect(Object.keys(en.console.captions)).toContain(key);
      expect(Object.keys(pt.console.captions)).toContain(key);
    }
  });
});
