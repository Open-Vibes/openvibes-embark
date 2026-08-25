---
slug: the-two-phases
title: The Two Phases
description: Onboarding maps a context; Operation ships demands as PRs.
group: phases
order: 1
---

# The Two Phases

AIPe has two phases, **both complete and shipped**. Onboarding maps a context (a
team's group of repos); Operation turns your demands into pull requests.

The guiding invariant throughout: **everything past raw agent output on disk is a
deterministic, tested `aipe` CLI**. The coordinator's judgement lives in skill
prose; the mechanics live in commands you can run and verify.

## The company analogy

AIPe models the work as a small company.

| Role | Who it is | What it does |
|---|---|---|
| **PE** | You. Sets the mission, priority, approves budget, decides cross-repo matters. | In command, approving between phases. |
| **Coordinator** | The main agent, with a name you choose. | Reads state, decomposes demands, dispatches, reviews, escalates. |
| **Specialists** | 1 dev-fullstack + 1 QA hired per repo. | Subagents dispatched by the coordinator, materialized as persona skills installed inside each repo. |

## (A) Onboarding — map a context

Onboarding is four ordered steps, each a skill, each unlocked only when the prior
step's state is done. Re-running a step fills only what is missing.

```
1. /context-brain      → declare repos (URLs, paths) → .aipe/brain.yaml
2. /make-workspace     → clone the repos on disk (+ rehydrate personas/toolbox)
3. /relationship       → discover cross-repo relations + backfill stack → .aipe/relations/
4. /hire-specialists   → hire persona skills (1 dev + 1 QA per repo) → .aipe/personas.yaml
```

The `SessionStart` hook drives this conversationally — you "just open the
workspace and say hi." After each step it tells you to open a **new session** to
continue. Full detail: [Onboarding](onboarding.md).

## (B) Operation — ship demands as PRs

Operation is the **`/operate`** skill. The coordinator receives a demand and:

1. Opens a **journey** (`aipe journey start`) — one demand equals one journey.
2. **Decomposes** the demand into per-repo (per-package) tasks.
3. Sequences tasks into **waves**, dependency-first, from `.aipe/relations/graph.yaml`.
4. Per wave: validates the batch against the parallel-dispatch law
   (`aipe dispatch validate`), creates an isolated **worktree** per specialist,
   and dispatches each as a subagent wearing its persona with an **ephemeral
   hiring brief** (never persisted).
5. Collects results: a **PR** delivered, or a cross-repo need **escalated** to the PE.
6. On merge, tears the worktrees down.

Full detail: [Operation & the ledger](../operation/operation-and-ledger.md).

## What holds it together

- The **[laws](../laws/laws-and-conventions.md)** — the rules the framework
  enforces, most as tested CLI, a few as skill prose.
- The **journey ledger** — the durable, auditable record of every dispatch.
- **[Execution envelopes](../capabilities/execution-envelopes.md)** — how each
  dispatch is priced and gated before it runs.

## Growing an onboarded context

You add one repo without redoing onboarding: `aipe add-repo` appends it,
`/make-workspace` clones just it, `aipe relationship --merge` folds its relations
into the existing graph, and `aipe hire-specialists --merge` hires its personas —
preserving every existing persona and its name.
