import { motion, AnimatePresence } from "framer-motion";
import StateBadge from "../../../components/StateBadge";
import type { LedgerStatus } from "../../../domain/states";
import type { DecisionId, SceneState, StageSpecialist } from "./sceneModel";

/**
 * The stage pane — the second independent hero component. It is a scene, not a
 * document: the coordinator and specialists are objects, allocation is movement
 * (a specialist appears, is carved a worktree, takes a wave lane, queues behind
 * another), and a decision is a visible state change (the envelope axes settle,
 * the cost-index resolves, a gate flips open→blocked). Parallel work reads as
 * parallel space; serialised work reads as a queue.
 *
 * Pure and presentational: it takes a folded `SceneState` plus a one-line caption
 * and labels, imports no sibling component, and renders standalone (Stage.test.tsx).
 * Under `reduced`, motion is dropped but the whole scene is present and readable.
 */
export interface StageLabels {
  header: string;
  coordinator: string;
  unit: string;
  floor: string;
  envelope: string;
  costIndex: string;
  gated: string;
  notMoney: string;
  wave: string;
  queued: string;
  running: string;
  worktree: string;
  evidenceGate: string;
  qaGate: string;
  blocked: string;
  open: string;
  rejected: string;
  ledger: string;
}

export interface StageProps {
  scene: SceneState;
  caption: string;
  activeDecision: DecisionId | null;
  labels: StageLabels;
  reduced?: boolean;
}

const RAMP: readonly LedgerStatus[] = ["dispatched", "delivered", "verified", "merged"];

function appear(reduced?: boolean) {
  return reduced
    ? {}
    : {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
      };
}

/* ------------------------------------------------------------------- the node */

