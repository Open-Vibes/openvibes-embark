---
slug: laws-and-conventions
title: Laws & Conventions
description: The rules the framework enforces — most as tested CLI, a few as prose.
group: laws
order: 1
---

# Laws & Conventions

These are the rules AIPe enforces. Most are tested CLI (the coordinator cannot
route around them); a few live as skill prose. The point is that the interesting
judgement is human, but the guardrails are mechanical.

## Parallel-dispatch law

The one law the coordinator cannot break by hand:

- The **same package** (unit of work) **serializes** — never two dispatches on
  one package/unit at once.
- **Distinct repos/packages** run in **parallel**.
- Concurrency is capped at **16** (`MAX_CONCURRENT`). **Session mode** has a
  lower cap of **4** (`SESSION_MAX_CONCURRENT`).

It is adjudicated by **`aipe dispatch validate`**, never by hand. A batch is
lawful **as proposed** or **REJECTed** — never silently reordered. Reject
reasons:

| Reject reason | Meaning |
|---|---|
| `cap-exceeded` | More than 16 concurrent dispatches. |
| `session-cap-exceeded` | More than 4 concurrent session-mode dispatches. |
| `same-package` / `same-repo` | Two dispatches contend for one unit. |
| `harness-not-containable` | Session-mode harness cannot be contained (see below). |
| `unknown-repo` | The target repo is not in the brain. |
| `dependency-not-landed` | A consumer needs a producer that is not yet verified/merged. |

## Worktree isolation

Each dispatch works in `<repo>/.worktrees/<journey>-<slug>/` on branch
`aipe/<journey>/<slug>`. The `.worktrees/` directory is excluded via
`.git/info/exclude` — **never a tracked `.gitignore`**. `remove` and `prune`
**refuse** to delete uncommitted or unpushed work unless `--force` is given.

## PR attribution

Commits carry the persona as a **namespaced git author name** (`aipe/<Persona>`,
set per-worktree via git's worktree config). `user.email` is **inherited**, so
the PE's real account remains the true author of record. **Each specialist opens
its own PR.**

## Evidence gate (verify-before-done)

Statuses `delivered` and `verified` **must carry evidence**: at least one command
plus a non-empty summary of what the output showed. The ledger **REJECTs** these
without evidence (gate: `evidence-required`). A bare self-report is rejected. See
[Operation & the ledger](../operation/operation-and-ledger.md).

## QA gate

Every dev delivery is re-checked by an **independent QA persona**
(`/review-delivery`) in its own worktree, against the **diff and acceptance
criteria** — not the dev's report. `verified` = passed QA with the QA's **own**
evidence; `failed` = QA rejected → fix loop back to the dev. Any
**Critical/Important** finding **blocks**; **Minor** does not.

## Cross-repo escalation

A specialist **never edits another repo**; it escalates the need to the
coordinator, who takes it to the **PE** (cross-repo scope is the PE's decision).
`aipe dispatch validate` **REJECTs** `dependency-not-landed <consumer> needs
<producer>` until the producer unit is verified/merged.

## Session containment

A specialist dispatched via `aipe session dispatch` can **never open or kill an
`agentop` session**. Every containable harness's adapter writes a
`PreToolUse`-shaped hook into **that unit's own worktree** (never the PE's
workspace) that denies it. **`aipe session grant`** is the only authorised escape,
scoped to one `(journey, session)` pair.

> **Roadmap / not yet shipped.** `aipe session grant` records the spawn quota, but
> **redemption cannot yet take effect**: `agentop` does not stamp
> `AGENTOP_SESSION_ID` into the specialist's environment, so the consuming side
> has nothing to check against. The command says so. Treat grant redemption as
> pending, not shipped.

## Conventions

- **Publish the brain, never the repos or secrets.** The workspace's allowlist
  `.gitignore` publishes `.aipe/` and the harness's own paths; cloned repos and
  secrets are never published.
- **Secrets never enter the published catalog.** `aipe mcp add` refuses literal
  secrets in an MCP config — **env references only**; `--allow-secrets` overrides.
- **Non-destructive growth.** `--merge` modes for relations and personas fold a
  new repo in without disturbing existing edges or personas.
- **English-only repository.** Code, specs, plans, skills, docs, and commit
  messages are English; interaction with the PE may happen in any language.
