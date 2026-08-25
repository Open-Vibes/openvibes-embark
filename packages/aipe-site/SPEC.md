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