function Node({
  glyph,
  label,
  sub,
  tone = "brand",
  show,
  reduced,
}: {
  glyph: string;
  label: string;
  sub?: string;
  tone?: "brand" | "muted" | "verified";
  show: boolean;
  reduced?: boolean;
}) {
  const ring =
    tone === "verified" ? "border-state-verified/50 bg-state-verified/10" : tone === "muted" ? "border-line bg-surface-2" : "border-brand/50 bg-brand/10";
  return (
    <AnimatePresence>
      {show ? (
        <motion.span
          {...appear(reduced)}
          exit={reduced ? undefined : { opacity: 0, scale: 0.9 }}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${ring}`}
        >
          <span aria-hidden="true" className="text-[13px] leading-none text-brand-strong">
            {glyph}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-mono text-[11.5px] text-text">{label}</span>
            {sub ? <span className="font-mono text-[9.5px] text-faint">{sub}</span> : null}
          </span>
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------- the specialist token */

function SpecialistToken({
  s,
  labels,
  reduced,
}: {
  s: StageSpecialist;
  labels: StageLabels;
  reduced?: boolean;
}) {
  const phase = s.running ? "running" : s.queued ? "queued" : "placed";
  const ring =
    phase === "running"
      ? "border-state-running/60 bg-state-running/10"
      : phase === "queued"
        ? "border-line bg-surface-2/70 opacity-80"
        : "border-brand/40 bg-brand/[0.06]";
  return (
    <motion.div
      layout={!reduced}
      {...appear(reduced)}
      className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${ring}`}
    >
      {/* a subtle stacked shadow behind a queued token reads as "waiting behind" */}
      {s.queued ? (
        <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 -z-10 h-full w-full rounded-lg border border-line-soft/70 bg-surface-2/40" />
      ) : null}
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 font-mono text-[11px] font-bold text-brand-strong"
        aria-hidden="true"
      >
        {s.persona.charAt(0)}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-mono text-[11.5px] text-text">
          {s.persona} <span className="text-faint">· {s.role}</span>
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9.5px]">
          <span className={phase === "running" ? "text-state-running" : phase === "queued" ? "text-state-dispatched" : "text-faint"}>
            {phase === "running" ? (
              <span className="inline-flex items-center gap-1">
                <span className={`inline-block h-1.5 w-1.5 rounded-full bg-state-running ${reduced ? "" : "animate-pulse"}`} />
                {labels.running}
              </span>
            ) : phase === "queued" ? (
              labels.queued
            ) : (
              ""
            )}
          </span>
          {s.worktree ? <span className="text-faint">⌥ {labels.worktree}</span> : null}
        </span>
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ the stage */

export default function Stage({ scene, caption, activeDecision, labels, reduced }: StageProps) {
  const lanes = [1, 2];
  const inLane = (lane: number) => scene.specialists.filter((s) => s.lane === lane);
  const envActive = activeDecision === "envelope";
  const laneActive = activeDecision === "law" || activeDecision === "worktree" || activeDecision === "dispatch";
  const ledgerActive =
    activeDecision === "deliver" || activeDecision === "evidence" || activeDecision === "qa-block" || activeDecision === "verify" || activeDecision === "merged";

  return (
    <div className="flex h-[26rem] flex-col lg:h-[32rem]">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/50 px-3.5 py-2">
        <span aria-hidden="true" className="text-brand">◆</span>
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">{labels.header}</span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-3.5">
        <div className="flex flex-col gap-3">
          {/* Pipeline origin: coordinator → unit → route */}
          <div className="flex flex-wrap items-center gap-2">
            <Node glyph="⎇" label={labels.coordinator} show={scene.coordinator} reduced={reduced} />
            {scene.unit ? <span aria-hidden="true" className="text-faint">→</span> : null}
            <Node glyph="◆" label={labels.unit} sub="aipe-site" show={scene.unit} reduced={reduced} />
            {scene.routed ? (
              <>
                <span aria-hidden="true" className="text-faint">→</span>
                <Node glyph="⚙" label="sdd-lite" sub={labels.floor} tone="verified" show={scene.routed} reduced={reduced} />
              </>
            ) : null}
          </div>

          {/* Envelope panel: axes settle, cost-index resolves, the gate padlock snaps */}
          <AnimatePresence>
            {scene.envelope.shown ? (
              <motion.div
                {...appear(reduced)}
                className={`rounded-xl border p-3 ${envActive ? "border-brand/60 bg-brand/[0.05]" : "border-line-soft bg-surface-2/50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ["mode", "session"],
                      ["harness", "claude-code"],
                      ["tier", "reasoning"],
                      ["effort", "ultracode"],
                    ].map(([k, v]) => (
                      <span key={k} className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                        <span className="text-faint">{k}</span> {v}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-wide text-faint">{labels.costIndex}</span>
                    <motion.span
                      key={scene.envelope.costIndex ?? 0}
                      {...(reduced ? {} : { initial: { scale: 0.7, opacity: 0 }, animate: { scale: 1, opacity: 1 } })}
                      className="font-display text-2xl font-bold leading-none text-brand tabular-nums"
                    >
                      {scene.envelope.costIndex}
                    </motion.span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[9.5px] text-faint">2 × 4 × 8 · {labels.notMoney}</span>
                  {scene.envelope.gated ? (
                    <motion.span
                      {...(reduced ? {} : { initial: { scale: 0.6 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 500, damping: 18 } })}
                      className="inline-flex items-center gap-1 rounded-md border border-state-escalated/50 bg-state-escalated/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-state-escalated"
                    >
                      <span aria-hidden="true">🔒</span> {labels.gated}
                    </motion.span>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Wave lanes: parallel space; the same package serialises into a queue */}
          <AnimatePresence>
            {scene.serialized ? (
              <motion.div {...appear(reduced)} className={`rounded-xl border p-2.5 ${laneActive ? "border-brand/50" : "border-line-soft"} bg-surface-2/30`}>
                <div className="flex flex-col gap-2">
                  {lanes.map((lane) => (
                    <div key={lane} className="flex items-center gap-2">
                      <span className="w-14 shrink-0 font-mono text-[9.5px] uppercase tracking-wide text-faint">
                        {labels.wave} {lane}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {inLane(lane).map((s) => (
                          <SpecialistToken key={s.id} s={s} labels={labels} reduced={reduced} />
                        ))}
                        {inLane(lane).length === 0 ? <span className="font-mono text-[10px] text-faint/60">—</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Ledger track: stations light in order; the two gates hold */}
          <AnimatePresence>
            {scene.journeyOpen ? (
              <motion.div {...appear(reduced)} className={`rounded-xl border p-2.5 ${ledgerActive ? "border-brand/50" : "border-line-soft"} bg-surface-2/30`}>
                <p className="mb-2 font-mono text-[9.5px] uppercase tracking-wide text-faint">{labels.ledger}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {RAMP.map((status, i) => {
                    const lit = scene.ledger.includes(status);
                    const gate =
                      i === 1 ? "evidence" : i === 2 ? "qa" : null; // evidence before delivered; QA before verified
                    return (
                      <span key={status} className="flex items-center gap-1.5">
                        {gate === "evidence" ? (
                          <GateChip
                            state={scene.gates.evidence === "rejected" ? "rejected" : "idle"}
                            label={labels.evidenceGate}
                            rejectedLabel={labels.rejected}
                            openLabel={labels.open}
                            blockedLabel={labels.blocked}
                          />
                        ) : null}
                        {gate === "qa" ? (
                          <GateChip
                            state={scene.gates.qa}
                            label={labels.qaGate}
                            rejectedLabel={labels.rejected}
                            openLabel={labels.open}
                            blockedLabel={labels.blocked}
                          />
                        ) : null}
                        <span className={lit ? "" : "opacity-30 grayscale"}>
                          <StateBadge state={status} size="sm" title={false} />
                        </span>
                        {i < RAMP.length - 1 ? <span aria-hidden="true" className="text-faint text-[10px]">→</span> : null}
                      </span>
                    );
                  })}
                  {scene.immutable ? (
                    <span className="ml-1 inline-flex items-center gap-1 font-mono text-[10px] text-state-merged">
                      <span aria-hidden="true">🔒</span>
                    </span>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* The one-line caption — a label or clause, never a paragraph. */}
      <div className="border-t border-line-soft bg-surface-2/40 px-3.5 py-2.5">
        <p className="flex items-center gap-2 font-mono text-[12px] text-text" aria-live="polite">
          <span aria-hidden="true" className="text-brand">▸</span>
          {caption}
        </p>
      </div>
    </div>
  );
}

function GateChip({
  state,
  label,
  rejectedLabel,
  openLabel,
  blockedLabel,
}: {
  state: "idle" | "rejected" | "blocked" | "open";
  label: string;
  rejectedLabel: string;
  openLabel: string;
  blockedLabel: string;
}) {
  const meta =
    state === "blocked"
      ? { cls: "border-state-failed/60 bg-state-failed/10 text-state-failed", glyph: "⛔", tag: blockedLabel }
      : state === "rejected"
        ? { cls: "border-state-failed/50 bg-state-failed/10 text-state-failed", glyph: "✕", tag: rejectedLabel }
        : state === "open"
          ? { cls: "border-state-verified/50 bg-state-verified/10 text-state-verified", glyph: "✓", tag: openLabel }
          : { cls: "border-line bg-surface-2 text-faint", glyph: "▮", tag: "" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9px] uppercase ${meta.cls}`} title={label}>
      <span aria-hidden="true">{meta.glyph}</span>
      {label}
      {meta.tag ? <span className="opacity-80">· {meta.tag}</span> : null}
    </span>
  );
}
