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

## v4 (j-20260830-58) — the whole method, not the happy path

The PE's own words, reviewing the v3 flow that shipped as PR #27:

> "no site do aipe quando o fluxo terminar nao deve resetar toda a animacao
> e, ta demonstrando 2 repos mas so apareceu 1 qa. eu quero um fluxo de ponta
> a ponta, p.e coordenador dev(s) qa(s) report de reprove do qa, aprove, pr
> em dev qa pr na main. […] e quero que sejam harnesses e modelos diferentes
> no fluxo"

Five things, addressed in the order they were sequenced (2 first — the visible
contradiction between the header and the scene; then 3 and 5 together, since
the new reject/promote actors need an envelope anyway; 1 last, since the
"no reset" fix depends on how the now-longer cycle ends):

### 1. QA is derived PER REPO, never a fixed headcount

v3 hard-set one QA persona (`Viola`) for the whole batch, even while the
header's own `dispatch law` verdict said `2 repos`. `deriveQaTeam(repos)` now
returns one QA per DISTINCT repo — a pure function of the repo list, not a
literal count. `buildFlowFacts` derives `repos` from the same seed that feeds
`scheduleWaves`/`validateBatch`, so a third repo in the input yields a third
QA with no code change at the call site. `flowModel.test.ts` proves this
generically (1, 2, 3, 5 synthetic repos in → that many QAs out), not just for
the shipped 2-repo case.

### 2. The whole method: PR into `dev`, a QA gate, a REJECTION, a fix, a promotion

The scene now plays the real ten-step lifecycle end to end, not just to "PR
opened": dispatch → parallel work → each agent opens its **own PR into
`dev`** (`pr-dev`) → its repo's QA reviews (`qa-review`) → **one PR is
REJECTED** (`qa-reject`) → **the SAME dev fixes it, on the SAME branch**
(`dev-fix` — the QA that rejected never touches the fix) → the QA re-reviews
and approves (`qa-approve`) → approved PRs merge into `dev` (`merge-dev`) →
a **separate, later** promotion PR carries `dev` to `main` (`promote`) → it
merges and the ledger closes (`merge-main`). Marco's PR is the one rejected
(`FLOW_REJECTED_AGENT_ID`) — a fixed dramatization choice, not something that
needs to be derived, since the aceite only asks for one real instance of the
reject→fix loop with the right actors. Repos with nothing to reject (Jane's
`agentistics`) approve on their own beat instead of waiting on the other
repo's fix — QA is per repo, so its pacing is too.

The **two PRs are two distinct artifacts**, not one box that changes label: a
`▽ PR → dev #41` chip on the agent's own row, and later a separate `⇢ promote
→ main #141` chip at the repo-group level, which becomes visible only once
every dev PR in that repo has already merged into `dev` — `flowModel.test.ts`
asserts the promotion is invisible before `merge-dev` and the dev-PR chips are
still present (not replaced) once the promotion appears.

### 3. Harness + model, distinct per actor, from the real containment registry

`envelopePool()` is the cross-product of `HARNESS_IDS.filter(isSessionEligible)`
(from `domain/harness.ts` — the same truth the Harness Bay renders) and the
tiers actually offered ambiently (`fast`/`standard`/`reasoning` —
`frontier` is excluded because `DEFAULT_POLICY.gatedTiers` gates it behind
the PE's signature, so an ambient scene assigning it unattended would be a
lie). `envelopeForActor(index)` cycles that pool, so every dev and every QA
carries its own `harness · tier` line, and the pool is provably NOT a literal
per-agent list: passing a wider harness list into `envelopePool` changes the
combinations produced (`flowModel.test.ts`), and the shipped scene already
shows ≥3 distinct combinations among five actors (two harnesses × three
tiers, cycling from index 0).

### 4. No reset seco — the loop keeps going, but doesn't erase what it built

