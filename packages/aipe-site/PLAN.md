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
