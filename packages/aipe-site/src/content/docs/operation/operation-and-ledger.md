---
slug: operation-and-ledger
title: Operation & the Ledger
description: The /operate loop, the journey ledger, evidence, and verification.
group: operation
order: 1
---

# Operation & the Ledger

Operation is the **`/operate`** skill. You bring a demand; the coordinator turns
it into pull requests through a disciplined loop, and records every step in a
durable, auditable **journey ledger**.

## The `/operate` loop

```
journey → decompose → waves → dispatch → PR → escalate
```

1. **`aipe journey start`** — one demand equals one journey.
2. **Decompose** the demand into per-repo (per-package) tasks.
3. **Sequence** tasks into **waves**, dependency-first, using
   `.aipe/relations/graph.yaml`.
4. **Per wave:**
   - **`aipe dispatch validate`** adjudicates the whole batch against the
     [parallel-dispatch law](../laws/laws-and-conventions.md) — the law, never a
     hand judgement. A batch is lawful **as proposed** or **REJECTed**, never
     silently reordered.
   - **`aipe worktree create`** makes an isolated worktree per specialist.
   - Each specialist is dispatched as a **subagent** wearing its persona, confined
     to its worktree, with an **ephemeral hiring brief** — the brief is **never
     persisted**; the durable record is the ledger plus the PRs.
5. **Collect:** each specialist returns a **PR** (delivered), or raises a
   cross-repo need (escalated).
6. **Escalate** cross-repo matters to the **PE** — cross-repo scope is the PE's
   call.
7. On merge, **tear the worktrees down** (`aipe worktree remove` / `prune`).

## The journey ledger

Each journey is a per-demand ledger at `.aipe/journeys/<id>.yaml` — the audit
trail of every dispatch. A dispatch moves through the canonical **8
`DispatchStatus` values**:

| Status | Meaning |
|---|---|
| `dispatched` | The specialist was sent to work in its worktree. |
| `delivered` | The dev reported a PR (must carry evidence). |
| `verified` | Passed independent QA, with the QA's own evidence. |
| `failed` | QA rejected the delivery → fix loop back to the dev. |
| `escalated` | A cross-repo need was raised to the coordinator/PE. |
| `merged` | The PR landed. **Immutable** — never re-dispatched. |
| `removed` | The worktree was torn down. |
| `redirected` | The PE redirected the unit live (needs a reason). |

The **happy path** is `dispatched → delivered → verified → merged`.

Notes on the edges:

- `running` is the **session-mode transient**, not a ledger status.
- **REJECT** is a CLI output **line** from `aipe dispatch validate`, not a status.
- `failed` means **QA rejected** — not "rejected."
- `redirected` requires a reason and happens when the PE redirects a unit live
  via `agentop attach`.

## The evidence gate

Statuses `delivered` and `verified` **must carry evidence**: at least one command
plus a non-empty summary of what its output showed. The ledger **REJECTs** these
without evidence (gate: `evidence-required`). A bare self-report ("I checked, it
works") is rejected. "Should work" is not evidence.

## The QA gate

Every dev delivery is re-checked by an **independent QA persona**
(`/review-delivery`) in its **own** worktree, against the **diff and the
acceptance criteria** — not against the dev's report.

- `verified` = passed QA, carrying the QA's **own** evidence.
- `failed` = QA rejected → fix loop back to the dev.
- Any **Critical** or **Important** finding **blocks**; **Minor** does not.

This is why cross-model QA is useful: a `claude-code` workspace can dispatch a QA
unit to `gemini` for an independent second read. See
[session mode & dispatch](../capabilities/session-mode-dispatch.md).

## Cross-repo escalation

A specialist **never edits another repo**. When it needs something from a
producer repo, it escalates to the coordinator, who takes it to the PE.
`aipe dispatch validate` **REJECTs** `dependency-not-landed <consumer> needs
<producer>` until the producer unit is `verified`/`merged` — so a consumer can
never race ahead of the dependency it needs.

## `aipe journey verify`

`aipe journey verify` is a **deterministic reliability lint** of the ledger. It
does not run agents — it reads the recorded journey and flags inconsistencies
(missing evidence, impossible transitions, dangling worktrees), giving you a
trustworthy read of the journey's health. Related: `aipe journey show`,
`aipe journey spec`, `aipe journey reconcile`, `aipe journey record`.

Related reading: [the laws](../laws/laws-and-conventions.md) ·
[execution envelopes](../capabilities/execution-envelopes.md) ·
[the CLI reference](../reference/cli-reference.md).
