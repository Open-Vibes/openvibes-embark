# aipe-site — Package Spec

The public marketing **landing + docs** site for **AIPe** (the AI Product Engineer),
deployed to `aipe.openvibes.tech` as an Embark package on Cloudflare Pages.

`aipe skill match --task-type frontend --size large` returned `matched=0 of 0`, so no
SDD kit applies; this spec + the sibling `PLAN.md` are the hand-authored SDD artifact.

## Goal

Sell a product that is hard to explain in prose — a PE hands over a demand, a
coordinator decomposes it and fans specialists into isolated worktrees under a
parallel-dispatch law, each returning a PR, across harnesses, with a journey ledger
and evidence gate behind it. The site must **show** this, not just assert it, while
holding typography rhythm, contrast, bundle size and LCP.

## Truthfulness gate (hard requirement)

Every factual claim is traceable to the `aipe` repo (`github.com/blpsoares/aipe`,
`README.md`, `docs/dossie/**`, `src/**`). In particular:

- **Shipped version is `0.3.1`.** The working tree is bumped to `1.0.0` but that is
  unreleased — the site must not present `1.0.0` as shipped.
- **Ledger statuses are the 8 canonical `DispatchStatus` values:** `dispatched ·
  delivered · verified · failed · escalated · merged · removed · redirected`.
  `running` is the session-mode transient; `REJECT` is a CLI output line, not a status.
- **Concurrency cap is 16** (`MAX_CONCURRENT`); session cap is 4.
- **cost-index = mode × tier × intensity**, and is a **coarse relative index, never
  currency**.
- **Harness truth:** `claude-code` and `gemini` are containable / session-eligible;
  `codex` and `copilot` are rejected with `harness-not-containable`. These are
  **PENDING**, never presented as shipped: `aipe session grant` redemption,
  codex/copilot session containment, non-Claude-Code harness adapters.

## Design system

- **Dark-first** canvas with a **complete light theme**, both driven by CSS-variable
  RGB triples so one class name resolves in either theme (Tailwind `rgb(var(--x) /
  <alpha>)`). `.dark` is set before first paint; a toggle persists the choice.
- **Primary hue — "Iris" violet** (`#8b7dff` dark / `#6242e0` light), deliberately
  **not** pdd-site's `#5eb8ff`. Justification: AIPe is a *coordinator that composes
  many agents into one result*; violet — the synthesis of the spectrum — encodes
  orchestration, not "another blue dev tool".
- **Semantic state ramp** is the palette's spine: one tuned hue per ledger status,
  distinguishable in both themes and under common CVD, and **never carried by color
  alone** — always paired with a glyph and a label (see `src/components/StateBadge.tsx`).
- **Type:** Sora (display) · Inter (text) · JetBrains Mono (terminal/ledger). A held
  vertical rhythm on a `0.5rem` grid.
- **WCAG AA** contrast on all text in both themes.

## Journey j-20260825-55 addendum — the Console Split, i18n, and two QA blockers

`aipe skill match --task-type frontend --size large` (and `--task-type feature`)
still returns `matched=0 of 0` — no SDD kit is installed in this workspace, so the
`sdd-lite` floor applies: this short spec + `PLAN.md` are the hand-authored SDD
artifact for the journey (evidence recorded below).

This journey supersedes the hero's **4-act Dispatch scene** and the **Ledger
Scrubber**, adds **pt/en i18n**, and closes two QA-gate blockers.

- **(A) The Console Split** replaces `signature/TheDispatch.tsx` (the 4-act scene)
  and its `sceneScript.ts`. Two synchronised panes: **left** a real terminal
  (the PE's demand, the coordinator's reply, and real `aipe`/`agentop` commands
  with their real output shapes — `JOURNEY j-…`, `MATCH …`, `OK batch=1`,
  `REJECT same-package <fqid>`, `OK <fqid> → <sessionId>`, `GATED …`); **right**
  the *meaning* of each line — the specialist chosen and why, the envelope on its
  four axes with `cost-index` + `GATED`, the `aipe skill match` routing between
  `sdd-lite` (floor) and a heavier kit, the worktree carved, the law admitting or
  serialising the batch. **Binding rule:** every right-pane datum is *caused by* a
  specific left line; hovering or stepping either highlights the other, both ways.
  All right-pane facts are **derived** (via `scheduleWaves`, `validateBatch`,
  `priceEnvelope`, `matchSkills`), never hand-set. The reader controls pace
  (step · scrub · replay · speed); each step is self-explanatory without prior AIPe
  vocabulary; `prefers-reduced-motion` yields the whole flow, stepped, never empty.
  The scene is **height-stable by construction** (its box is reserved before
  content settles) so it never moves an anchor target out from under the scroll.
