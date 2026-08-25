---
slug: execution-envelopes
title: Execution Envelopes
description: The four axes of a dispatch, the cost-index, and the gate policy.
group: capabilities
order: 1
---

# Execution Envelopes

Every dispatch chooses an **execution envelope**: how it runs, how hard, on what,
and with what model. Left to guesswork, the cheapest correct choice rarely gets
made — so AIPe enumerates and prices every viable envelope, and gates the
expensive ones behind the PE's signature.

## The four axes

| Axis | Values |
|---|---|
| **mode** | `subagent` (in-process) · `session` (detached `agentop` session) |
| **intensity** | `normal` · `ultracode` |
| **harness** | `claude-code` · `gemini` · `codex` · `copilot` |
| **tier** | `fast` · `standard` · `reasoning` · `frontier` |

`mode` and `tier` are covered here and in
[session mode & dispatch](session-mode-dispatch.md); which harnesses can actually
be dispatched to under session mode is a containment question, also covered there.

## The cost-index

```
cost-index = mode × tier × intensity
```

with these multipliers:

| Axis | Multiplier |
|---|---|
| mode `subagent` | 1 |
| mode `session` | 2 |
| tier `fast` | 1 |
| tier `standard` | 2 |
| tier `reasoning` | 4 |
| tier `frontier` | 6 |
| intensity `normal` | 1 |
| intensity `ultracode` | 8 |

The cheapest envelope (`subagent · fast · normal`) is **1**. A
`session · frontier · ultracode` unit is `2 × 6 × 8 = 96`.

> **`cost-index` is a coarse relative index — never money.** AIPe cannot know your
> token price, plan, or rate limits. Every surface that prints it says so. Use it
> to compare envelopes against each other, not to predict a bill.

## `aipe execution propose` — enumerate and price

`aipe execution propose --journey <id>` probes this machine's capabilities (or
self-heals by probing right there if the record is missing), crosses them against
`.aipe/execution-policy.yaml`, and prints, **per unit**, every *viable* envelope
with its `cost-index` and a **`GATED`** marker where the policy needs the PE's
signature.

It **enumerates and prices; it never chooses.** The PE approves, the coordinator
records the chosen envelope per unit, and then:

- `aipe execution plan --journey <id>` groups the recorded choices into **waves**
  (session mode binds `--model` per wave, not per unit) and reports the
  wave-level cost and any gate.

## The default gate policy

If `.aipe/execution-policy.yaml` is absent, conservative defaults apply:

| Policy field | Default | Effect |
|---|---|---|
| `gatedIntensities` | `[ultracode]` | `ultracode` needs PE sign-off. |
| `gatedTiers` | `[frontier]` | `frontier` tier needs PE sign-off. |
| `maxCostIndexPerWave` | `24` | A wave above this is gated. |
| `gateAboveSessions` | `2` | More than 2 sessions in a wave is gated. |
| `maxSessionsPerWave` | `4` | Hard cap on sessions per wave. |

A `GATED` envelope is not forbidden — it is one the PE must explicitly approve
before it runs.

## Capabilities record

`aipe start` probes this machine's harness binaries automatically and writes
`.aipe/capabilities.yaml` — a **claim with a date, not a fact**, so it stays
unconfirmed until you run `aipe capabilities confirm` (your word overriding it). A
binary on `PATH` is not an authenticated binary.

```sh
aipe capabilities probe     # re-run detection by hand (after installing a harness)
aipe capabilities show      # flag drift (a recorded harness that appeared or vanished)
aipe capabilities confirm   # put your word on record
```

`aipe execution propose` runs on an unconfirmed record too — it just prints a
NOTE on every line saying so.

Related: [session mode & dispatch](session-mode-dispatch.md) ·
[the CLI reference](../reference/cli-reference.md).
