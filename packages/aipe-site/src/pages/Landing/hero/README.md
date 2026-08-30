# The hero scene — mobile framing, placement, and console sync

`HeroCanvas` transcribes AIPe's real flow (the PE's hand-drawn pipeline): demands
→ PE → coordinator → multi-harness fan-out to specialists → QA (with a rejection
loop) → repos, with two lanes converging on one repo. That choreography, the
`prefers-reduced-motion` complete-static-frame, the no-sound / no-narration rule,
and the Canvas-2D / no-new-dependency constraint are all preserved untouched —
this round changes only *how the scene is framed on a phone* and answers whether
it should sync with the Console.

## 1. Legible on mobile — two framings, not one shrunk

The pipeline is horizontal and dense (six stages left→right). As a full-bleed
backdrop *behind* the copy it works on a wide screen under the scrim, but on a
phone it collapses into a row of dots hidden behind the paragraph, with its
labels dropped and the legend that names it pushed **below the fold** (measured
top `726px` on a `390×664` iPhone 13, before this change).

So the framing is chosen per breakpoint (`Hero.tsx`, `useMediaQuery` at the same
`640px` as Tailwind's `sm`, so exactly one canvas mounts — one RAF loop):

- **Wide (`≥ 640px`)** — the scene stays a full-bleed backdrop behind the copy,
  under the contrast scrim, with the legend at the foot. Unchanged.
- **Narrow** — the scene is **not** a backdrop. It gets its own bordered **card**
  it can fill, with the four-beat legend as its caption, and the copy sits on a
  clean background. `HeroCanvas` already repositions its nodes below `640px`, so
  the same component simply renders into the card at the size that fits.

To keep both the scene *and* the install command above the fold, the phone column
is ordered `headline → scene → install → CTAs → body`; the prose explanation
follows one short scroll down. Both themes; no horizontal overflow at `320/360/
375/390` px; the reduced-motion frame draws the complete static composition
(pipeline wiring, every node, tokens frozen mid-flight including the red rejection
and the convergence) on mobile too.

Verified with headless Chromium at real mobile device profiles (mobile viewport,
DPR 3, touch, mobile UA) capturing actual screenshots — not a resized desktop
inspector, which reproduces neither DPR nor touch.

> Note: an earlier iteration of this work extracted the *old* two-stage fan's
> geometry into a pure, tested `heroLayout.ts`. PR #21 then replaced the scene
> with the richer real-flow pipeline (its own responsive geometry), so that
> module became dead code and was dropped on rebase; the mobile-framing decision
> above is what survives, re-applied on the current scene.

## 2. Sync with the Console — investigated, **not viable**, by design

The Console (`../console/ConsoleScene`) is a *concrete, scripted* beat stream with
its **own** shared step index, a scrub bar, play/pause/speed, and restart. The
hero pipeline is an *ambient* loop. Locking the hero to the Console's current step
was considered and rejected, because it would violate the one criterion that
governs this whole site — **fidelity**:

- **They are never co-visible.** The hero is an `aria-hidden` decorative backdrop
  at the very top of the page; the Console is a separate section far below
  (`#console`), with its own controls. A viewer never sees both at once.
- An ambient loop asserting "I am on the Console's step X" **while the Console is
  off-screen** is the screen claiming a state it cannot establish for whoever is
  looking. That is exactly the class of defect this workspace has spent days
  cataloguing; introducing it deliberately into an animation would be perverse.
- The Console can be scrubbed, paused, restarted and skipped by the user. A
  backdrop loop cannot honestly track a timeline it does not own and the viewer
  cannot see, so "the step shown corresponds to the Console's step" could never be
  made *true*, only *asserted*.

A reasoned refusal is the deliverable here, not a half-built sync. What the two
**do** share is the source of truth: both depict the same law — a coordinator,
specialists dispatched across harnesses, QA gating with a rejection loop, PRs
merged to repos. The hero shows that shape ambiently; the Console proves it, step
by step, with real domain facts. They agree on the story without the hero
pretending to be a clock it isn't.