v3 remounted the whole card every loop (`key={cycle}` on the wrapper), which
tore down and rebuilt every row and replayed every entrance from an empty
frame — exactly the "recomeça do vazio" the PE flagged as reading like a bug.
Two changes fix it without turning the loop into a freeze-on-last-frame (the
PE explicitly ruled that out too):

- `FlowFloor`/`FlowTerminal` now stay mounted across cycles. Rows that leave
  the scene when the phase resets to `demand` animate OUT via
  `AnimatePresence` (a fade+scale-down) instead of being torn down instantly
  by a parent remount.
- `FlowState.previousCycle` (a `FlowCarry` of `{ merged, repos }`, produced by
  `summarizeCycle` on the just-settled frame) rides forward into the NEXT
  cycle's fold and renders as a small pinned line in the header ("last cycle:
  3 merged across 2 repos"). The stage itself still opens empty — the
  fan-out genuinely restarts, that's the point of the scene — but the first
  frame of cycle 2 is provably not the same picture as cycle 1's true first
  frame: `flowModel.test.ts` folds both with and without a carry and asserts
  `previousCycle` differs (`null` vs. the real numbers) even though `groups`
  is empty in both. Verified live in a real Chrome tab (see below): the
  chip is visible and correct through cycle 2 and cycle 3 without the card
  ever going blank.

### How v4 was verified

