---
slug: quickstart
title: Quickstart
description: From install to your first demand in a few minutes.
group: get-started
order: 2
---

# Quickstart

AIPe (AI Product Engineer) turns your agent harness into an engineering
**coordinator** and puts you in the seat of the **Product Engineer (PE)**. You
bring demands; the coordinator decomposes them, dispatches specialists, and
returns pull requests. This page takes you from nothing to your first dispatch.

## 1. Install the binary

AIPe ships as a single standalone binary — no Bun, Node, or npm on the host.

```sh
curl -fsSL https://aipe.openvibes.tech/cli | sh
```

See [Installation](installation.md) for details.

## 2. Create a workspace with `aipe start`

`aipe start` is a plain terminal program (no AI). It lists the agent harnesses
it finds on this machine, asks for a workspace name, and creates a publishable
`aipe-<name>/` git repo with the integration inside. It also probes this
machine's harness binaries and writes `.aipe/capabilities.yaml`.

```sh
aipe start
#   ? Choose your agent harness:  ❯ Claude Code · Codex · Gemini CLI · GitHub Copilot · generic
#   ? Workspace name:  my-company
#   ✓ Created aipe-my-company/
```

As a *workspace* harness, `aipe start` supports **Claude Code, Codex, Gemini CLI,
GitHub Copilot**, and an experimental **generic/AGENTS.md** adapter today;
**Antigravity** and **Cursor** are listed `coming-soon`. Claude Code is the
default and the most complete — it is the only one with full **session
containment** — but AIPe is not a Claude Code tool. That workspace question is
separate from which harness a *unit* can be dispatched to under session mode: a
Claude Code workspace can still dispatch a QA unit to `gemini`. See
[session mode & dispatch](../capabilities/session-mode-dispatch.md).

## 3. Open the workspace and say hi

Onboarding is conversational — there are no slash commands to memorize. Open the
new folder in your harness and greet the coordinator. The command below shows
Claude Code as **one example**; open the folder in whichever harness you picked.

```sh
cd aipe-my-company && claude   # Claude Code shown here — use your harness's launch command
```

Just say **hi**. A `SessionStart` hook injects the coordinator's awareness, and
it walks you through onboarding one step at a time. After each step it tells you
to open a **new session** to continue — this is expected. The four steps are
covered in [Onboarding](../phases/onboarding.md):

1. Declare your repos.
2. Clone them onto disk.
3. Discover their cross-repo relations.
4. Hire each repo's specialists (1 dev-fullstack + 1 QA).

## 4. Bring a demand

Once onboarded, describe a demand in plain language — a bug, a feature, a task
spanning several repos. The coordinator runs the **`/operate`** flow: it opens a
journey, decomposes the demand into per-repo tasks, sequences them into
dependency-first waves, and dispatches each specialist into an isolated git
worktree. Each specialist returns a pull request; cross-repo needs escalate back
to you. See [Operation & the ledger](../operation/operation-and-ledger.md).

## Optional: confirm capabilities and enable sessions

Two optional steps become relevant once you are operating:

```sh
aipe capabilities confirm   # put your word on record over the auto-probe
aipe session doctor         # check agentop for session-mode dispatch
```

Skipping both is fine — `aipe execution propose` still runs on an unconfirmed
record, and every unit dispatches as an in-process subagent without `agentop`.

## Where to go next

- [The two phases](../phases/the-two-phases.md) — the shape of the whole system.
- [Laws & conventions](../laws/laws-and-conventions.md) — the rules the framework enforces.
- [Execution envelopes](../capabilities/execution-envelopes.md) — how a dispatch gets priced.
- [CLI reference](../reference/cli-reference.md) — the full subcommand surface.
