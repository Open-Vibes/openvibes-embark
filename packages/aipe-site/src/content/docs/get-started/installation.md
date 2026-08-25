---
slug: installation
title: Installation
description: Install the aipe binary and set up your first workspace.
group: get-started
order: 1
---

# Installation

AIPe is distributed as a Claude Code plugin, driven by a single standalone `aipe`
binary. You need no Bun, Node, or npm to run it.

```sh
curl -fsSL https://aipe.openvibes.tech/cli | sh
```

Then set up a workspace in an empty folder:

```sh
aipe start
```

`aipe start` is a plain terminal program — it lists the agent harnesses it can
find on this machine, asks for a workspace name, and creates a publishable
`aipe-<name>/` folder with the integration inside.

Open that folder in your harness and **just say hi** — the coordinator drives the
rest of onboarding conversationally.
