import { describe, it, expect } from "bun:test";
import en from "../../../i18n/en";
import pt from "../../../i18n/pt";
import { buildBeats, CAPTION_BUDGET } from "./sceneModel";
import { ENVELOPE_AXIS_KEYS } from "./consoleScript";

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

/**
 * The stage's envelope panel prints four axis glosses (mode / harness / tier /
 * effort). Those are the reader's words *about* the dispatch, so they must come
 * from i18n and translate — not sit hardcoded in English in `Stage.tsx`. The axis
 * VALUES (session, claude-code, reasoning, ultracode) are literal identifiers and
 * stay as-is; only the glosses translate. `ENVELOPE_AXIS_KEYS` is the single
 * source both the component and this test read, so a new axis can't skip i18n.
 */
const AXIS_GLOSS_BUDGET = 16;
describe("console envelope axes — glossed through i18n in every locale", () => {
  it("both locales define a gloss for every envelope axis", () => {
    for (const key of ENVELOPE_AXIS_KEYS) {
      expect(Object.keys(en.console.axes), `en missing axis "${key}"`).toContain(key);
      expect(Object.keys(pt.console.axes), `pt missing axis "${key}"`).toContain(key);
    }
  });

  for (const [locale, dict] of [
    ["en", en],
    ["pt", pt],
  ] as const) {
    it(`${locale}: every axis gloss is a short, present word`, () => {
      for (const key of ENVELOPE_AXIS_KEYS) {
        const gloss = dict.console.axes[key];
        expect(gloss, `${locale} axis "${key}" is empty`).toBeTruthy();
        expect(gloss.length, `${locale} "${key}" = "${gloss}" (${gloss.length} chars)`).toBeLessThanOrEqual(
          AXIS_GLOSS_BUDGET,
        );
      }
    });
  }

  it("the plainly-translatable axes actually differ between locales", () => {
    // `harness` and `tier` are product jargon kept verbatim in pt (as elsewhere in
    // the site); `mode` and `effort` are ordinary words and must be translated.
    expect(pt.console.axes.mode).not.toBe(en.console.axes.mode);
    expect(pt.console.axes.effort).not.toBe(en.console.axes.effort);
  });
});
