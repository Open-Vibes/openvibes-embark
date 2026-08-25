/**
 * English copy — the source of truth for the site's bilingual surface.
 * `pt.ts` mirrors this object key-for-key (and with the same value TYPES:
 * strings, plus the few function-valued entries). `Translations = typeof en`,
 * so a missing or mistyped key in `pt.ts` is a compile error.
 *
 * Only user-facing prose lives here. Real CLI commands, flags, harness ids,
 * ledger status tokens, the cost formula, and terminal transcripts stay English
 * in both locales — they are code, not copy.
 */

const en = {
  nav: {
    home: "AIPe home",
    why: "Why",
    company: "Company",
    how: "How",
    laws: "Laws",
    harnesses: "Harnesses",
    cost: "Cost",
    docs: "Docs",
    github: "GitHub",
    getStarted: "Get started",
    toggleMenu: "Toggle menu",
  },

  langToggle: {
    label: "Language",
  },

  hero: {
    eyebrow: "AI Product Engineer · a Claude Code plugin",
    headlineLine1: "You bring the demand.",
    headlineLine2: "It runs the engineering org.",
    bodyBefore:
      "AIPe turns Claude into a general engineering coordinator and you into the Product Engineer. Hand over a demand; it decomposes the work, dispatches a specialist per repo ",
    bodyEmphasis: "in parallel",
    bodyAfter:
      " — each isolated in its own git worktree — and returns PRs, under one dispatch law and an evidence gate.",
    copy: "copy",
    copied: "copied",
    seeHow: "See how it works →",
    readDocs: "Read the docs",
    sceneCaption: "one demand — the terminal, and what every line means",
  },

  console: {
    title: "The Console",
    journeyPrefix: "· journey",
    terminalHeader: "terminal — what actually runs",
    meaningHeader: "what that line means — bound to the left",
    replay: "replay",
    aria: {
      group:
        "The Console — a paced, two-pane walkthrough: the terminal on the left, what each line means on the right",
      scrub: "Scrub through the steps",
      prev: "Previous step",
      next: "Next step",
      play: "Play",
      pause: "Pause",
      replay: "Replay",
      restart: "Restart",
      speed: (s: number) => `Speed ${s}×, tap to change`,
      step: (n: number, title: string) => `Step ${n}: ${title}`,
    },
    srStep: (n: number, total: number) => `Step ${n} of ${total}`,
    detail: {
      match: "match",
      skip: "skip",
      floor: "floor",
      costNote: "coarse relative index, never money",
      gated: "GATED",
      wave: "wave",
      then: "then",
      sameSerialize: "— same package serializes; distinct repos would run in parallel",
    },
    steps: {
      demand: {
        title: "The whole input is one sentence",
        plain:
          "A Product Engineer hands over a demand in plain words. That is the entire input. Everything on this side is the coordinator turning it into dispatched, recorded work — no one writes tickets or wires up agents by hand.",
      },
      journey: {
        title: "One demand → one journey",
        plain:
          "The demand opens a journey: a durable ledger that will record every step from here to a merged PR. Nothing has been dispatched yet — this is just the record being opened.",
      },
      decompose: {
        title: "One unit of work, and its reliability floor",
        plain:
          "The coordinator reads how the repos relate. aipe-site is a brand-new node — nothing else depends on it and it depends on nothing — so there is exactly one unit of work. The floor for any unit is two people: one dev to build it and one independent QA to check it.",
      },
      "skill-match": {
        title: "Which method fits — and which is overkill",
        plain:
          "Before building, the coordinator asks which framework fits the work. sdd-lite — a short spec plus a plan — is the always-on floor. The heavy spec-driven kits are declined here: a UI-dominant site isn't what they're for. The same rule keeps a heavy kit off a one-line change; it is routed mechanically, not by feel.",
      },
      envelope: {
        title: "How much muscle — and does it need sign-off",
        plain:
          "Every unit gets an execution envelope on four axes: run mode, model tier, effort, and which harness. Their product is a coarse relative cost-index (never money). This one lands at 64 and uses a gated axis (ultracode effort), so it can't dispatch until the PE signs it off.",
      },
      law: {
        title: "The one law the coordinator can't bend",
        plain:
          "Lawson and Viola are both on aipe-site. The dispatch law forbids the same package running twice at once, so proposing them together is rejected as written — and serialized instead: Lawson in wave 1, Viola's QA in wave 2 on his branch. Two DIFFERENT repos would have run side by side, up to 16 at once.",
      },
      worktree: {
        title: "An isolated copy to work in",
        plain:
          "Wave 1's specialist gets its own git worktree — a separate working copy of the repo. Parallel specialists never step on each other's files, and each one's changes arrive as their own pull request.",
      },
      dispatch: {
        title: "Wave 1 goes out; wave 2 waits",
        plain:
          "The dev is dispatched as a detached session with its own full context window. The QA stays queued behind him — same package, next wave — so the two never run at once. The ledger now reads: dispatched.",
      },
      deliver: {
        title: "Delivered — with proof",
        plain:
          "Lawson opens the PR and records it as delivered, attaching the exact command he ran and what it showed. A delivery MUST carry that evidence; the record is the command and its result, not a claim.",
      },
      "evidence-gate": {
        title: "A bare claim is rejected outright",
        plain:
          "Had he recorded 'delivered' with no command and no result, the ledger rejects the write — evidence-required. 'It should work' is not evidence. That is exactly why the delivery above carried a command and its output.",
      },
      "qa-gate": {
        title: "You can't merge on the dev's word",
        plain:
          "A merge straight from delivered is held: the unit isn't verified. Wave 2 runs — Viola, an independent QA in her own worktree, re-checks against the diff, not against Lawson's report — and records verified with her own evidence. Only now is the unit cleared.",
      },
      merged: {
        title: "Merged, and now immutable",
        plain:
          "With a verified QA in hand, the PR merges. The unit becomes immutable — it is never re-dispatched — and its worktree is torn down.",
      },
      verify: {
        title: "The record checks itself",
        plain:
          "A final deterministic lint reads the whole ledger back and confirms it's consistent: every delivery carried evidence, every merge was verified first, no dangling worktrees. One demand, dispatched and recorded, end to end.",
      },
    },
  },

  problem: {
    eyebrow: "The problem",
    title: "Coordinating agents across many repos is a job. Right now, it's yours.",
    lead: "A single coding agent is powerful in one repository. The moment a demand touches several, the coordination overhead lands entirely on you.",
    items: [
      {
        title: "You are the router",
        body: "One agent, one repo, one thread. Every demand that spans services turns you into the message bus — copying context between chats, re-explaining the same architecture, holding the plan in your head.",
      },
      {
        title: "Work that could be parallel runs serial",
        body: "Three repos need the same feature. Nothing stops them running at once — except that you can only babysit one session at a time, so they queue behind your attention.",
      },
      {
        title: "No isolation, no undo",
        body: "Agents edit your working tree in place. A half-finished change collides with the next one; a bad run leaves you cleaning up instead of merging.",
      },
      {
        title: "“Done” is a self-report",
        body: "The agent says it passed. Did it run anything? There's no gate between a confident summary and a merge — so review is on you, every time.",
      },
      {
        title: "Cross-repo order is guesswork",
        body: "The API has to land before the client that calls it. Get the order wrong and you ship a build against a contract that doesn't exist yet.",
      },
      {
        title: "The audit trail evaporates",
        body: "Which agent did what, with what evidence, in what order? It scrolls off the top of a terminal. Next week, none of it is recoverable.",
      },
    ],
  },

  company: {
    eyebrow: "The company analogy",
    title: "AIPe runs your repos like a company runs its teams.",
    lead: "It's the mental model the whole product is built on: you're the executive with the demand; the coordinator is your engineering lead; the specialists are contractors hired per repo.",
    note1: "Everything past raw agent output on disk is a deterministic, tested ",
    note2:
      " CLI; the coordinator's judgement lives in prose. The org chart is real, and you can watch it work.",
    roles: [
      {
        role: "Product Engineer",
        who: "You.",
        does: "Set the mission and the priority, approve the budget, and decide anything that crosses repo boundaries. In command, approving between phases.",
      },
      {
        role: "Coordinator",
        who: "The main Claude, with a name you give it.",
        does: "Reads the state of every repo, decomposes each demand, dispatches the specialists, reviews what comes back, and escalates cross-repo calls to you.",
      },
      {
        role: "Specialists",
        who: "One dev + one QA, hired per repo.",
        does: "Subagents that wear a persona installed inside their repo. Each works confined to its own worktree and opens its own PR — and never edits another repo.",
      },
    ],
  },

  how: {
    eyebrow: "How it works",
    title: "Two phases, both complete: onboard once, then operate.",
    lead: "Onboarding teaches the coordinator your world. Operation is the loop it runs on every demand after that.",
    onboarding: {
      heading: "Onboarding",
      meta: "4 steps · once",
      sub: "Each step is a skill; the next one only unlocks when the last is done. Re-running fills in only what's missing.",
      steps: [
        { title: "Declare the repos", body: "Name the repositories in your context — URLs and paths — into .aipe/brain.yaml." },
        { title: "Clone them on disk", body: "Check the repos out locally and rehydrate the personas and toolbox." },
        { title: "Discover the relations", body: "Map how the repos depend on each other and backfill each one's stack." },
        { title: "Hire the specialists", body: "Install one dev + one QA persona skill per repo into .aipe/personas.yaml." },
      ],
    },
    operation: {
      heading: "Operation",
      meta: "/operate · every demand",
      sub: "The coordinator runs this loop for every demand you bring, dependency-first across your repos.",
      steps: [
        { body: "One demand opens one journey — the durable record of everything dispatched." },
        { body: "The demand is split into per-repo tasks." },
        { body: "Tasks are sequenced dependency-first, using the cross-repo relation graph." },
        { body: "Each wave validates the law, provisions a worktree, and sends each specialist off in parallel." },
        { body: "Every specialist returns a delivery — a PR with evidence attached." },
        { body: "Anything cross-repo comes back to you; it's the PE's call before the next wave." },
      ],
    },
  },

  laws: {
    eyebrow: "The laws",
    title: "Six constraints the coordinator can't talk its way around.",
    lead: "These aren't guidelines. They're deterministic gates enforced by the aipe CLI — the reason parallel work stays safe and 'done' means something.",
    items: [
      {
        title: "The parallel-dispatch law",
        body: "The same package never runs twice at once — same-unit work serializes; distinct repos run in parallel, capped at 16 concurrent. Adjudicated mechanically, never by hand. A batch is lawful as proposed or rejected; it is never quietly reordered.",
      },
      {
        title: "Worktree isolation",
        body: "Every dispatch works in its own git worktree on its own branch. Nothing edits your working tree in place. Teardown refuses to delete uncommitted or unpushed work unless you force it.",
      },
      {
        title: "The evidence gate",
        body: "A delivery that claims done must carry the commands it ran and a summary of what the output showed. A bare self-report is REJECTed by the ledger — verify-before-done is not optional.",
      },
      {
        title: "The QA gate",
        body: "Every dev delivery is re-checked by an independent QA persona against the diff and the acceptance criteria — not the dev's report. A unit is only 'verified' once that skeptic passes it; any Critical or Important finding blocks the merge.",
      },
      {
        title: "Cross-repo escalation",
        body: "A specialist never edits another repo — it escalates the need to the coordinator, who takes it to you. A consumer can't dispatch until the producer it depends on has landed. Cross-repo scope is the PE's decision.",
      },
      {
        title: "Session containment",
        body: "A specialist dispatched as a real session can never open or kill an agentop session — a hook in its own worktree denies it. The one authorised escape, aipe session grant, is scoped to a single (journey, session) pair.",
      },
    ],
  },

  harnessSection: {
    eyebrow: "Multi-harness",
    title: "Four harnesses. Two can be contained. That's the honest line.",
    lead: "AIPe can dispatch a specialist to different agent CLIs — and cross-check one model's work with another. But session mode needs true containment, and only claude-code and gemini have it today. Pick a lane and see what changes.",
  },

  harnessBay: {
    selected: "selected",
    sessionEligible: "session-eligible",
    notContainable: "not containable",
    workspacePrefix: "workspace:",
    sessionRejected: "session dispatch rejected",
    containment: "Containment: ",
    whyNotContained: "Why it can't be contained: ",
    workspaceHarnessAt: "Workspace harness at",
    geminiNoteBefore: " — still session-eligible as a ",
    geminiNoteEmphasis: "unit",
    geminiNoteAfter: " dispatch harness, which is what enables cross-model QA.",
    pending: "pending",
    pendingSr: "Pending roadmap note: ",
    pendingBefore: "Session containment for ",
    pendingMiddle: " and ",
    pendingNotShipped: " is ",
    pendingNotShippedEmphasis: "not shipped",
    pendingAfter:
      " — it's blocked on a documented non-interactive trust bypass for each. Until then, unattended dispatch validation rejects them by design.",
  },

  cost: {
    eyebrow: "Cost control",
    title: "Price every way to run a unit — before you spend a token.",
    lead: "Four axes decide what a dispatch costs and whether it needs your signature. AIPe enumerates and prices every viable envelope; it never chooses for you.",
  },

  envelope: {
    harnessHint: "viability axis — not a multiplier",
    costIndex: "cost-index",
    coarseNote:
      "A coarse relative index, never currency. AIPe cannot know your token price, plan, or rate limits — it ranks ways to run a unit, it does not bill them.",
    viable: "VIABLE envelope",
    nonViable: "NON-VIABLE — excluded",
    rejectPrefix: "reject:",
    sessionRequiresContainable:
      "Session mode requires a containable harness; this one can't be contained unattended.",
    gated: "GATED — needs the PE's signature",
    ungated: "UNGATED",
    autoDispatchable: "— auto-dispatchable",
    perEnvelope: "per-envelope",
    gatedIntensities: "gated intensities",
    gatedTiers: "gated tiers",
    perWave: "per-wave (applied only when units are grouped into a wave)",
    referenceEnvelopes: "reference envelopes",
    thEnvelope: "envelope",
    thIndex: "index",
    thStatus: "status",
    nonViablePrefix: "non-viable ·",
    gatedLabel: "gated",
    ungatedLabel: "ungated",
    noteNotContainable: "not containable in session",
    noteSessionEligible: "session-eligible",
    noteSubagentOnly: "subagent-only",
  },

  getStarted: {
    eyebrow: "Get started",
    title: "Install, start, and say hi.",
    lead: "Three moves to a working coordinator. No marketplace step, nothing installed globally — the integration lives in the workspace folder you create.",
    copy: "copy",
    copied: "copied",
    steps: [
      { body: "Install the standalone aipe binary — no Bun, Node, or npm required." },
      { body: "Pick your harness and name the workspace. It creates a publishable aipe-<name>/ folder." },
      { body: "Open the folder in your harness and greet the coordinator. It drives onboarding from there." },
    ],
    readDocs: "Read the docs",
    viewGithub: "View on GitHub",
  },

  footer: {
    tagline: "The AI Product Engineer — a Claude Code plugin that coordinates specialists across your repos.",
    product: "Product",
    learn: "Learn",
    howItWorks: "How it works",
    theLaws: "The laws",
    costControl: "Cost control",
    docs: "Docs",
    getStarted: "Get started",
    github: "GitHub",
    umbrella: "openvibes.tech — the open-source umbrella",
    latestRelease: "latest release ↗",
  },

  docs: {
    documentation: "Documentation",
    closeMenu: "Close menu",
    close: "close",
    codeBlock: {
      copy: "copy",
      copied: "copied",
    },
    groups: {
      "get-started": "Get started",
      phases: "The two phases",
      operation: "Operation",
      laws: "Laws & conventions",
      capabilities: "Capabilities",
      reference: "Reference",
    },
  },
};

export default en;
