---
slug: handoff
title: Handoff
description: A portable CLAUDE.md export for a collaborator who won't install AIPe.
group: reference
order: 2
---

# Handoff

Not everyone on a team runs AIPe. `aipe handoff` generates a **portable
`CLAUDE.md`** so a non-AIPe collaborator can pick up the context in their own
agent harness — **standalone, needing no workspace**.

```sh
aipe handoff
```

## What it is for

A handoff is a one-shot export. It captures what a collaborator needs to work
effectively without adopting the whole framework: the shape of the context, the
relevant conventions, and enough grounding for their harness to be useful. Because
it is **standalone**, the recipient does not clone the workspace, install AIPe,
or run onboarding — they drop the generated `CLAUDE.md` into their repo and go.
(The file is named `CLAUDE.md` because that is the artifact `aipe handoff`
writes — the Claude-collaborator bridge; the export itself is harness-agnostic
context.)

## Where it sits

`handoff` is deliberately in the **portable core** of the CLI, alongside the
onboarding commands, but it does **not** require a workspace to run. It is the
bridge between an AIPe-run context and a collaborator who is outside it.

Related: [the CLI reference](cli-reference.md) ·
[the two phases](../phases/the-two-phases.md).