- **(B) The Ledger Scrubber is removed** (`signature/LedgerScrubber.tsx` + test +
  `LedgerSection.tsx`). Its *information* — `dispatched → delivered (with evidence)
  → verified → merged`, the ledger's REJECT on an evidenceless delivery, and the
  QA gate blocking a premature merge — **folds into the Console Split** as its
  closing steps, so the flow reads once, in one place, without a drag control.
- **(C) i18n (pt + en)** mirrors `packages/pdd-site/src/i18n/` exactly
  (`en.ts` · `pt.ts` · `locale.ts` · `index.tsx` · `__tests__/locale.test.ts`),
  plus a header switch and browser-language detection with a persisted override.
  Portuguese reads as written in Portuguese. Code/identifiers/commits stay English.
- **(D)** `ScrollToHash.tsx` is hardened to the pdd-site pattern (double-rAF +
  a `setTimeout` fallback re-check, `behavior:"instant"` after a cross-page nav)
  so a hard reload on `/#harness` lands in-section even as late content settles.
- **(E)** The footer's hardcoded `aipe v0.3.1` is **removed**, not bumped: this
  site lives in `openvibes-embark`, with no build-time access to the `aipe` repo's
  release number, so any hardcoded string rots (and violates the truthfulness
  gate) within a day. The footer instead links to the live GitHub releases page,
  which is current by definition. Argued in the PR.

## Redirect v2 — the hero is two components (Terminal + Stage), not one prose panel

The PE rejected v1's Console Split: *"ainda tá MUITO difícil de entender… tá muita
informação sendo cuspida de ambos os lados… deveria ser algo separado."* The failure
was v1 asking for "what that line means" — a request for prose — and getting a column
of paragraph cards. v2 rebuilds the presentation (the proven domain layer stays):

- **Two independent components, own files/state/tests, no cross-imports**, joined by
  a thin coordination layer (`sceneModel.ts`: a shared step index + an ordered beat
  stream). `Terminal.tsx` and `Stage.tsx` each render and are tested standalone
  (`react-dom/server`, no provider, no DOM) — asserted in `Terminal.test.tsx` /
  `Stage.test.tsx`. The joiner is `ConsoleScene.tsx`.
- **The right pane is a stage, not a document.** The coordinator and specialists are
  objects; allocation is movement (a specialist appears, is carved a worktree, takes a
  wave lane, queues behind another in the same package); a decision is a visible state
  change (the envelope axes settle, the cost-index resolves to 64, the gate padlock
  snaps to GATED, the evidence/QA gates flip open→blocked). Parallel work is parallel
  lanes; serialised work is a queue. Depth is used only where it carries meaning (the
  queued token sits behind).
- **Hard limits, enforced not eyeballed.** Right-pane text is **one short line per
  step** (`CAPTION_BUDGET = 40` chars, asserted on the real en+pt captions in
  `captions.i18n.test.ts`), never a paragraph. The terminal shows the **current
  command prominently**; history recedes to one dimmed line each. **One side changes
  per beat** — the beat stream strictly alternates terminal→stage (asserted), so a
  reader paused on any beat can say what just happened. `prefers-reduced-motion` opens
  on the complete, still scene.

Everything on the stage is still DERIVED (`scheduleWaves`, `validateBatch`,
`priceEnvelope`, `matchSkills`, the ledger `evaluateAttempt`), never hand-set. The
i18n, the anchor fix (D) and the version fix (E) from v1 are unchanged.

## Journey j-20260826-19 — hero, console scale, console i18n

Three targeted changes; round 2 (Terminal + Stage, two-way domain search, landing/docs
i18n, anchor + version fixes) is preserved, not rebuilt.

