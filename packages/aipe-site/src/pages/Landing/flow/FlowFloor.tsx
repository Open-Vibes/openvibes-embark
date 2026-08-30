import { motion } from "framer-motion";
import StateBadge from "../../../components/StateBadge";
import type { StateKey } from "../../../domain/states";
import type { AgentPhase, FlowFacts, FlowState } from "./flowModel";

/**
 * The floor — the top pane of the stacked scene, and the informative half. It is
 * a single `role="img"` with a full `aria-label`, so a screen reader hears one
 * coherent description of what is shown rather than a stream of moving fragments;
 * the purely decorative travelling rail is `aria-hidden`. Everything is labelled
 * DOM (real repo and agent names, real states), not a canvas.
 *
 * Purely presentational and NON-INTERACTIVE: it takes a folded `FlowState` and
 * renders it. There are no callbacks, no buttons, and nothing responds to a
 * click — the two `zero-interactivity` tests keep it that way. Under `reduced`,
 * motion is dropped and the same scene stands still.
 */

export interface FlowFloorLabels {
  ariaLabel: string;
  coordinator: string;
  dispatchLaw: string;
  parallel: string;
  units: string;
  repos: string;
  wave: string;
  placed: string;
  running: string;
  worktree: string;
  ledger: string;
  receiving: string;
  caption: string;
}

export interface FlowFloorProps {
  facts: FlowFacts;
  scene: FlowState;
  labels: FlowFloorLabels;
  reduced?: boolean;
}

const LEDGER_RAMP: readonly StateKey[] = ["dispatched", "delivered", "verified", "merged"];

/** How full an agent's work bar reads at each phase. Running fills over the work beat. */
const PROGRESS: Record<AgentPhase, number> = {
  idle: 0,
  placed: 0.06,
  running: 0.66,
  delivered: 1,
  verified: 1,
  merged: 1,
};

/** Agent phases that map to a real ledger/session StateBadge. */
function badgeState(state: AgentPhase): StateKey | null {
  return state === "running" || state === "delivered" || state === "verified" || state === "merged" ? state : null;
}

/* -------------------------------------------------------------------- the rail */

/**
 * The travelling dispatch/PR rail — a row of chevrons that sweep to imply motion:
 * outward while work is dispatched, inward while PRs and review return. Decorative
 * (the state it depicts is already carried by the labelled nodes), so `aria-hidden`.
 */
