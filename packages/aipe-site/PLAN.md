# aipe-site — Implementation Plan

## Architecture

- React 19 + Vite + Tailwind (CSS-variable token system), `react-router-dom` for
  `/` and `/docs/:slug`, `framer-motion` for orchestrated motion. GSAP/Three are
  **not** used — no scene here earns their bytes over framer-motion + SVG/Canvas.
- **Domain logic is pure and tested** (`src/domain/**`), separate from rendering, so
  the signature components consume a single tested source of truth:
  - `states.ts` — the canonical ledger status set + per-state glyph/label/blurb.
  - `dispatchLaw.ts` — `validateBatch` (serialize / parallel / cap-16 / session-cap /
    harness containment) and `scheduleWaves` (fan-out wave assignment).
  - `envelope.ts` — `costIndex = mode × tier × intensity`, `isGated`, viability.
  - `ledger.ts` — the scrubber state machine (`evaluateAttempt`, `reduceLedger`,
    canned scenarios) enforcing the evidence gate, QA gate, immutability, reason gates.
  - `harness.ts` — containment truth for the four harnesses.
- Docs are local markdown with frontmatter (`slug/title/description/group/order`),
  loaded via `import.meta.glob(..?raw)` + gray-matter, rendered with react-markdown.

## Signature components — what each mechanic encodes

1. **Dispatch Fan-Out** *(hero)* — demand → coordinator → N specialists into
   isolated worktrees, each returning a PR. Encodes the real law via `scheduleWaves`:
   distinct repos fire in the same wave (parallel); two units on the *same* package
   land in consecutive waves (serialize); the 16-wide ceiling is visible. Loops.
2. **Harness Bay** — four lanes (`claude-code`, `gemini`, `codex`, `copilot`) with
   their true status from `harness.ts`: claude-code + gemini containable /
   session-eligible; codex + copilot rejected `harness-not-containable`. Interactive.
3. **Journey Ledger scrubber** — a scrubbable timeline over `reduceLedger` scenarios;
   scrubbing into "delivered with no evidence" shows the ledger **REJECT
   (evidence-required)**, and "merge without QA" shows the QA gate blocking.
4. **Execution Envelope pricer** — the four axes (`mode`, `intensity`, `harness`,
   `tier`) as controls over `priceEnvelope`, producing a live `cost-index` and a
   `GATED` badge, with the "coarse relative index, never currency" caveat inline.

## Build order

1. Scaffold + design tokens + shell (Nav/Footer/theme toggle/routing). ✅
2. Pure domain modules + `bun test` (RED→GREEN). ✅
3. Landing prose sections + Hero + Get Started. ✅
4. The four interactive signature components (parallel), each replacing its stub. ▶
5. Docs content (all routed pages). ▶
6. Integration: code-split Docs off the landing route, verify build/tsc/tests,
   check both themes + AA + 320px + reduced-motion, screenshot, open PR.

## Journey j-20260825-55 — the Console Split, i18n, and the two blockers

Build order (each TDD, RED→GREEN where there is pure logic):

1. **(E) Footer version** — drop the hardcoded `aipe v0.3.1`; link to the live
   GitHub releases page. No stale string can rot. (No pure logic; visual.)
2. **(D) `ScrollToHash`** — port the pdd-site hardening: a double-`requestAnimationFrame`
   plus a `setTimeout(…, 300)` fallback re-check, `behavior:"instant"`, cleaned up
   on unmount. The new hero (A) reserves its height before content settles, so the
   `/#harness` target stops drifting under a settling page.
3. **(A/B) Console Split** — the centrepiece, folding in the ledger flow:
   - `domain/skillMatch.ts` (+ test) — `matchSkills(task)` routes a task across the
     shipped kits (`sdd-lite` floor · `spec-kit` · `pdd`) from real routing metadata
     (`taskTypes` · `skipFor` · `minSize`); a heavy kit is declined on a trivial task.
   - `pages/Landing/console/consoleScript.ts` (+ test) — the pure, framework-free
     model: an ordered list of **steps**, each a left-pane terminal exchange bound
     1:1 to a right-pane **meaning**. Every meaning's facts are derived
     (`scheduleWaves`, `validateBatch`, `priceEnvelope`, `matchSkills`, `reduceLedger`
     evidence/QA gates), never hand-set. Tests assert: the binding is total and
     bijective (every step ↔ exactly one meaning), the envelope maths (Lawson 64/GATED,
     Viola 8), the law verdicts (`same-package …` then two lawful `batch=1` waves),
     and the skill-match routing (floor always matches; heavy kit declined for the
     UI-dominant site unit).
   - `pages/Landing/console/ConsoleSplit.tsx` — two synchronised panes with a shared
     `activeStepId`; hovering/stepping either side highlights its partner (two-way
     trace). Pace controls: play/pause · step ‹/› · scrub · replay · speed. Reduced
     motion renders the whole flow, stepped, height-stable. Wired into `Hero` in
     place of `TheDispatch`.
   - Remove `signature/TheDispatch.tsx`, `signature/sceneScript.ts(+test)` (the 4-act
     scene is superseded) and `signature/LedgerScrubber.tsx(+test)` + `LedgerSection.tsx`
     (folded into the split). Drop `LedgerSection` from `Landing`.