`tsc --noEmit` clean; the full flow suite is 76/76 (up from 45 in v3), the
whole package suite 224/224; `bun run build` clean. Verified live in a real
Chrome tab (over Tailscale, the same method prior versions used): the tab
was backgrounded by Chrome under this host's usual multi-session load
(`document.hidden === true`, the same documented limitation v2/v3 hit) — the
perf-pause held the clock correctly, exactly as designed, and forcing
`document.hidden`/`visibilitychange` to simulate a visible tab let the clock
run. Sampled live across two full cycles: three distinct harness·tier
combinations on screen at once (`claude-code · fast`, `gemini · fast`,
`claude-code · standard` on the devs, plus `gemini · standard` and
`claude-code · reasoning` on the two QAs), Marco genuinely shown
`consertando` (fixing) while Viola (the repo's QA, a different actor) showed
`reprovado` (rejected), Cliff's independent `agentistics` QA already
`aprovado` in the same frame, a separate `promove → main` chip distinct from
the `PR → dev` chips, and the `ciclo anterior` / `last cycle` header line
present and correct going into cycle 2 and cycle 3, in both PT and EN, with
no console errors and no horizontal overflow
(`document.documentElement.scrollWidth === clientWidth`). The 320/390px
real-device measurement remains the same unmet boundary v2/v3 already
declared honestly (this host's screen can't be constrained below its own
width); nothing in v4 changes the mobile-first construction that boundary
rested on.

## v6 (j-20260831-p1) — in-progress colour, unit independence, the two-arrow promotion

The PE's own words, on the v5 flow that shipped as PR #29:

> "quando a tarefa esta em andamento (independente do step) deveria ficar num
> amarelo/laranja pra indicar em andamento. 2° as tarefas que haviam sido
> aprovadas poderiam ja ter sido enviadas pro repo de destino, nao precisavam
> ficar esperando o QA que reprovou e o especialista que ta arrumando. e a
> promocao do grupo 1 so o de cima ta apontando pra um repo o de baixo n aponta
> pra nenhum lugar, o repo deveria ficar no meio ali na frente e duas setas
> ligam eles ao repo, dai tem que ter o nome do repo + branch que cada um ta
> mandando"

Three fidelity/form fixes, sequenced 2 → 3 → 1 (independence first, because it
changes who is on screen when; then the promotion, whose geometry depends on it;
then the colour, which applies to whatever the other two leave).

### 2. Independence IS the product — an approved unit does not wait on a bounced sibling

v5 held every merge to a single global `merge-dev` beat, so the approved units sat
as `verified` waiting until the rejected one was fixed and re-approved — the scene
was teaching a synchronous batch, the exact opposite of what AIPe is. It happened
literally in this workspace the day of the demand: `aipe-site` PR #29 merged while
`agentistics` PR #260 was still rejected and being fixed.

`agentLandedAt` (in `flowModel.ts`) now derives each unit's landing PER UNIT: a
clean delivery lands (its dev PR merges into its destination repo) the instant its
OWN gate clears — at `qa-reject`, the very beat its sibling is bounced — while the
rejected unit lands only once its own re-review passes at `qa-approve`. So at
`dev-fix` the scene shows Lawson **`merged into dev`** and Jane **`merged into
dev`** at the same instant Marco is `rejected`/`fixing` and has NOT landed
(`flowModel.test.ts` asserts both facts hold together, at `qa-reject` AND
`dev-fix`). Feed a seed with no rejected id and nothing is ever `rejected`/`fixing`
and every unit lands together at `qa-reject` — the scene invents no wait (also
asserted). The dev→main promotion stays a separate, later per-repo beat (the two
distinct PRs are unchanged).

### 3. The promotion of a group: one repo, in front, with an arrow from EACH card

v5 drew a single promote connector centred between a lane's rows into one `main`
node, so a two-card group read as "only the top card points anywhere". Now each
card has its OWN `LandingArrow` (one grid column per row) converging on a single
`RepoNode` that spans the lane's rows — the destination repo sitting in front of
both cards, with two arrows arriving and no card left without a destination. Each
card sends its OWN head branch, `aipe/<journey>/<package>--<id>`, DERIVED from the
same structure as the worktree (`FlowAgentFact.branch`), so the two units in
`openvibes-embark` carry two DISTINCT branches converging on one repo — the repo
node lists them, `repo · branch`, one line per incoming arrow. `flowModel.test.ts`
proves the two same-repo branches differ and are never literal `dev`/`main`;
`flow.render.test.tsx` proves the repo node appears once per repo and there is one
landing arrow per card.

### 1. In progress is amber — from the running token, NOT the escalation amber

The brief pointed at `--st-escalated` for the amber but flagged the trap: that
token is the **gate/escalation** amber elsewhere in the system, so reusing it for
"in progress" would collide two different meanings on one hue. The palette already
has a better fit: **`--st-running`** — the canonical "the session is alive /
running" token, itself amber (light `168 106 8`, dark `245 172 60`), semantically
*exactly* "it is happening now". Using it keeps the two ambers apart (progress ≠
escalation) and invents no colour. A unit is amber whenever work is actively
advancing on it — a dev `running` or `fixing`, a gate `reviewing` — across
whichever step that falls on. It is never carried by hue alone: a labelled,
pulsing **`in progress`** pill (`InProgressPill`) rides with the amber everywhere,
and `fixing` is now amber (in progress) where it used to be red — `rejected` stays
red (a STOP), so the reject→fix loop reads as "failed, then working again" instead
of "red twice". `flow.render.test.tsx` proves the mark is amber from
`state-running` (no hex in the floor markup), is absent on a stopped unit, and
never uses `state-escalated`.

### How v6 was verified

`bun run typecheck` clean; `bun run build` clean; the full package suite is
**241/241** (flow suite 85, up from 55). Measured in a **real headless Chromium
(Playwright, deviceScaleFactor 2)** at the actual sub-640 viewports the earlier
rounds could not reach on this host — **320 / 390 / 768 / 1440 / 1920, both
themes**: horizontal overflow is `0` at every width and theme, and there is **zero
`[data-flow-badge]` bounding-box overlap** — at the reduced-motion **peak** (the
settled frame, 16 badges — the new branch labels + repo nodes + promotion chips
included, the larger population the brief warned about) AND across a full live
cycle (24 samples per width, `0/24` overlapping at every width). Screenshots at
1440 and 1920 (both themes) and a `dev-fix` frame show all three items at once:
Marco amber and `fixing` while Lawson and Jane are already `merged into dev`, and
the repo node in front of both cards with two branch-labelled arrows. Reduced
motion opens on the complete settled frame; the zero-interactivity scans still bite
(no handler, no `<button>`/`<a>`, no `cursor-pointer` anywhere in the scene).

## v4 form (j-20260831-p1) — the PE's decision flowchart

The PE drew the shape he wanted (a static mock) and said the animation was still
far from it. The scene's FORM changed — from repo-grouped stacked cards to a
left-to-right **decision flowchart with one lane per task**, the skeleton the
unification will live inside. Four structural changes (not styling):

1. **The decision is explicit.** Rejection is no longer only a card state: every
   lane carries a labelled question on a return arc — `reproved? no` on the lanes
   that pass, `reproved? yes` on the one that bounces (`DecisionArc`,
   `data-flow-decision` / `data-reproved`). This is what makes it read as a flow.
2. **The repo is a CONTAINER, not a destination.** `RepoContainer` is one box
   holding `PR DEV` (where the tasks' distinct branches land) and `PR MAIN` (the
   promotion) as two stacked sections; same-repo lanes converge into it — the old
   two-arrow answer to "repo once, branches inside", in the form he asked for.
3. **The PE is the origin.** The scene begins at `PENode` (Tasks 1–N) → the
   coordinator (classifies & dispatches) → the lanes, instead of starting at the
   coordinator.
4. **The rejected lane has its own state:** amber task, red QA, and an amber
   "adjust after the request" hop between them.

Everything already earned is preserved and still verified: the hold of the final
frame (D), amber in-progress, unit independence, the QA-per-delivery gate, the
serialize half of the law, zero interactivity, and **0 horizontal overflow / 0
badge-overlap at 320/390/768/1440/1920 in both themes** (real headless Chromium,
DPR 2), peak and across the cycle. Data stays DERIVED (lanes, owners, repos,
branches, QA count from the real law + registry); the form is the PE's, the facts
are still facts. Shipped to the PE as a preview URL to steer from — not built
blind.

## Files

- `flowModel.ts` — pure, framework‑free model: derives the 3‑agent/2‑repo facts
  and the per-repo QA team from the **real** dispatch law, assigns every actor
  a harness+tier envelope from the **real** containment registry, defines the
  fifteen ambient phases (dispatch, work, a PR into `dev`, a QA gate, one
  rejection and its fix, approval, a merge into `dev`, a separate promotion
  PR, and the final merge), and folds a phase index (plus the previous
  cycle's carry) into a cumulative `FlowState` — including `entityCount`, the
  actor/artifact tally that proves the scene is a progression. No React.
- `FlowFloor.tsx` — presentational: coordinator → repo groups → agent rows
  (each mounted only from its own beat, later showing its own dev-PR chip) →
  a per-repo QA row (mounted after delivery, its own verdict chip) → a
  per-repo promotion row (mounted only after that repo's dev PRs have
  merged), the travelling dispatch/PR rail, progress and state. Rows exit via
  `AnimatePresence` on loop reset. No handlers.
- `FlowTerminal.tsx` — presentational: the auto‑scrolling, non‑interactive log.
- `FlowScene.tsx` — the ambient orchestrator: owns the looping clock, gates on
  in‑view + reduced‑motion, carries the previous cycle's summary forward, and
  keeps the floor/terminal mounted across loops (no full remount). No controls.
- `FlowSection.tsx` — the landing section wrapper (heading, lead, the scene).
- `*.test.ts(x)` — the law/parallelism, the per-repo QA derivation, the
  harness/tier registry proof, the fold completeness (including the
  entrance-progression and no-reset-seco proofs), the EN/PT caption parity,
  and the zero‑interactivity proofs — `flow.render.test.tsx` additionally
  diffs the rendered markup across beats to prove agents/QA/PRs/promotions
  are actually absent before their turn, not just relabelled.
