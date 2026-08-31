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

## Journey j-20260829-b3 — compat-hero (Lawson)

Five things in one delivery: (1) honest harness compatibility, (2) a per-harness
accordion, (3) install ideology, (4) the hero = the PE's real flow, (5) the
console glossary shows process order. Plus the PE's cross-cutting demand: the site
must not read as *"AIPe is a Claude Code tool."* Every claim below was checked
against `aipe/src/harness/*.ts` and `aipe/src/start/start.ts`, not memory.

### (1)+(2) Compatibility — the truth, and the ruler

Source-of-truth read from `aipe/src/harness`:

| harness | adapter? | agentop hosts? | `aipe start` supported? | session-containable? | why (verbatim source) |
|---|---|---|---|---|---|
| claude-code | yes | yes (`claude`) | yes | **yes** | PreToolUse hook in `.claude/settings.json`, trusted headless |
| gemini | yes | yes (`gemini`) | yes | **yes** | BeforeTool hook; folder-trust *disabled by default* → no prompt on a fresh worktree (`gemini.ts:82`) |
| codex | yes | yes (`codex`) | yes | **no** | hook written but never trusted; needs interactive `/hooks`, no file-declarable trust (`codex.ts:61`); `containmentHook()` returns null |
| copilot | yes | yes (`copilot`) | yes | **no** | directory-trust default-ON for any new folder; the file trust list is global + unconfirmed for hooks (`copilot.ts:43`); returns null |
| generic | (fallback) | no (`null`) | yes (experimental) | **no** | file-only harness, no block-before-execute mechanism (`generic.ts:80`) |

Key correction vs the old site: `codex`/`copilot` were shown with
`workspaceStatus: "coming-soon"`. That is **wrong** — `start.ts` HARNESSES marks
`claude-code, codex, gemini, copilot, generic` all `status: "supported"`; only
`antigravity` + `cursor` are `coming-soon`. The site conflated *workspace
availability* with *session containment*. The accordion now separates the two.

**Host × contain number.** `agentop` HOSTS ten harnesses (the print, = the PDD
list). AIPe fully CONTAINS two. Both true; the section names the distinction
instead of hiding the smaller number. Modelled in `domain/harnessCompat.ts`
(`AGENTOP_HOSTED_COUNT = 10`, `FULLY_CONTAINED_COUNT = 2`, locked to the pricer's
`isSessionEligible` by `harnessCompat.test.ts`).

**The percentage has a visible ruler** — five checks, each verifiable in
`aipe/src/harness`, shown on the page: content-install · agentop-host ·
dedicated-adapter · interception-hook · trusted-headless. `%` = passed/5.
→ claude-code/gemini 100 · codex/copilot 80 · the six no-adapter 40. The first two
checks (content + host) pass for all ten — that IS the "install content vs contain
session" lesson: content install is the PDD-parity floor; headless containment is
the AIPe-only bar.

