# The Flow — an ambient, non‑interactive scene

`packages/aipe-site/src/pages/Landing/flow`

A person who lands on the site has to **see AIPe working**, not read about it:
flow going out, agents receiving it, work happening in parallel, review arriving
after. This directory is that scene. It runs on its own and the visitor watches —
there is nothing to press.

It is mounted once, as its own section (`FlowSection`) right after the hero and
before the Console. It does **not** touch the hero (`#22`'s mobile card) or the
`ConsoleSection` (both out of scope), and it is not a backdrop behind anything.

## The five things that are the PE's, and are not negotiable

1. **The flow is above the terminal**, in the foreground — not decoration behind
   the hero.
2. **It dispatches as the agents work** — the movement is the message.
3. **At least 3 agents across 2 repos**, visible at the same time — real
   cross‑repo parallelism.
4. **No interactive player** — no play, pause, scrub, or draggable timeline.
5. **No clickable content** — no card, node, or step responds to a click.

## The decisions that were mine, and why

### Stack, not fuse — the flow floor sits *above* a terminal log, in one card

The PE offered "above the terminal **or** integrated with it" and left the choice
to me. I stacked them.

The two panes carry different information at different scales. The **floor** is
*spatial*: who is where, and that three agents in two repos are moving at once —
that reading only works if it owns its full width. The **terminal** is *textual*:
the exact command that just went out. Fusing them into one pane forces one below
legibility, and it breaks first at 320–390px, which is exactly where the `#22`
mobile work said we must not regress. Stacked, each owns its width: on a phone the
floor becomes a short vertical column of repos and the terminal a few lines under
it, both readable.

Stacking also matches the causal reading order the PE asked about: the floor
dispatches (top), and the terminal is the **log/consequence** of that dispatch
(bottom) — "the terminal as a consequence of what the flow just dispatched."

### A third component — but built on what already passed the gate

`HeroCanvas` and `ConsoleScene` both exist and are good, so the brief asked
whether to reuse one, fuse them, or build a third thing. I built a third thing,
and reused the parts that matter:

- **Not `HeroCanvas`.** It is a decorative `aria-hidden` `<canvas>` with no labels
  and no real repos or agents — it carries the *metaphor* but no *information*, and
  the brief explicitly rejects "backdrop behind the hero as decoration." This scene
  must carry information (real repos, real agents, real states), so it is labelled
  DOM, legible and screen‑reader‑readable at 320px, not a canvas.
- **Not `ConsoleScene`.** It is an interactive player — play/pause, a draggable
  scrub, clickable beats — which requirements 4 and 5 forbid, and which is out of
  scope to change anyway.
- **What I did reuse is the substrate that passed the gate:** the *real* dispatch
  law (`domain/dispatchLaw` — `scheduleWaves`, `validateBatch`) proves the
  parallelism instead of me asserting it, and the site's token/state vocabulary
  (`StateBadge`, the state color ramp, the mono label style) keeps it in the same
  house style as the console. `flowModel.ts` is the pure, framework‑free model —
  the same split the console uses (`consoleScript`/`sceneModel`).

### Why 3 agents across 2 repos, and why it can't be 1 repo

The one thing that distinguishes AIPe is **real parallelism across repositories**.
The law serializes work that shares a package key (`repo/package`); distinct
packages and repos run in the same wave. The scene runs the real law over three
units:

| agent  | role          | repo               | package       |
| ------ | ------------- | ------------------ | ------------- |
| Lawson | dev‑fullstack | openvibes‑embark   | aipe‑site     |
| Marco  | dev‑fullstack | openvibes‑embark   | embark‑site   |
| Jane   | dev‑fullstack | agentistics        | web           |

Three distinct package keys → `validateBatch` returns `ok` and `scheduleWaves`
lands all three in **one wave**. That is the honest picture: two repos, three
agents, moving at once. The tests assert this against the real law, so the claim
can't rot into a lie.

### Loop with a beginning and an end, then a settled hold

The PE flagged the tension: an ambient loop is what "non‑interactive" implies, but
a cycle that always restarts from an empty void gets tiring for someone reading the
fold for 20 seconds. So each cycle is a **complete arc** — demand → validate →
dispatch → parallel work → PRs return → review verifies → all merged — and then it
**holds on the settled, complete frame** for a beat before a gentle fade back to
the start. A viewer who arrives mid‑loop lands on a coherent picture, and a viewer
who watches the settle sees the story finish before it begins again.

The settled hold is **3400 ms** (the `merged` phase's dwell in
`flowModel.ts`); the whole cycle is ≈ 19.6 s (2.2 + 2.6 + 2.4 + 3.8 + 2.6 + 2.6 +
3.4 s), and the reset crossfade is 500 ms. Those are the numbers to tune if the
loop ever feels rushed or draggy — they live in `FLOW_PHASES`, one place.

### The terminal, while the floor runs

The terminal is the **log of what the floor just did**: each phase the floor
enacts, the terminal prints the command/output that caused it (the real `aipe`
verbs, English in every locale per the site's command/speech boundary), plus a
couple of translated narration lines. It is illustration, not live telemetry
(syncing to a real `aipe serve` console is explicitly out of scope).

## The hard constraints, and how each is met

- **`prefers-reduced-motion` → one complete static frame.** The model's last phase
  (`merged`) is the whole scene: coordinator, both repos, all three agents in their
  final `merged`/`verified` state, the full terminal log, the ledger fully lit. Under
  reduced motion `FlowScene` renders exactly that folded frame with the clock never
  started — the same information, standing still. Not a degraded version.
- **Mobile legible at 390px and 320px.** The floor is a wrapping flex/grid column;
  repos stack, agent rows wrap, the terminal is a few lines. Measured in a real
  browser (see below), not a resized inspector.
- **No horizontal overflow at any width.** The card is `overflow-hidden`; the
  moving token/rail layer is absolutely positioned *inside* a clipped stage, so it
  can never push page width. Verified by measuring `scrollWidth <= clientWidth`.
- **Site palette, both themes.** Every color is a theme token (`--brand`, the
  `--st-*` state ramp, surfaces/lines); nothing is hard‑coded. Verified in light and
  dark.
- **a11y.** The scene *carries information*, so it is not `aria-hidden`: the whole
  floor is a single `role="img"` with a full `aria-label` describing what it shows
  (three agents across two repos, dispatched in parallel, PRs returning, review
  verifying, all merging), so a screen reader hears one coherent description rather
  than a stream of moving fragments. The purely decorative moving layers (the
  travelling rail pulses) are `aria-hidden`. The section's heading and lead are real
  text.

### Zero interactivity — proven, not asserted

There are **no** controls and **no** click handlers anywhere in the scene. Two
tests keep it that way: one scans the component sources and fails on any
`onClick`/`onMouseDown`/`role="button"`/`<button`/`<a `; the other renders the
scene to markup and asserts it contains no interactive element. The scene advances
only on an internal timer, which stops when off‑screen, when the tab is hidden, and
under reduced motion.

## How it was verified — and the one boundary I could not cross (the method)

Declared honestly per the brief ("device real com DPR, não inspector
redimensionado") and the coordinator's instruction to name a measurement I could
not take rather than narrate it as done.

**Verified in a real Chrome instance** (not a devtools device emulator), the built
site served over the host's Tailscale address at the browser's real DPR (1.5):

- The scene mounts and, while the tab is visible, its clock advances through the
  whole arc and loops — sampled live from the DOM: `demand` → `validate` (two
  repos, the law's `parallel` verdict) → `dispatch` (three agents `running`) →
  `work` (three `running` in parallel) → `deliver` → `review` (after) → `merged`
  (settled hold) → reset to the coordinator alone. All three agents (Lawson,
  Marco, Jane) and both repos (openvibes-embark, agentistics) are on screen at
  once.
- No horizontal overflow: `document.documentElement.scrollWidth === clientWidth`,
  and the card does not overflow itself, in **both** dark and light themes.
- Both themes resolve from tokens (light `--bg` = rgb(247,248,251),
  `--brand` = rgb(98,66,224); dark is the default canvas) — nothing hard-coded.
- The `role="img"` alt text (389 chars) is present; no console errors on load.
- The perf gate works: the clock pauses when `document.hidden` is true.

**The boundary — a real sub-640px viewport at 320/390px was NOT measurable on this
host.** The machine's screen is 2294 CSS px wide and the controlled window fills
it; `resize_window` reports success but does not constrain the page viewport below
the screen, a same-origin popup at `width=320` is blocked without a user gesture,
and the brief rules out a devtools device emulator. So I did **not** measure the
sub-640 mobile layout at real DPR, and I am not claiming I did.

What backs the mobile layout instead: it is mobile-first by construction —
single-column `flex`/`grid` that only upgrades to two columns at `sm:` (640px),
no fixed pixel widths, the card is `overflow-hidden`, and the moving rail is
clipped inside it. The `flow.render` test asserts the card does not overflow its
container. A QA pass on a real phone at 320/390px is the right next gate; the
`#22` precedent shows that check pays for itself.

The exact commands and their live output are in the PR's evidence.

## v3 — corrected after the PE's rejection of v2

The PE's own words, on what shipped in `#26`:

> "o fluxo do console ficou horrivel, era pra ser animado e ir spawnando cada
> agente/qa/criando pr etc a cada etapa e vc deixcou so 3 caras fixos ali sem
> realmente fazer oq deveria"

The coordinator diagnosed this in the real browser before re-dispatching: the
PE was NOT seeing the `prefers-reduced-motion` static fallback
(`matchMedia('(prefers-reduced-motion: reduce)').matches === false` on his
machine) — the cause was the design of the animated version itself, not
accessibility or a stale build.

**What v2 actually built:** all three agents present from frame 0, only their
badge and progress bar changing over the beats. Technically satisfied "3
agents in 2 repos, at once" and "dispatches as they work" if you read the
words narrowly — but the PE watched it and saw a status panel, not a
dispatch happening. Nothing *entered*.

**What v3 changes, structurally:** an agent is now **absent from the DOM**
(not merely idle-styled) until the clock reaches its own dispatch beat.
`flowModel.ts` gained one `FlowAgentFact.joinPhase` per unit and three new
phases — `dispatch-1`, `dispatch-2`, `dispatch-3` — so the three agents that
used to appear together the instant the law validated now enter **one at a
time**, in seed order (Lawson → `openvibes-embark`, Marco → the same repo's
second package, Jane → the second repo — which is also, for free, the moment
"3 agents, 2 repos" first becomes true on screen). QA (`Viola`) is a new
actor, absent until the `qa` phase, after delivery, never a badge tacked onto
a dev's row. Each PR is a new artifact chip, absent until its own `pr` phase,
separate from — and later than — the agent's "delivered" state.

The fold now exposes `FlowState.entityCount`: the number of actors/artifacts
on screen at a phase. It goes `0, 0, 1, 2, 3, 3, 3, 4, 7, 7` across the ten
phases — proof the scene is a progression, not a panel. `flowModel.test.ts`
asserts it never shrinks and grows at ≥3 distinct beats (the PE's own bar:
"capturar a contagem de atores/artefatos em pelo menos 3 instantes distintos
… e afirmar que ela cresce"); a check that only reads the final frame — which
is what v2's test suite effectively did — would have passed v2 and is
explicitly rejected as insufficient. `flow.render.test.tsx` goes one further
and diffs the actual rendered HTML at `dispatch-1`/`dispatch-3`/`qa`/`pr`:
`Marco` and `Jane` are provably absent from the `dispatch-1` markup (not
present-but-dimmed), `Viola` is absent before `qa`, no `#{pr}` number appears
before `pr`.

Everything the v2 gate already earned is unchanged: zero interactivity (the
same two tests still scan the four source files and the rendered markup for
any click handler or interactive element — that scan now additionally covers
the QA and PR chips), 3 agents/2 repos still derived from the real
`dispatchLaw` (`validateBatch`/`scheduleWaves`), the terminal log still
derives every command/output line from the same facts (now one dispatch line
per agent, plus a `gh pr create` line per PR — no invented strings), the
reduced-motion still frame is still the fold of the LAST phase — now with QA
and all three PRs visible, since "complete" grew to include them — and the
mobile/overflow/token constraints below are untouched code paths.

### How v3 was verified — and the boundary I hit this time

`tsc --noEmit` clean; the full flow suite is 45/45 (up from 33), the whole
package suite 193/193. `flow.render.test.tsx` renders `FlowFloor` at four
different phases via `renderToStaticMarkup` and diffs the actual HTML — this
is the "screenshot sequence" the acceptance criteria asks for, done as an
exact, reproducible assertion instead of an eyeballed image.

I also loaded the built dev server in a real Chrome tab (via the host's
Tailscale address, same method the `#26` verification used) and read the
live DOM: the scene opens on the correct empty `demand` frame — "recebendo a
demanda…", zero agents, zero PRs — matching the model exactly, with zero
console errors and no horizontal overflow (`scrollWidth === clientWidth` at
the tab's ~1522px width). **I could not sustain a live real-time observation
of the clock advancing through all ten phases in that tab.** This host runs
several concurrent automated Chrome sessions (agentop lists six active on
this machine right now, including another specialist in this same journey),
and the tab I drove was repeatedly backgrounded/frozen by Chrome — the page's
own `Page Visibility`-gated perf pause (documented above, and unchanged from
v2) correctly held the clock while `document.hidden` was true, and even
after a real click gave the tab OS focus, one polling script hit a 45s CDP
timeout with the renderer itself unresponsive. That is a shared-resource
limit of this host at this moment, not a defect in the scene — the
`flow.render.test.tsx` markup diffs across phases are the reliable substitute
and were run repeatedly, green.

The 320/390px real-device measurement remains the same unmet boundary v2
already declared honestly: not measurable on this host's screen (2294 CSS px
wide, fills the controlled window; `resize_window` does not constrain the
page viewport below it). Nothing in v3 changes the mobile-first construction
that boundary rested on (single-column flex/grid below `sm:`, `overflow-hidden`
card, clipped rail) — the entrance animations use the same `motion.div`/`
motion.span` primitives already exercised at every breakpoint the CSS
targets. A QA pass on a real phone remains the right next gate for that one
specific claim.

## Files

- `flowModel.ts` — pure, framework‑free model: derives the 3‑agent/2‑repo facts
  from the **real** dispatch law, defines the ten ambient phases (three of them
  one per agent's own dispatch beat), and folds a phase index into a
  cumulative `FlowState` — including `entityCount`, the actor/artifact tally
  that proves the scene is a progression. No React.
- `FlowFloor.tsx` — presentational: coordinator → repo groups → agent rows
  (each mounted only from its own beat) → QA row (mounted only after
  delivery) → PR chips (mounted only at the `pr` beat), the travelling
  dispatch/PR rail, progress and state. No handlers.
- `FlowTerminal.tsx` — presentational: the auto‑scrolling, non‑interactive log.
- `FlowScene.tsx` — the ambient orchestrator: owns the looping clock, gates on
  in‑view + reduced‑motion, stacks the floor above the terminal. No controls.
- `FlowSection.tsx` — the landing section wrapper (heading, lead, the scene).
- `*.test.ts(x)` — the law/parallelism, the fold completeness (including the
  entrance-progression proof), the EN/PT caption parity, and the
  zero‑interactivity proofs — `flow.render.test.tsx` additionally diffs the
  rendered markup across beats to prove agents/QA/PRs are actually absent
  before their turn, not just relabelled.
