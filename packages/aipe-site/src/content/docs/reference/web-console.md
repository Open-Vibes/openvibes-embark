---
slug: web-console
title: Web Console
description: aipe serve renders the whole company as a live, local web app.
group: reference
order: 1
---

# Web Console

`aipe serve` starts a **zero-dependency** Bun HTTP server that renders the whole
company as a **responsive web app** — the org chart, the pipeline, and a detail
panel, live and local.

```sh
aipe serve                                   # http://127.0.0.1:4317
aipe serve --port 8080 --workspace ../aipe-opvibes
```

It binds **localhost by default** (`127.0.0.1:4317`); nothing leaves the machine.

## Two purpose-built experiences

Not one reflowed layout — two.

### Desktop cockpit

- The **org chart** as an interactive SVG graph: the coordinator hub → repo
  clusters → specialist nodes **colored by state**, drawn over the relation edges.
- A **pipeline board**: columns are stages, cards are dispatches with their PRs.
- A **detail panel** for the selected worker, repo, or dispatch.

### Mobile flow

A tab bar over workers-by-repo, a collapsible org tree, and a per-journey pipeline
timeline.

## Live and self-contained

- **Live over SSE.** It watches `.aipe/` with `fs.watch` (plus a reconcile safety
  net), so the view updates in realtime with no lost update.
- **Theme-aware** (light/dark).
- **Self-contained.** The SPA's HTML/CSS/JS is inlined and embedded in the binary
  via a text import — **no external CDN** — so `--compile` keeps working.

It reads the **same extended `buildSnapshot`** the terminal dashboard uses, so the
two surfaces never disagree.

## Terminal equivalent

Prefer to stay in the terminal? `aipe dashboard` renders the same snapshot as a
TUI.

```sh
aipe dashboard
```

Related: [operation & the ledger](../operation/operation-and-ledger.md) ·
[the CLI reference](cli-reference.md).
