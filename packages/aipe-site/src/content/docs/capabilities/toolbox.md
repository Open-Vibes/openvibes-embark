---
slug: toolbox
title: Toolbox
description: Equip a context with skill-packages and MCP servers, routed by task.
group: capabilities
order: 3
---

# Toolbox

The **`/toolbox`** flow equips a context with **frameworks** (skill-packages) and
**MCP servers**, catalogued in `.aipe/toolbox.yaml`. Skills install **per repo**;
MCP servers install at **workspace scope** (shared) or **per repo**.

## Skills vs. MCP

| | Skills (frameworks) | MCP servers |
|---|---|---|
| What | Skill-packages that give personas methods | Tool servers a persona can call |
| Scope | Per repo | Workspace (shared) or per repo |
| Catalog | `.aipe/toolbox.yaml` | `.aipe/toolbox.yaml` |
| Manage | `aipe skill …` | `aipe mcp …` |

## Routing — match the tool to the task

Each framework carries **routing** metadata (`taskTypes`, `skipFor`, `minSize`).
The point is that a heavy kit must **not** be routed onto a trivial task.

```sh
aipe skill match --task-type <feature|refactor|styling|copy|...> [--size small|medium|large]
```

`aipe skill match` prints **MATCH** lines so the coordinator picks the right tool
**mechanically**, not by vibes. For example, a large spec-driven kit like SDD
should not be dragged onto a one-line copy change.

## Skill lifecycle

```sh
aipe skill add <kit>        # install a framework into a repo
aipe skill list             # what is installed
aipe skill match ...        # route a task to the right tool
aipe skill preset ...       # apply a preset bundle of kits
aipe skill remove <kit>     # uninstall
```

Kits shipped today: **`sdd-lite`**, **`spec-kit`**, **`pdd`** (add via
`aipe skill add` or apply a bundle with `aipe skill preset`).

## MCP lifecycle

```sh
aipe mcp add <name> ...     # add an MCP server (workspace or per repo)
aipe mcp list               # what is catalogued
aipe mcp remove <name>      # remove it
```

## The secrets law

Secrets **never enter the published catalog.** `aipe mcp add` **refuses** literal
secrets in an MCP config — **environment references only**. The `--allow-secrets`
flag overrides this, but the default protects you from publishing a credential
into `.aipe/toolbox.yaml`. This is one of the framework's
[conventions](../laws/laws-and-conventions.md).

Related: [the laws](../laws/laws-and-conventions.md) ·
[the CLI reference](../reference/cli-reference.md).