function Rail({ active, reversed, reduced }: { active: boolean; reversed?: boolean; reduced?: boolean }) {
  const glyph = reversed ? "‹" : "›";
  const count = 5;
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-1 py-1 text-brand sm:min-w-[3.5rem] sm:flex-1"
    >
      <span className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-brand/30 sm:block" />
      <span className="flex items-center gap-0.5 font-mono text-sm">
        {Array.from({ length: count }, (_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={
              active && !reduced
                ? { opacity: [0.15, 1, 0.15] }
                : { opacity: active ? 0.6 : 0.18 }
            }
            transition={
              active && !reduced
                ? { duration: 1.1, repeat: Infinity, delay: (reversed ? count - 1 - i : i) * 0.12, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            {glyph}
          </motion.span>
        ))}
      </span>
      <span className="hidden h-px flex-1 bg-gradient-to-l from-transparent to-brand/30 sm:block" />
    </div>
  );
}

/* ------------------------------------------------------------------ the agent */

function AgentRow({
  agent,
  labels,
  reduced,
}: {
  agent: FlowState["groups"][number]["agents"][number];
  labels: FlowFloorLabels;
  reduced?: boolean;
}) {
  const badge = badgeState(agent.state);
  const target = PROGRESS[agent.state];
  const delivered = agent.state === "delivered" || agent.state === "verified" || agent.state === "merged";
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-line-soft bg-surface-2/40 p-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 font-mono text-[10px] font-bold text-brand-strong"
          aria-hidden="true"
        >
          {agent.persona.charAt(0)}
        </span>
        <span className="font-mono text-[11.5px] text-text">
          {agent.persona} <span className="text-faint">· {agent.role}</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {delivered ? <span className="font-mono text-[10px] text-state-delivered">#{agent.pr}</span> : null}
          {badge ? (
            <StateBadge state={badge} size="sm" title={false} />
          ) : (
            <span className="rounded-full border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint">
              {labels.placed}
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="truncate font-mono text-[9.5px] text-faint">{agent.package}</span>
        {agent.worktree ? <span className="font-mono text-[9.5px] text-faint">⌥ {labels.worktree}</span> : null}
      </div>
      {/* Work bar — fills over the running beat, full on delivery. */}
      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={false}
          animate={{ width: `${Math.round(target * 100)}%` }}
          transition={reduced ? { duration: 0 } : { duration: agent.state === "running" ? 3 : 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- the floor */

export default function FlowFloor({ facts, scene, labels, reduced }: FlowFloorProps) {
  const dispatchActive = scene.phase === "dispatch" || scene.phase === "work";
  const returnActive = scene.phase === "deliver" || scene.phase === "review";

  return (
    <div role="img" aria-label={labels.ariaLabel} className="flex flex-col">
      {/* Header: the coordinator, the journey, and the LAW's real verdict. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line-soft bg-surface-2/40 px-3.5 py-2.5">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="text-brand">◆</span>
          <span className="font-mono text-[11px] text-text">{facts.coordinator}</span>
          <span className="font-mono text-[10px] text-faint">· {labels.coordinator}</span>
        </span>
        <span className="font-mono text-[10px] text-faint">{facts.journey}</span>
        {scene.validated ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-state-verified/40 bg-state-verified/10 px-2 py-0.5">
            <span aria-hidden="true" className="text-state-verified">✓</span>
            <span className="font-mono text-[10px] text-state-verified">
              {labels.dispatchLaw}: {labels.parallel} · {scene.verdict.batch} {labels.units} · {scene.verdict.repos} {labels.repos}
            </span>
          </span>
        ) : null}
      </div>

      {/* The fan: coordinator core → rail → repo groups. Stacks on mobile. */}
      <div className="relative overflow-hidden p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {/* Coordinator core */}
          <div className="flex items-center gap-2 self-start rounded-xl border border-brand/40 bg-brand/[0.06] px-3 py-2 sm:flex-col sm:justify-center sm:self-center sm:text-center">
            <span
              aria-hidden="true"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand/50 bg-brand/15 text-brand-strong ${reduced ? "" : "animate-pulse-soft"}`}
            >
              ◆
            </span>
            <span className="font-mono text-[10.5px] text-text sm:mt-1">{labels.coordinator}</span>
          </div>

          {/* Before the law places anything, the coordinator stands alone. */}
          {scene.validated ? (
            <>
              <Rail active={dispatchActive} reduced={reduced} />

              {/* Repo groups — two repos, side by side on wide, stacked on narrow. */}
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                {scene.groups.map((group) => (
                  <div key={group.repo} className="flex min-w-0 flex-col gap-2 rounded-xl border border-line-soft bg-surface-1/40 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden="true" className="text-faint">▸</span>
                      <span className="truncate font-mono text-[11px] font-semibold text-brand-strong">{group.repo}</span>
                    </div>
                    {group.agents.map((agent) => (
                      <AgentRow key={agent.id} agent={agent} labels={labels} reduced={reduced} />
                    ))}
                  </div>
                ))}
              </div>

              {/* The return rail (PRs + review) — only meaningful once work returns. */}
              <Rail active={returnActive} reversed reduced={reduced} />
            </>
          ) : (
            <div className="flex flex-1 items-center gap-2 py-2 font-mono text-[11px] text-faint">
              <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full bg-brand ${reduced ? "" : "animate-pulse"}`} />
              {labels.receiving}
            </div>
          )}
        </div>
      </div>

      {/* Ledger track: stations light in lifecycle order. */}
      <div className="border-t border-line-soft px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[9.5px] uppercase tracking-wide text-faint">{labels.ledger}</span>
          {LEDGER_RAMP.map((status, i) => {
            const lit = scene.ledger.includes(status as never);
            return (
              <span key={status} className="flex items-center gap-1.5">
                <span className={lit ? "" : "opacity-30 grayscale"}>
                  <StateBadge state={status} size="sm" title={false} />
                </span>
                {i < LEDGER_RAMP.length - 1 ? (
                  <span aria-hidden="true" className="text-[10px] text-faint">→</span>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>

      {/* One short caption for the current beat — a label, never a paragraph. */}
      <div className="border-t border-line-soft bg-surface-2/40 px-3.5 py-2.5">
        <p className="flex items-center gap-2 font-mono text-[12px] text-text">
          <span aria-hidden="true" className="text-brand">▸</span>
          {labels.caption}
        </p>
      </div>
    </div>
  );
}