4. **(C) i18n** — mirror `pdd-site/src/i18n` exactly: `locale.ts` (+ a `navigator`
   fallback for the brief's browser-language detection, kept pure/testable) · `en.ts`
   · `pt.ts` · `index.tsx` · `__tests__/locale.test.ts`; a `LangToggle` in the header;
   `I18nProvider` outside `BrowserRouter`. Following pdd exactly, the **docs chrome**
   (sidebar/nav/menu/code-block labels) is localised while doc **bodies stay English**
   (item labels come from markdown frontmatter). Landing prose is fully bilingual.

Test-file delta (documented in the PR): removed `LedgerScrubber.test.ts` (component
removed) and `sceneScript.test.ts` (4-act scene superseded); added
`skillMatch.test.ts`, `consoleScript.test.ts`, and `i18n/__tests__/locale.test.ts`.

## Redirect v2 — Terminal + Stage (supersedes the fused Console Split)

Files, all under `pages/Landing/console/`:

- `consoleScript.ts` — trimmed to the **proven facts only** (`buildFacts`: specialists,
  waves, law verdict, skill routing, envelope pricing, ledger gate outcomes). The prose
  `Meaning`/`Step`/`buildSteps` presentation is removed. Tests in `consoleScript.test.ts`
  now cover the surviving derivations.
- `sceneModel.ts` (+ `sceneModel.test.ts`) — the coordination layer: `buildBeats()` (the
  strictly alternating terminal↔stage stream, each stage beat carrying one `StageChange`
  + a budget-capped caption key) and `foldScene(beats, upTo)` (the cumulative
  `SceneState`). Tests assert: strict one-side-per-beat alternation, the caption budget,
  and that the folded state (envelope 64/gated, serialize with Viola queued, evidence
  rejected, QA blocked→open, merged/immutable) is derived from the domain.
- `Terminal.tsx` (+ `Terminal.test.tsx`) — pure/presentational; current command
  prominent, history dimmed; renders standalone.
- `Stage.tsx` (+ `Stage.test.tsx`) — pure/presentational scene of objects (pipeline,
  envelope panel, wave lanes, ledger track with gates); renders standalone; motion via
  framer-motion, dropped under reduced motion.
- `ConsoleScene.tsx` — the thin joiner: the shared step index, pace controls
  (play/pause/step/scrub/replay/speed), i18n labels + captions, fixed height (keeps D).
- `captions.i18n.test.ts` — asserts the real en+pt captions stay within budget.

Removed: `ConsoleSplit.tsx` (the fused, prose-card component). Wired `ConsoleScene`
into `Hero`. The `console` slice of `en.ts`/`pt.ts` is reshaped from step paragraphs to
captions + object labels.

## Journey j-20260826-19 — hero, console scale, console i18n

- **Hero** — new `pages/Landing/hero/HeroCanvas.tsx`: a decorative Canvas 2D fan-out
  (coordinator core → repo nodes; dispatch pulses out, PR tokens back; ambient parallax
  field). Pure DOM/canvas, no new deps. `Hero.tsx` becomes a tall animated hero (min
  `88vh`) with a two-layer scrim for AA contrast and a legend; it no longer embeds the
  console. Perf: DPR≤2, RAF stops off-screen (IntersectionObserver) and on
  `visibilitychange`; reduced-motion draws one static frame; palette read from live CSS
  vars, re-tinted on the `<html>` class-toggle via a MutationObserver.
- **Console section** — new `pages/Landing/ConsoleSection.tsx` wraps `ConsoleScene` in a
  `Section id="console"`, added to `Landing` right after the hero. `Terminal.tsx` and
  `Stage.tsx` pane heights go `26/32rem` → `56vh min-23rem` / `74vh max-48rem`. The
  `grid-cols-1 lg:grid-cols-2` stacking (round 2) is unchanged, so 320px stacks; proven
  by a Playwright pass at 320/1280 in light/dark/reduced (no horizontal overflow, equal
  panes). New i18n `console.section` copy (eyebrow/title/lead) explains what to watch.
- **Console i18n** — `ENVELOPE_AXIS_KEYS` + `envelopeAxisValues()` added to
  `consoleScript.ts`; `StageLabels.axes` renders localised glosses from `console.axes`
  in both dicts; `ConsoleScene` builds the rows. `captions.i18n.test.ts` extended
  (RED→GREEN) to require every axis glossed in both locales and the plain ones
  (`mode`/`effort`) actually translated. `Stage.test.tsx` fixture updated with `axes`.
- **Comprehension key** — `GLOSSARY_TERMS` in `consoleScript.ts` + `console.glossary`
  in both dicts define every AIPe noun the stage prints (journey, unit, envelope,
  cost-index, gated, wave, worktree, gate, ledger). `ConsoleSection` renders them as a
  responsive definition grid beneath the console (3-col → 1-col at 320px). Tests assert
  both locales define every term, each definition is a real phrase (len > term+6, has a
  space) not a bare token, pt≠en, and the set covers the stage's labels.

Evidence: `bun test` (all suites), `tsc --noEmit` silent, `bun run build` clean with
gzip reported, and a Playwright responsive/theme/reduced-motion sweep (screenshots +
overflow/stacking assertions). This repo has **no CI on PRs**, so QA is the only gate.

## Consistency with the monorepo

`.embark.jsonc` (cloudflare-pages, subdomain `aipe`, useSubmodule false), the
`apps.jsonc` entry, the root run-script and the generated workflow are produced by the
repo's own generator scripts so they match the other site packages.

## Acceptance

- `bun install` and `bun run --filter @embark/aipe-site build` clean; `tsc --noEmit`
  silent; no `any`.
- `bun test` passes in the package with real suites for the ledger state machine,
  the envelope cost-index, and the fan-out serialize/parallel/cap rules.
- The site renders; every landing anchor and every `/docs` route resolves; no console
  errors. Signature components 1/2/4/5 exist and are interactive.
- Light + dark both complete; AA contrast on text in both. Layout holds from 320px; no
  horizontal body scroll. `prefers-reduced-motion: reduce` yields a complete page.
- Truthfulness gate satisfied (see `SPEC.md`).
