import { describe, it, expect } from "bun:test";
import en from "../../../i18n/en";
import pt from "../../../i18n/pt";
import {
  AIPE_UNIT_TASK,
  ENVELOPE_AXIS_KEYS,
  GLOSSARY_TERMS,
  PRESENTED_VOCABULARY,
} from "./consoleScript";
import { matchSummary } from "../../../domain/skillMatch";

/**
 * Comprehension regression gate (team policy, PE-set): a reader with no AIPe
 * vocabulary must be able to look up every jargon term the console shows them.
 * "The text exists" is not the bar — "a reader with no context understands" is.
 *
 * This suite closes the CLASS behind the `sdd-lite (floor/base)` finding: it fails
 * the moment a term the stage presents has no plain-language glossary entry in BOTH
 * locales. The single source is `PRESENTED_VOCABULARY` (the tokens the stage prints)
 * crossed against `GLOSSARY_TERMS` (what the glossary renders) and the two locale
 * dictionaries — so a new unexplained term breaks the build instead of depending on
 * anyone to remember.
 */

/** Resolve a presented token to the glossary key that defines it (by label). */
function glossKeyFor(term: string): string | undefined {
  return GLOSSARY_TERMS.find((g) => g.label === term)?.key;
}

/** A definition must actually explain: longer than the term, and a real phrase. */
function assertRealDefinition(locale: string, term: string, def: string | undefined): void {
  expect(def, `${locale} glossary is missing a definition for "${term}"`).toBeTruthy();
  expect((def ?? "").length, `${locale} "${term}" = "${def}" is too short to explain`).toBeGreaterThan(
    term.length + 6,
  );
  expect((def ?? "").trim().includes(" "), `${locale} "${term}" is a bare token, not a phrase`).toBe(true);
}

describe("console glossary coverage — every presented AIPe term is explained", () => {
  it("each presented term resolves to a rendered, bilingual plain-language entry", () => {
    for (const term of PRESENTED_VOCABULARY) {
      const key = glossKeyFor(term);
      // Rendered: the glossary component maps GLOSSARY_TERMS, so a presented term
      // with no matching label would never appear beneath the console.
      expect(key, `presented term "${term}" has no glossary entry (label match in GLOSSARY_TERMS)`).toBeTruthy();
      assertRealDefinition("en", term, en.console.glossary[key as keyof typeof en.console.glossary]);
      assertRealDefinition("pt", term, pt.console.glossary[key as keyof typeof pt.console.glossary]);
    }
  });

  it("the routed-kit pill token is glossed (the exact finding — no regression)", () => {
    // The stage pill prints whatever kit the real router surfaces (here "sdd-lite").
    // Whatever lands on the pill must be a term a reader can look up.
    for (const kit of matchSummary(AIPE_UNIT_TASK).routed) {
      expect(PRESENTED_VOCABULARY as readonly string[], `routed kit "${kit}" shown on the pill is not declared as presented vocabulary`).toContain(kit);
      const key = glossKeyFor(kit);
      expect(key, `routed kit "${kit}" has no glossary entry`).toBeTruthy();
    }
  });

  it("every untranslated (jargon) envelope axis chip is glossed", () => {
    // An axis gloss identical in both locales is untranslated product jargon
    // (harness, tier) — a newcomer needs it defined. Translated axes (mode/modo,
    // effort/esforço) are ordinary words and are intentionally left plain. This
    // derives the jargon set mechanically, so a new jargon axis can't skip a gloss.
    for (const key of ENVELOPE_AXIS_KEYS) {
      const gloss = en.console.axes[key];
      const isUntranslatedJargon = gloss === pt.console.axes[key];
      if (!isUntranslatedJargon) continue;
      expect(PRESENTED_VOCABULARY as readonly string[], `jargon axis "${gloss}" printed on the stage is not declared as presented vocabulary`).toContain(gloss);
      const glossaryKey = glossKeyFor(gloss);
      expect(glossaryKey, `jargon axis "${gloss}" has no glossary entry`).toBeTruthy();
    }
  });
});

describe("console glossary — proven EN/PT parity", () => {
  it("both locales define exactly the same set of glossary keys", () => {
    const enKeys = Object.keys(en.console.glossary).sort();
    const ptKeys = Object.keys(pt.console.glossary).sort();
    expect(ptKeys, "en and pt glossary key sets differ — an entry lives in only one language").toEqual(enKeys);
  });

  it("every rendered glossary term is defined, and differs, in both locales", () => {
    for (const { key } of GLOSSARY_TERMS) {
      const enDef = en.console.glossary[key];
      const ptDef = pt.console.glossary[key];
      expect(enDef, `en missing rendered glossary "${key}"`).toBeTruthy();
      expect(ptDef, `pt missing rendered glossary "${key}"`).toBeTruthy();
      expect(ptDef, `pt "${key}" is not actually translated`).not.toBe(enDef);
    }
  });
});
