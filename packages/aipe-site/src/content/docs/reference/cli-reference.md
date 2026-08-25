---
slug: cli-reference
title: CLI Reference
description: The full aipe subcommand surface, grouped by what it does.
group: reference
order: 3
---

# CLI Reference

AIPe's portable core is a single binary, `aipe`. Everything past raw agent output
on disk is a deterministic, tested subcommand. This page is the map; the linked
pages carry the detail.

## Global flags

| Flag | Effect |
|---|---|
| `--version`, `-v` | Print the version. |
| `--help`, `-h` | Print help. |
| `--workspace <dir>` | Operate on a workspace other than the current directory. |

## Onboarding

| Command | What it does |
|---|---|
| `aipe start` | Create a publishable `aipe-<name>/` workspace; pick the harness; probe capabilities. |
| `aipe context-brain` | Declare the repos → `.aipe/brain.yaml`. |
| `aipe make-workspace` | Clone the declared repos (+ rehydrate personas/toolbox). |
| `aipe add-repo` | Append one repo to an already-onboarded context. |
| `aipe detect-packages` | Detect packages (units of work) within a repo. |
| `aipe relationship` | Discover cross-repo relations + backfill stack → `.aipe/relations/`. |
| `aipe hire-specialists` | Hire 1 dev + 1 QA persona per repo → `.aipe/personas.yaml`. |
| `aipe read-state` | Read onboarding/operation state. |
| `aipe session-context` | Emit the coordinator/persona context (used by the `SessionStart` hook). |

See [Onboarding](../phases/onboarding.md).

## Operation

| Command | Subcommands | What it does |
|---|---|---|
| `aipe worktree` | `create` · `list` · `remove` · `prune` | Manage isolated per-dispatch worktrees. |
| `aipe dispatch` | `validate` · `claim` · `release` | Adjudicate a batch against the parallel-dispatch law; claim/release units. |
| `aipe journey` | `start` · `record` · `show` · `spec` · `reconcile` · `verify` | The per-demand ledger; `verify` is a deterministic reliability lint. |

See [Operation & the ledger](../operation/operation-and-ledger.md) and
[the laws](../laws/laws-and-conventions.md).

## Sessions

| Command | Subcommands | What it does |
|---|---|---|
| `aipe session` | `dispatch` · `collect` · `doctor` · `grant` · `guard` | Run a unit as a detached `agentop` session; poll; check `agentop`; issue a containment grant; guard. |

See [Session-mode dispatch](../capabilities/session-mode-dispatch.md).

> **Roadmap / not yet shipped.** `aipe session grant` records a spawn quota but its
> **redemption is not yet effective** — `agentop` does not stamp
> `AGENTOP_SESSION_ID` yet. Codex/Copilot session containment (and non-Claude-Code
> session adapters) are also roadmap, not shipped.

## Capabilities & execution

| Command | Subcommands | What it does |
|---|---|---|
| `aipe capabilities` | `probe` · `show` · `confirm` | Detect what this machine can run; flag drift; record your word. |
| `aipe execution` | `propose` · `plan` | Enumerate & price every viable envelope (with `GATED` markers); group chosen envelopes into waves. |
| `aipe model` | — | Model selection by tier + authorization/volume gates. |

See [Execution envelopes](../capabilities/execution-envelopes.md).

## Toolbox

| Command | Subcommands | What it does |
|---|---|---|
| `aipe skill` | `add` · `list` · `match` · `preset` · `remove` | Manage skill-package frameworks; `match` routes a task to the right kit. |
| `aipe mcp` | `add` · `list` · `remove` | Manage MCP servers (workspace or per-repo); `add` refuses literal secrets. |

See [Toolbox](../capabilities/toolbox.md).

## Consoles & collaboration

| Command | What it does |
|---|---|
| `aipe dashboard` | Terminal (TUI) view of the whole company. |
| `aipe serve` | Zero-dependency web console (default `127.0.0.1:4317`), live over SSE. |
| `aipe handoff` | Portable `CLAUDE.md` export for a non-AIPe collaborator (standalone). |

See [Web console](web-console.md) and [Handoff](handoff.md).

## Maintenance

| Command | What it does |
|---|---|
| `aipe validate-personas` | Validate the persona roster. |
| `aipe rehydrate` | Repair/regenerate the in-repo integration (personas, toolbox skills). |
| `aipe check-update` | Silent when current; prints the banner when a newer release exists. |
| `aipe upgrade` (alias `update`) | Download, verify, and self-install the new binary. It then tells you to run `aipe rehydrate` in each workspace; the new version takes effect on your next `aipe` command. |
