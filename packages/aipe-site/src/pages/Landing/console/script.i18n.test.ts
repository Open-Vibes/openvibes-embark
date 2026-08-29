import { describe, it, expect } from "bun:test";
import en from "../../../i18n/en";
import pt from "../../../i18n/pt";
import { buildBeats } from "./sceneModel";
import { SCRIPT_KEYS, buildFacts, type ScriptKey } from "./consoleScript";

/**
 * Roteiro regression gate — the brother of `glossary.coverage.test.ts`.
 *
 * The terminal types out the roteiro, and it is the part of the page a visitor
 * reads most, because it is the part that moves. The j-20260828-wr glossary gate
 * stopped an unexplained term from shipping; this one stops an untranslated
 * roteiro line. It closes the CLASS behind the "half-translated console" finding
 * (a PT frame around an English transcript): a roteiro line with no EN/PT pair,
 * or an English narration string that leaks into the rendered PT transcript,
 * FAILS the build.
 *
 * The single source is `SCRIPT_KEYS` (the narration the console speaks) crossed
 * against the two locale `console.script` dicts and the ACTUAL rendered beats in
 * both locales — so a new roteiro line can't skip its pair, and a command can't
 * be translated by mistake.
 */

/** The part of a narration string before any `{placeholder}` — its stable signature. */
function coreOf(text: string): string {
  return text.split("{")[0]!.trimEnd();
}

/** Every terminal line's text, in render order, for the given locale's script. */
function transcript(script: Record<ScriptKey, string>): string {
  return buildBeats(buildFacts(), script)
    .filter((b) => b.side === "terminal")
    .flatMap((b) => b.commands ?? [])
    .map((line) => line.text)
    .join("\n");
}

describe("console roteiro — proven EN/PT parity for every spoken line", () => {
  it("both locales define exactly the SCRIPT_KEYS set (no line lives in one language)", () => {
    const enKeys = Object.keys(en.console.script).sort();
    const ptKeys = Object.keys(pt.console.script).sort();
    const declared = [...SCRIPT_KEYS].sort();
    expect(enKeys, "en console.script keys drifted from SCRIPT_KEYS").toEqual(declared);
    expect(ptKeys, "pt console.script keys drifted from SCRIPT_KEYS").toEqual(declared);
  });

  it("every spoken line is present in both locales and actually translated (pt differs from en)", () => {
    for (const key of SCRIPT_KEYS) {
      const enText = en.console.script[key];
      const ptText = pt.console.script[key];
      expect(enText, `en roteiro "${key}" is empty`).toBeTruthy();
      expect(ptText, `pt roteiro "${key}" is empty`).toBeTruthy();
      // A copy-pasted English line (the exact half-translation bug) fails here.
      expect(ptText, `pt roteiro "${key}" = "${ptText}" is not actually translated`).not.toBe(enText);
    }
  });
});

describe("console roteiro — the rendered transcript honours the command/speech boundary", () => {
  it("the command a person types is byte-identical across locales (a command is never translated)", () => {
    // The runnable command is everything before any trailing `#` comment; the
    // comment itself is narration and is allowed (indeed required) to translate.
    const codeOf = (text: string): string => text.split("#")[0]!.trimEnd();
    const enBeats = buildBeats(buildFacts(), en.console.script);
    const ptBeats = buildBeats(buildFacts(), pt.console.script);
    expect(ptBeats.length).toBe(enBeats.length);
    for (let i = 0; i < enBeats.length; i++) {
      const enCmds = (enBeats[i]!.commands ?? []).filter((l) => l.kind === "command").map((l) => codeOf(l.text));
      const ptCmds = (ptBeats[i]!.commands ?? []).filter((l) => l.kind === "command").map((l) => codeOf(l.text));
      expect(ptCmds, `command code drifts at beat ${i}`).toEqual(enCmds);
    }
  });

  it("no English narration survives in the rendered PT transcript, and each line is really spoken", () => {
    const enText = transcript(en.console.script);
    const ptText = transcript(pt.console.script);
    for (const key of SCRIPT_KEYS) {
      const enCore = coreOf(en.console.script[key]);
      const ptCore = coreOf(pt.console.script[key]);
      // The key is actually rendered (guards a declared-but-dead roteiro line).
      expect(enText, `en roteiro "${key}" ("${enCore}") is declared but never rendered`).toContain(enCore);
      // The PT render speaks the translation…
      expect(ptText, `pt roteiro "${key}" ("${ptCore}") is not rendered in PT`).toContain(ptCore);
      // …and the English narration does not leak into the PT frame.
      expect(ptText, `English roteiro "${key}" ("${enCore}") leaked into the PT transcript`).not.toContain(enCore);
    }
  });
});
