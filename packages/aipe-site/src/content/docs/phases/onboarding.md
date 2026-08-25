---
slug: onboarding
title: Onboarding
description: The four ordered steps that map a context onto disk.
group: phases
order: 2
---

# Onboarding

Onboarding maps a **context** — a team's group of repos — into a workspace AIPe
can operate. It is four ordered steps, each a skill in the plugin. Each step is
**unlocked only when the prior step's state is done**, and re-running any step
**fills only what is missing** (it never clobbers existing work).

The whole thing is driven conversationally by the `SessionStart` hook. You do not
memorize slash commands — you open the workspace and say **hi**, and the
coordinator walks you through it. After each step it tells you to open a **new
session** to continue.

## The four steps

```
1. /context-brain      → declare repos (URLs, paths) → .aipe/brain.yaml
2. /make-workspace     → clone the repos on disk (+ rehydrate personas/toolbox)
3. /relationship       → discover cross-repo relations + backfill stack → .aipe/relations/
4. /hire-specialists   → hire persona skills (1 dev + 1 QA per repo) → .aipe/personas.yaml
```

### 1. `/context-brain` — declare the repos

You tell the coordinator which repos make up this context: their URLs and their
paths. This becomes the **factual map** of the context, written to
`.aipe/brain.yaml`. Nothing is cloned yet — this step is purely declarative.

### 2. `/make-workspace` — clone the repos

The coordinator clones each declared repo onto disk inside the workspace. It also
**rehydrates** any personas and toolbox skills already recorded (so a published
workspace comes back to life intact). The cloned repos live under the workspace
but are **not published** — the workspace's allowlist `.gitignore` publishes
`.aipe/` and the harness's own paths, never the repos or secrets.

### 3. `/relationship` — discover cross-repo relations

The coordinator inspects the cloned repos to discover how they depend on each
other (who consumes whom), and **backfills the stack** for each repo. The result
is written under `.aipe/relations/` — including `graph.yaml`, the dependency
graph that later drives **dependency-first wave ordering** during operation.

### 4. `/hire-specialists` — hire the personas

For each repo, the coordinator hires **two persona skills**: one
**dev-fullstack** and one **QA**. These are plain Markdown skills installed
**inside each repo** (`.claude/skills/<persona>/SKILL.md`), with their sources
published under `.aipe/personas/` so they can be rehydrated. The roster is
recorded in `.aipe/personas.yaml`. During operation, a specialist is a subagent
**wearing** its repo's persona.

## What onboarding produces

By the end you have a workspace whose `.aipe/` holds:

| File / dir | Purpose |
|---|---|
| `.aipe/brain.yaml` | The repos (URLs, paths, stacks). |
| `.aipe/state.yaml` | Onboarding phase state (what is done). |
| `.aipe/relations/graph.yaml` | Cross-repo edges; drives wave ordering. |
| `.aipe/personas.yaml` | The roster (coordinator + specialists). |
| `.aipe/personas/<repo>/<slug>/SKILL.md` | Published persona sources (for rehydrate). |

## Growing a context later

You do not redo onboarding to add a repo. `aipe add-repo` appends it,
`/make-workspace` clones just it, `aipe relationship --merge` folds its relations
into the existing graph, and `aipe hire-specialists --merge` hires its personas —
**preserving every existing persona and its name**. This non-destructive `--merge`
growth is one of the [conventions](../laws/laws-and-conventions.md).

Next: [Operation & the ledger](../operation/operation-and-ledger.md).