- **(1) A hero worthy of the product.** The old gradient-only hero is replaced by an
  animated backdrop that *is* AIPe's nature: a coordinator core fans specialist
  dispatch pulses out to a column of repo nodes, and each landing pulse sends a PR
  token back to merge at the core. It is a bespoke **Canvas 2D** scene
  (`hero/HeroCanvas.tsx`) — reference-calibre depth/motion (ambient parallax field,
  additive-blended pulses, a breathing hub) taken from `embark-site/src/hero.ts`, but
  truer to AIPe than generic particles and with **zero** new bundle weight (no `three`
  dependency — a deliberate choice to hold the gzip budget). The headline stays plain
  DOM (LCP element, paints before the canvas mounts); a scrim keeps copy at AA in both
  themes; the canvas reads live theme vars and re-tints on toggle; the RAF loop stops
  off-screen and on tab-hidden and is DPR-capped at 2. `prefers-reduced-motion` draws
  one complete still frame (edges, nodes, frozen pulses **and** PR tokens). A legend
  names the three things the motion shows, so it is documentation, not decoration.
- **(2) The console gets its own near-full-viewport section.** `ConsoleScene` moves
  out of the hero into `ConsoleSection.tsx`; each pane is `56vh` (min `23rem`) stacked
  and `74vh` (max `48rem`) side-by-side, so terminal and stage both have room. At
  320px the two panes stack, no horizontal overflow, text wraps and stays readable —
  verified with Playwright (`overflowX:false`, equal stacked panes) not one screenshot.
- **(3) The console's envelope-axis glosses go through i18n.** `mode / harness / tier /
  effort` were hardcoded English in `Stage.tsx`; they now come from `console.axes` in
  both dicts (`mode→modo`, `effort→esforço`; `harness`/`tier` kept as product jargon,
  as elsewhere). The axis VALUES (`session · claude-code · reasoning · ultracode`) are
  literal identifiers and stay English. `captions.i18n.test.ts` is extended to assert
  every axis is glossed in both locales (RED→GREEN); `ENVELOPE_AXIS_KEYS` in
  `consoleScript.ts` is the single source the component and the test share.
- **(4) Comprehension standard (team policy): no unexplained jargon.** The console is
  dense with AIPe vocabulary (journey, unit, envelope, cost-index, gated, wave,
  worktree, gate, ledger). A **plain-language key** sits beneath the console
  (`ConsoleSection.tsx`) defining every one of those nouns in one short, localised
  sentence — so a reader with no AIPe words can follow it. It is a static reference,
  NOT more text on the stage (round 2's one-caption-per-beat rule stands). `console.
  glossary` in both dicts + `GLOSSARY_TERMS` in `consoleScript.ts` are the single
  source; `captions.i18n.test.ts` asserts every noun is defined, in both locales, as a
  real phrase (not a bare token) and actually translated pt≠en.

## Scope

- **Landing** (in order): Hero + Dispatch Fan-Out · The problem · The company analogy ·
  How it works (two phases) · The laws · Journey Ledger scrubber · Multi-harness bay ·
  Execution Envelope pricer · Get started (install + `aipe start` + say hi, terminal replay).
- **Signature components (interactive, must-have 1/2/4/5):** Dispatch Fan-Out,
  Harness Bay, Journey Ledger scrubber, Execution Envelope pricer. Each encodes a
  **real mechanic** — see `PLAN.md`.
- **Docs** (`/docs`, sidebar + routed content, pdd-site pattern): Installation ·
  The two phases · Onboarding · Operation & the ledger · Laws & conventions ·
  Capabilities & execution envelopes · Session-mode dispatch · Toolbox · Web console ·
  Handoff · CLI reference.

## Motion contract

Every animation explains a real mechanic or is cut. `prefers-reduced-motion: reduce`
is honoured genuinely — the same information static or stepped, never an empty box.
No scroll-jacking. Budget: LCP < 2.5s, a stated initial-JS budget (docs-only
dependencies — react-markdown, rehype-highlight, gray-matter — are code-split off the
landing route).

## Acceptance

See `PLAN.md` §Acceptance — mirrors the assignment's acceptance list, with the
non-trivial logic (ledger state machine, envelope cost-index, dispatch
serialize/parallel/cap rules) covered by real `bun test` suites.
