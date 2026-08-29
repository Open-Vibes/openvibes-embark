---
slug: session-mode-dispatch
title: Session-Mode Dispatch
description: Detached agentop sessions, harness containment, caps, and grants.
group: capabilities
order: 2
---

# Session-Mode Dispatch

A specialist is normally dispatched as an in-process **subagent**, sharing the
coordinator's context and lifetime. **Session mode** instead starts it as a real,
detached **`agentop` session** with its own full context window — for units heavy
or long enough that a shared context would starve them.

## Subagent vs. session

| | Subagent | Session |
|---|---|---|
| Where it runs | In the coordinator's process | A detached `agentop` session |
| Context window | Shared with the coordinator | Its own full window |
| Returns | Directly to the coordinator | Records into the ledger; polled later |
| `ultracode` | — | Available (opted in) |
| Requires | Nothing extra (the default) | `agentop` (≥ 1.9.0) |

## The session loop

```sh
aipe session dispatch --journey <id>   # start each unit as a detached agentop session
aipe session collect  --journey <id>   # poll and classify each unit
```

`aipe session dispatch` **records into the journey ledger instead of returning**.
`aipe session collect` polls and classifies each unit as `landed`, `running`, or
`dead-silent`. Note that `running` is a session-mode **transient**, not one of the
[eight ledger statuses](../operation/operation-and-ledger.md).

Session concurrency is capped at **4** (`SESSION_MAX_CONCURRENT`), lower than the
16-wide subagent cap. Exceeding it is REJECTed as `session-cap-exceeded` by
`aipe dispatch validate`.

## Harness containment

A dispatched specialist must not be able to spawn or kill further sessions. Only
harnesses that can be **contained** are session-eligible:

| Harness (bin) | Containable? | How |
|---|---|---|
| `claude-code` (`claude`) | Yes | Writes a `PreToolUse` hook into `.claude/settings.json` |
| `gemini` (`gemini`) | Yes | Writes a `BeforeTool` hook into `.gemini/settings.json` |
| `codex` | **No** | Needs a human to interactively trust each hook via `/hooks` |
| `copilot` | **No** | Gates on a default-on directory-trust prompt for a new folder |

The containment hook is written into **that unit's own worktree** — never the PE's
workspace. `codex` and `copilot` are **rejected** from session mode as
`harness-not-containable <id>`: neither interactive trust step can be cleared by
an unattended dispatch.

> **Roadmap / not yet shipped.** `codex`/`copilot` session containment (and
> non-Claude-Code harness **adapters** for session mode generally) are roadmap,
> not shipped. Their adapters return no containment hook and stay ineligible until
> either CLI offers a documented non-interactive bypass.

## Cross-model QA

A unit's session harness is **independent of the workspace harness**. A
`claude-code` workspace can dispatch a **QA** unit to `gemini` — an independent,
cross-model second read of a delivery. All that requires is the `gemini` binary
being present.

(Two different axes, easy to conflate. As a **workspace** harness at `aipe start`,
Claude Code, Codex, Gemini CLI, GitHub Copilot, and an experimental
generic/`AGENTS.md` adapter are all supported today — Antigravity and Cursor are
`coming-soon`. **Session containment** is the narrower bar in the table above:
`codex` and `copilot` are fine as a *workspace* harness but are rejected as a
*session dispatch target*, because that needs a hook trusted with no human
present. See [harness compatibility](/#harness).)

## Session grant

`aipe session grant` is the **only authorised escape** from containment, scoped to
one `(journey, session)` pair.

> **Roadmap / not yet shipped.** Grant **redemption is not yet effective.** The
> quota machinery is implemented and tested, but consuming it requires `agentop`
> to stamp `AGENTOP_SESSION_ID` into the specialist's environment, which it does
> not do yet. The command records the quota and **says so**; treat it as pending,
> not shipped.

## Checking your machine

```sh
aipe session doctor    # reports whether agentop (>= 1.9.0) is installed
```

`agentop` here is the one from the **agentistics** project — not the unrelated npm
package of the same name. Without `agentop`, `mode: session` is simply
unavailable and every unit dispatches as a subagent, unaffected. Other session
subcommands: `aipe session guard`.

Related: [execution envelopes](execution-envelopes.md) ·
[the laws](../laws/laws-and-conventions.md).