**No inflation.** The six PDD harnesses with no aipe adapter (Cursor, Antigravity,
Factory Droid, Kimi Code, OpenCode, Pi) are marked `not verified` / generic-path
only — never "supported." Each non-contained row carries the degraded path
(subagent, or a human-accepted session) **and what you lose** (AIPe stops
guaranteeing the agent can't leave its worktree).

### (3) Install ideology

The PE: *"AIPe is installable from its own CLI, not as a plugin."* The CODE agrees
— `start.ts` header: *"a compiled standalone executable needs no Bun/Node/npm …
installs into the workspace, never globally."* So the site's *"a Claude Code
plugin"* diverges from **both** code and ideology → fixed as copy, not escalated.
(An escalation would only be warranted if the *code* diverged from the ideology.)

### (4) Hero — element → product mapping (fidelity, not decoration)

`hero/HeroCanvas.tsx`, Canvas 2D, no new dependency. Each element maps to a real
AIPe mechanic; anything without a mapping was cut:

- four demand squares → demands entering **by area**;
- PE node → where the demand enters the system;
- coordinator node → decompose + dispatch;
- four specialist nodes, each tagged with a **different harness** (`claude`,
  `gemini`, `codex`, `antigravity`) → the multi-harness fan-out, *shown*;
- shared node (`MCPs · skills`) → the shared frameworks every specialist draws on;
- QA node the delivery passes **through** before a repo → the **wave-2** gate
  (QA after the dev, not parallel);
- a **red** token returning QA → specialist → the rejection + **correction loop**
  (only-success would lie about the product);
- repo squares → "integrated"; **two lanes deliver to the same square** → two
  specialists in one repo at once, made lawful by path-lock (`j-20260826-xj`).

`prefers-reduced-motion`: one complete static frame freezes a token on every lane
— including the red rejection and the two-into-one convergence — so the whole
story reads without motion or sound.

### (5) Console glossary — order without lying about nature

The twelve terms were a flat list. Classified against the aipe operate flow
(`domain/dispatchLaw.ts`, `envelope.ts`, `ledger.ts`, and `how.operation` copy),
justified here:

- **Stages** (numbered 1–5, the timeline of one demand): `journey` (opened from
  the demand) → `unit` (decomposed) → `sdd-lite` (each unit planned) → `wave`
  (grouped + runs) → `gate` (evidence, then QA). A stage occupies a point in the
  timeline.
- **Concepts** (un-numbered — they attach to a stage, they are not one):
  - *decisions* (how a dispatch is priced/gated): `envelope`, `tier`,
    `cost-index`, `gated`;
  - *things* (the machinery a stage runs on / writes to): `harness`, `worktree`,
    `ledger`.

Numbering all twelve would lie — a `ledger` is not a step, it is where steps are
written. The one **non-linear** marker (discreet, no second colour system): `gate`
carries a `↺` — a rejecting gate opens the correction loop, so the flow isn't a
straight line. Encoded in `GLOSSARY_TERMS` (`kind` + `order` + `loops`), rendered
by `ConsoleSection.tsx`, labels in `console.flow` (EN/PT).

### Claude-centric sweep — full audit (found · changed · kept, and why)

Criterion is the *impression*, not the word count: a visitor must not leave
thinking AIPe is a Claude Code tool. Truthful Claude Code mentions are **framed,
not deleted** (it is the default `aipe start` harness, the only one with full
containment, and `aipe handoff` really writes `CLAUDE.md`).

**Changed:**
- `i18n` hero eyebrow `a Claude Code plugin` → `a standalone CLI, not a plugin` (EN+PT).
- `i18n` hero body `turns Claude into a coordinator` → `turns your coding agent into a coordinator` (EN+PT).
- `i18n` footer tagline `a Claude Code plugin that coordinates…` → `a standalone CLI … in the agent harness you choose` (EN+PT).
- `i18n` company coordinator `The main Claude, with a name you give it` → `A coordinator agent you name, running in your harness — Claude Code by default` (role / persona / harness split) (EN+PT).
- `i18n` harnessSection: `Four harnesses. Two can be contained.` → `Ten harnesses can host it. Two, AIPe can fully contain.` (EN+PT).
- `HeroCanvas`: the fan-out now tags four **different** harnesses; the legend names them.
- `GetStarted` transcript picker `❯ Claude Code` → the full supported list.
- `installation.md`: `distributed as a Claude Code plugin` → `a standalone CLI … installs into whichever harness`.
- `quickstart.md`: `aipe start offers only Claude Code` (outdated) → the five supported workspace harnesses + the "default and most complete, but not a Claude Code tool" framing; `cd … && claude` marked as **one example**.
- `onboarding.md`: `each a skill in the plugin` → `a skill the coordinator runs`; `.claude/skills/…` persona path framed as the Claude Code path, with the Codex/Gemini/generic paths named.
- `handoff.md`: `install the plugin` → `install AIPe`; added why the file is named `CLAUDE.md`.
- `session-mode-dispatch.md`: the outdated "only Claude Code at `aipe start`" parenthetical → the two-axes (workspace vs containment) correction.

**Kept, and why (truthful, framed as an option not the idea):**
- `console` demo journey runs on `claude-code` — it is THIS site's real build journey; changing it would fake data. The harness section carries the multi-harness story.
- `glossary.harness` def "here, Claude Code" — "here" already frames it as the example.
- `session-mode-dispatch` containment table + cross-model-QA example (`claude-code` workspace dispatches QA to `gemini`) — accurate, and the example itself shows non-Claude use.
- `execution-envelopes.md` harness axis lists all four ids — accurate.
- `handoff` `CLAUDE.md` filename — the real artifact `aipe handoff` writes.

### Evidence
`bun test` 136/136 · `tsc --noEmit` clean · `vite build` clean · no new dependency
(hero is Canvas 2D). Driven in the browser, both themes, both locales.

## Journey j-20260830-58 — the Flow tells the whole method, not the happy path

`aipe skill match --task-type frontend --size medium` still returns
`matched=0 of 0` (no SDD kit), so the sdd-lite floor applies — this addendum
is the hand-authored spec. Scope is `packages/aipe-site/src/pages/Landing/flow/`
only (`FlowSection`, out of scope elsewhere: Hero, ConsoleSection, `dispatchLaw.ts`).

The PE reviewed the v3 Flow (merged as PR #27, **without a QA gate** — see
that journey's note in the ledger) and named three defects and two demands, in
this sequencing: (2) QA must be per repo, derived from the same law that
already derives the devs and repos — not a fixed reviewer box, which
contradicted the scene's own `2 repos` header; (3) the flow stopped at "PR
opened" and needs the real lifecycle through a QA **rejection**, the same dev
fixing on the same branch (never the QA), approval, a merge into `dev`, and a
**separate** promotion PR into `main`; (5), sequenced alongside 3 because the
new reject/promote actors need an envelope anyway, every actor (dev or QA)
must carry a distinct harness+model drawn from the real containment/tier
registries, never a literal per-actor string; (1), last because it depends on
how the now-longer cycle ends, the loop must keep looping but not erase its
prior cycle in a way that reads as a crash.

Full design rationale, the exact phase-by-phase model, and the verification
narrative (including the one real-Chrome boundary hit) are in
`src/pages/Landing/flow/README.md`'s "v4" section — this addendum only
records the acceptance mapping:

- **QA derived, not hardcoded**: `deriveQaTeam(repos)` — `flowModel.test.ts`
  proves the QA count tracks an arbitrary repo-count input (1/2/3/5 synthetic
  repos), not just the shipped 2-repo case.
- **Rejection visible, fixed by the same dev**: `FLOW_REJECTED_AGENT_ID`
  (Marco) goes `verified-track → rejected → fixing → verified`; its repo's QA
  (a different persona) goes `reviewing → rejected → approved`. Asserted at
  the phase-fold level and diffed in the rendered markup.
- **Two distinct PRs**: a dev-PR chip per agent (`PR → dev #41`) and a
  separate promotion chip per repo (`promote → main #141`), numbered from
  disjoint ranges, the promotion invisible until every dev PR in that repo
  has merged.
- **Harness+model from the real registry**: `envelopePool()` is the
  cross-product of `HARNESS_IDS.filter(isSessionEligible)` (`domain/harness.ts`)
  and the offered tiers (`fast`/`standard`/`reasoning` — `frontier` excluded
  as policy-gated); widening the harness list passed in changes the pool,
  proving it's derived, not literal. ≥3 distinct combinations ship.
- **No reset seco**: `FlowState.previousCycle` carries the prior cycle's
  `{merged, repos}` into the next cycle's opening fold and renders as a
  pinned header line; rows exit via `AnimatePresence` instead of a full
  card remount. Verified live in a real Chrome tab across two loop
  wraps, in both locales.
- **Progression preserved**: `entityCount` still strictly grows across ≥3
  distinct beats (now more, with the QA/PR/promotion entrances) — the v3
  criterion is unregressed.
- **Zero interactivity preserved**: the same source-scan + rendered-markup
  tests, now also covering the QA, promotion, and fixing states.

### Evidence
`bun test` 224/224 (up from 193; flow suite 76/76, up from 45) · `tsc --noEmit`
clean · `bun run build` clean. Driven live in a real Chrome tab over Tailscale
(both locales): confirmed the QA-per-repo split, the rejection/fix/approve
sequence with the correct actors, ≥3 live harness·tier combinations, the two
distinct PR artifacts, and the "last cycle" header line surviving into the
next two loop cycles, with no console errors and no horizontal overflow. This
repo has no PR CI; the exact commands and full output are in the PR body.
