import { motion, AnimatePresence } from "framer-motion";
import StateBadge from "../../../components/StateBadge";
import type { StateKey } from "../../../domain/states";
import type { AgentPhase, FlowFacts, FlowState } from "./flowModel";

/**
 * The floor — the informative half of the scene, and the part the PE asked to
 * lay DOWN. It is a single `role="img"` with a full `aria-label`, so a screen
 * reader hears one coherent description rather than a stream of moving fragments.
 *
 * v5 (j-20260831-4w) — the card DEITADO + communication made visible, with a QA
 * gate PER DELIVERY. Earlier versions stacked each agent in a narrow vertical
 * column crammed against the right edge, wasting the width, reading as a static
 * roster, and overflowing their own badges. This version turns the axis: on wide
 * screens the whole thing is a LEFT-TO-RIGHT assembly line — coordinator on the
 * left, then, for each running unit, a row that flows rightward
 * `specialist → (review) → its own QA gate`, converging to the repo's promotion
 * into `main`. Every hand-off is a DRAWN directional connector carrying a live
 * pulse while its beat is active, so the link is visible AS a link, not inferred
 * from proximity. The six connectors the acceptance names:
 *
 *   coordinator → specialist  ...  the dispatch bus (brand), pulses on dispatch
 *   specialist  → spec        ...  the inline arrow to the SPEC chip (delivered)
 *   specialist  → PR          ...  the inline arrow to the dev-PR chip (delivered)
 *   PR          → QA           ...  the review gutter into THIS delivery's gate
 *   QA          → specialist  ...  the SAME gutter, flipped RED and pointing back
 *   promotion   → main         ...  the promote gutter (brand) into the main node
 *
 * Because the QA gate is per delivery, the rejection return is a SHORT hop right
 * back to its own specialist (adjacent row), which is the most legible form of
 * "who sent what back to whom". The QA/main stations are reserved columns from
 * the first frame, so each artifact FADES into a slot that was already there —
 * nothing reflows, which is what keeps badges from ever overlapping mid-motion.
 *
 * On phones/tablets (< lg, 1024px) it collapses to a single readable column and
 * the connectors turn vertical. Purely presentational and NON-INTERACTIVE: it
 * takes a folded `FlowState` and renders it — no callbacks, no buttons, nothing
 * responds to a click (the `zero-interactivity` tests keep it that way). Under
 * `reduced`, motion is dropped and the same scene stands still.
 */

export interface FlowFloorLabels {
  ariaLabel: string;
  coordinator: string;
  dispatchLaw: string;
  parallel: string;
  units: string;
  repos: string;
  placed: string;
  worktree: string;
  ledger: string;
  receiving: string;
  dispatching: string;
  qaRole: string;
  prOpened: string;
  prToDev: string;
  prMergedToDev: string;
  promotePr: string;
  promoteMerged: string;
  inReview: string;
  rejected: string;
  fixing: string;
  reviewing: string;
  approved: string;
  caption: string;
  spec: string;
  mainBranch: string;
  conn: { dispatch: string; review: string; promote: string; reject: string };
  previousCycle: (merged: number, repos: number) => string;
}

export interface FlowFloorProps {
  facts: FlowFacts;
  scene: FlowState;
  labels: FlowFloorLabels;
  reduced?: boolean;
}

type Group = FlowState["groups"][number];
type Agent = Group["agents"][number];
type Gate = NonNullable<Group["qaGates"][number]>;

const LEDGER_RAMP: readonly StateKey[] = ["dispatched", "delivered", "verified", "merged"];

/** How full an agent's work bar reads at each phase. */
const PROGRESS: Record<AgentPhase, number> = {
  idle: 0,
  placed: 0.06,
  running: 0.66,
  delivered: 1,
  "in-review": 1,
  rejected: 1,
  fixing: 0.8,
  verified: 1,
  merged: 1,
};

/** Agent phases that map to a real ledger/session StateBadge. */
function badgeState(state: AgentPhase): StateKey | null {
  switch (state) {
    case "running":
    case "delivered":
    case "verified":
    case "merged":
      return state;
    case "rejected":
      return "failed";
    default:
      return null;
  }
}

/** The spec artifact exists once the agent has actually produced work (delivered onward). */
function specVisible(state: AgentPhase): boolean {
  return state !== "idle" && state !== "placed" && state !== "running";
}

/* --------------------------------------------------------------- connectors */

/**
 * A directional connector — the visible LINK between two nodes. A track with an
 * arrowhead pointing the way the artifact travels and, while its beat is
 * `active`, a pulse running along it (that motion IS the communication
 * happening). Horizontal on wide screens, vertical on phones. Decorative on its
 * own — the labelled nodes it joins carry the state — so `aria-hidden`. Nothing
 * here translates neighbours or changes layout, so it can never push a badge.
 */
const TONE_LINE: Record<string, string> = {
  brand: "bg-brand/45",
  delivered: "bg-state-delivered/55",
  verified: "bg-state-verified/55",
  failed: "bg-state-failed/70",
};
const TONE_DOT: Record<string, string> = {
  brand: "bg-brand",
  delivered: "bg-state-delivered",
  verified: "bg-state-verified",
  failed: "bg-state-failed",
};
const TONE_TEXT: Record<string, string> = {
  brand: "text-brand",
  delivered: "text-state-delivered",
  verified: "text-state-verified",
  failed: "text-state-failed",
};

function Connector({
  tone,
  active,
  reduced,
  label,
  back,
  className = "",
}: {
  tone: keyof typeof TONE_LINE;
  active: boolean;
  reduced?: boolean;
  label?: string;
  /** Point the arrow backwards (right→left / bottom→top) — the rejection return. */
  back?: boolean;
  className?: string;
}) {
  const glyphH = back ? "◀" : "▶";
  const glyphV = back ? "▲" : "▼";
  const dim = active ? "opacity-100" : "opacity-25";
  const pulse = active && !reduced;
  return (
    <div aria-hidden="true" data-flow-conn={tone} className={`flex shrink-0 items-center justify-center ${className}`}>
      {/* horizontal (lg+) */}
      <div className={`hidden w-full flex-col items-center justify-center gap-0.5 lg:flex ${dim}`}>
        <div className="relative flex w-full items-center">
          {back ? <span className={`-mr-0.5 text-[10px] leading-none ${TONE_TEXT[tone]}`}>{glyphH}</span> : null}
          <div className="relative h-px flex-1">
            <div className={`absolute inset-0 ${TONE_LINE[tone]}`} />
            {pulse ? (
              <motion.span
                className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${TONE_DOT[tone]}`}
                style={{ boxShadow: "0 0 6px 1px currentColor" }}
                initial={false}
                animate={{ left: back ? ["100%", "0%"] : ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
          </div>
          {!back ? <span className={`-ml-0.5 text-[10px] leading-none ${TONE_TEXT[tone]}`}>{glyphH}</span> : null}
        </div>
        {label ? <span className={`whitespace-nowrap font-mono text-[8px] uppercase tracking-wide ${TONE_TEXT[tone]}`}>{label}</span> : null}
      </div>

      {/* vertical (< lg) */}
      <div className={`flex w-full items-center justify-center gap-1.5 py-0.5 lg:hidden ${dim}`}>
        <div className="relative flex h-6 flex-col items-center">
          {back ? <span className={`-mb-0.5 text-[10px] leading-none ${TONE_TEXT[tone]}`}>{glyphV}</span> : null}
          <div className="relative w-px flex-1">
            <div className={`absolute inset-0 ${TONE_LINE[tone]}`} />
            {pulse ? (
              <motion.span
                className={`absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${TONE_DOT[tone]}`}
                style={{ boxShadow: "0 0 6px 1px currentColor" }}
                initial={false}
                animate={{ top: back ? ["100%", "0%"] : ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
          </div>
          {!back ? <span className={`-mt-0.5 text-[10px] leading-none ${TONE_TEXT[tone]}`}>{glyphV}</span> : null}
        </div>
        {label ? <span className={`font-mono text-[8px] uppercase tracking-wide ${TONE_TEXT[tone]}`}>{label}</span> : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- motion presets */

// Entrances/exits only fade + shrink (scale ≤ 1) — never translate — so an
// animating element never reaches beyond its final box and can't overlap a
// neighbour mid-flight.
const NODE_ENTER = { opacity: 0, scale: 0.98 };
const NODE_SHOWN = { opacity: 1, scale: 1 };
const CHIP_ENTER = { opacity: 0, scale: 0.85 };
const CHIP_SHOWN = { opacity: 1, scale: 1 };

/* -------------------------------------------------------------------- the agent */

/**
 * One specialist, laid DOWN: identity on the left, the work it produces flowing
 * to the right — env → harness → work bar → its spec → its PR — so the eye reads
 * the decision advancing. The spec and PR are the agent's own artifacts, each
 * reached by an inline arrow (the specialist→spec and specialist→PR links). The
 * whole card turns red — a `failed` badge, then a `fixing` chip — when this is
 * the rejected agent, so which one bounced is legible without reading a word.
 */
function AgentCard({ agent, labels, reduced }: { agent: Agent; labels: FlowFloorLabels; reduced?: boolean }) {
  const badge = badgeState(agent.state);
  const target = PROGRESS[agent.state];
  const statusNote = agent.state === "in-review" ? labels.inReview : agent.state === "fixing" ? labels.fixing : null;
  const showSpec = specVisible(agent.state);
  const isFailing = agent.state === "rejected" || agent.state === "fixing";
  const frame = isFailing ? "border-state-failed/45 bg-state-failed/[0.06]" : "border-line-soft bg-surface-2/40";
  return (
    <motion.div
      data-flow-node="agent"
      className={`flex flex-col overflow-hidden rounded-lg border lg:flex-row lg:items-stretch ${frame}`}
      initial={reduced ? false : NODE_ENTER}
      animate={NODE_SHOWN}
      exit={reduced ? undefined : NODE_ENTER}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
    >
      {/* identity */}
      <div className="flex items-center gap-2 border-b border-line-soft/70 bg-surface-1/30 px-2.5 py-2 lg:w-[8.5rem] lg:shrink-0 lg:flex-col lg:items-start lg:justify-center lg:border-b-0 lg:border-r">
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 font-mono text-[10px] font-bold text-brand-strong"
          aria-hidden="true"
        >
          {agent.persona.charAt(0)}
        </span>
        <span className="min-w-0 font-mono text-[11.5px] leading-tight text-text">
          {agent.persona}
          <span className="block text-[9.5px] text-faint">{agent.role}</span>
        </span>
      </div>

      {/* content — flows right */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-mono text-[9.5px] text-faint">{agent.package}</span>
          <span className="font-mono text-[9.5px] text-faint">⌥ {labels.worktree}</span>
          <span className="font-mono text-[9.5px] text-brand-strong">
            {agent.envelope.harness} · {agent.envelope.tier}
          </span>
          <span className="ml-auto flex items-center gap-1.5" data-flow-badge>
            {badge ? (
              <StateBadge state={badge} size="sm" title={false} />
            ) : (
              <span className="rounded-full border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint">
                {statusNote ?? labels.placed}
              </span>
            )}
          </span>
        </div>

        {/* work bar */}
        <div className="h-1 overflow-hidden rounded-full bg-surface-3">
          <motion.div
            className={`h-full rounded-full ${isFailing ? "bg-state-failed" : "bg-brand"}`}
            initial={false}
            animate={{ width: `${Math.round(target * 100)}%` }}
            transition={reduced ? { duration: 0 } : { duration: agent.state === "running" ? 3 : 0.5, ease: "easeOut" }}
          />
        </div>

        {/* the agent's own artifacts: → spec → PR, each reached by a drawn arrow */}
        <div className="flex min-h-[1.15rem] flex-wrap items-center gap-1">
          <AnimatePresence initial={false}>
            {showSpec ? (
              <motion.span key="arrow-spec" aria-hidden="true" className="font-mono text-[10px] text-state-delivered" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                ▸
              </motion.span>
            ) : null}
            {showSpec ? (
              <motion.span
                key="spec"
                data-flow-badge
                className="inline-flex items-center gap-1 rounded-md border border-state-delivered/40 bg-state-delivered/10 px-1.5 py-0.5 font-mono text-[10px] text-state-delivered"
                initial={reduced ? false : CHIP_ENTER}
                animate={CHIP_SHOWN}
                exit={reduced ? undefined : CHIP_ENTER}
                transition={reduced ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
              >
                <span aria-hidden="true">✎</span>
                {labels.spec}
              </motion.span>
            ) : null}
            {agent.prDevVisible ? (
              <motion.span key="arrow-pr" aria-hidden="true" className="font-mono text-[10px] text-state-delivered" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                ▸
              </motion.span>
            ) : null}
            {agent.prDevVisible ? (
              <motion.span
                key="pr"
                data-flow-badge
                className="inline-flex items-center gap-1 rounded-md border border-state-delivered/40 bg-state-delivered/10 px-1.5 py-0.5 font-mono text-[10px] text-state-delivered"
                initial={reduced ? false : CHIP_ENTER}
                animate={CHIP_SHOWN}
                exit={reduced ? undefined : CHIP_ENTER}
                transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              >
                <span aria-hidden="true">▽</span>
                {labels.prToDev} #{agent.pr}
                {agent.prDevMerged ? <span className="text-state-merged"> · {labels.prMergedToDev}</span> : null}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------- the QA */

const QA_VERDICT_CLASS: Record<"reviewing" | "rejected" | "approved", string> = {
  reviewing: "border-line bg-surface-2 text-faint",
  rejected: "border-state-failed/40 bg-state-failed/10 text-state-failed",
  approved: "border-state-verified/40 bg-state-verified/10 text-state-verified",
};

/**
 * A delivery's QA gate. One per running unit — the same repo persona can appear
 * in more than one gate, which is exactly the real rule. Until the gate enters
 * (qa-review) the cell shows a faint waiting station, so the slot is reserved
 * and the real gate fades in without shifting anything.
 */
function QaCell({ gate, labels, reduced }: { gate: Gate | null; labels: FlowFloorLabels; reduced?: boolean }) {
  if (!gate) {
    return (
      <div
        data-flow-node="qa"
        aria-hidden="true"
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-line-soft bg-surface-1/20 px-2.5 py-2 font-mono text-[9.5px] text-faint/70 lg:flex-col lg:items-start lg:justify-center"
      >
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-line-soft text-faint/60">◷</span>
        {labels.qaRole}
      </div>
    );
  }
  const verdictLabel = gate.verdict === "reviewing" ? labels.reviewing : gate.verdict === "rejected" ? labels.rejected : labels.approved;
  return (
    <motion.div
      data-flow-node="qa"
      className="flex flex-col justify-center gap-1 rounded-lg border border-state-verified/40 bg-state-verified/[0.07] px-2.5 py-2"
      initial={reduced ? false : NODE_ENTER}
      animate={NODE_SHOWN}
      exit={reduced ? undefined : NODE_ENTER}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-state-verified/15 font-mono text-[10px] font-bold text-state-verified"
          aria-hidden="true"
        >
          {gate.persona.charAt(0)}
        </span>
        <span className="min-w-0 font-mono text-[11px] leading-tight text-text">
          {gate.persona}
          <span className="block text-[9px] text-faint">{labels.qaRole}</span>
        </span>
      </div>
      <span className="font-mono text-[8.5px] leading-tight text-brand-strong">
        {gate.envelope.harness} · {gate.envelope.tier}
      </span>
      <span data-flow-badge className={`w-fit rounded-full border px-1.5 py-0.5 font-mono text-[10px] ${QA_VERDICT_CLASS[gate.verdict]}`}>
        {verdictLabel}
      </span>
    </motion.div>
  );
}

/* --------------------------------------------------------------- the main node */

/** The repo's `main` — where its single promotion PR lands. Reserved as the
 *  lane's right terminus from the first frame; the promotion chip enters at its
 *  own beat, fading into the slot that was already there. */
function MainNode({ group, labels, reduced }: { group: Group; labels: FlowFloorLabels; reduced?: boolean }) {
  const { promotion } = group;
  return (
    <div data-flow-node="main" className="flex flex-col justify-center gap-1.5 rounded-lg border border-brand/30 bg-brand/[0.05] px-2.5 py-2">
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-brand-strong">
        <span aria-hidden="true">⬢</span>
        {labels.mainBranch}
      </span>
      <AnimatePresence initial={false}>
        {promotion.visible ? (
          <motion.span
            key="promo"
            data-flow-badge
            className="inline-flex w-fit items-center gap-1 rounded-md border border-brand/40 bg-brand/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-brand-strong"
            initial={reduced ? false : CHIP_ENTER}
            animate={CHIP_SHOWN}
            exit={reduced ? undefined : CHIP_ENTER}
            transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
          >
            <span aria-hidden="true">⇢</span>
            {labels.promotePr} #{promotion.number}
          </motion.span>
        ) : null}
        {promotion.merged ? (
          <motion.span key="merged" data-flow-badge className="w-fit font-mono text-[9.5px] text-state-merged" initial={reduced ? false : CHIP_ENTER} animate={CHIP_SHOWN} transition={reduced ? { duration: 0 } : { duration: 0.3 }}>
            {labels.promoteMerged}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------- the lane */

/**
 * One repo. Each running unit is a row that flows left→right: specialist →
 * (review) → its own QA gate. The QA / promote / main columns are RESERVED from
 * the first frame (via the grid template), so artifacts fade into place instead
 * of shoving their neighbours. The promotion → main terminus spans the lane's
 * rows on the right (desktop) / sits at the foot (mobile).
 */
function Lane({ group, facts, scene, labels, reduced }: { group: Group; facts: FlowFacts; scene: FlowState; labels: FlowFloorLabels; reduced?: boolean }) {
  const p = scene.phase;
  const reviewActive = p === "pr-dev" || p === "qa-review" || p === "qa-approve" || p === "merge-dev";
  const promoteActive = p === "merge-dev" || p === "promote" || p === "merge-main";
  const isRejecting = (agentId: string) => agentId === facts.rejectedAgentId && (p === "qa-reject" || p === "dev-fix");

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-line-soft bg-surface-1/40 p-2.5">
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true" className="text-faint">▸</span>
        <span className="truncate font-mono text-[11px] font-semibold text-brand-strong">{group.repo}</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 lg:gap-x-0 lg:gap-y-2 lg:[grid-template-columns:minmax(0,1fr)_3.75rem_8.5rem_3.75rem_8rem]">
        {group.agents.map((agent, i) => {
          const gate = group.qaGates[i] ?? null;
          const rejecting = isRejecting(agent.id);
          return (
            <div key={agent.id} className="contents">
              <div className="lg:col-start-1">
                <AgentCard agent={agent} labels={labels} reduced={reduced} />
              </div>
              <Connector
                tone={rejecting ? "failed" : "delivered"}
                active={reviewActive || rejecting}
                back={rejecting}
                reduced={reduced}
                label={rejecting ? labels.conn.reject : labels.conn.review}
                className="lg:col-start-2"
              />
              <div className="lg:col-start-3">
                <QaCell gate={gate} labels={labels} reduced={reduced} />
              </div>
            </div>
          );
        })}

        {/* promotion → main: one per repo, spanning the lane's delivery rows. */}
        <Connector tone="brand" active={promoteActive} reduced={reduced} label={labels.conn.promote} className="lg:col-start-4 lg:row-[1/-1]" />
        <div className="lg:col-start-5 lg:row-[1/-1]">
          <MainNode group={group} labels={labels} reduced={reduced} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- the floor */

export default function FlowFloor({ facts, scene, labels, reduced }: FlowFloorProps) {
  const dispatchActive =
    scene.phase === "dispatch-1" || scene.phase === "dispatch-2" || scene.phase === "dispatch-3" || scene.phase === "work";
  const anyAgentVisible = scene.groups.length > 0;

  return (
    <div role="img" aria-label={labels.ariaLabel} className="flex flex-col">
      {/* Header: the coordinator, the journey, the LAW's real verdict, and what the previous cycle closed with. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line-soft bg-surface-2/40 px-3.5 py-2.5">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="text-brand">◆</span>
          <span className="font-mono text-[11px] text-text">{facts.coordinator}</span>
          <span className="font-mono text-[10px] text-faint">· {labels.coordinator}</span>
        </span>
        <span className="font-mono text-[10px] text-faint">{facts.journey}</span>
        {scene.validated ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-state-verified/40 bg-state-verified/10 px-2 py-0.5">
            <span aria-hidden="true" className="text-state-verified">✓</span>
            <span className="font-mono text-[10px] text-state-verified">
              {labels.dispatchLaw}: {labels.parallel} · {scene.verdict.batch} {labels.units} · {scene.verdict.repos} {labels.repos}
            </span>
          </span>
        ) : null}
        {scene.previousCycle ? (
          <span className="ml-auto font-mono text-[9.5px] text-faint">
            {labels.previousCycle(scene.previousCycle.merged, scene.previousCycle.repos)}
          </span>
        ) : null}
      </div>

      {/* The assembly line: coordinator (left, spans the lane rows) → dispatch bus → repo lanes. */}
      <div className="p-3.5 lg:p-4">
        {scene.validated ? (
          anyAgentVisible ? (
            <div className="grid grid-cols-1 gap-3 lg:gap-x-0 lg:gap-y-4 lg:[grid-template-columns:auto_3.5rem_minmax(0,1fr)]">
              {/* Coordinator core — one node feeding every lane; spans all lane rows on desktop. */}
              <div
                data-flow-node="coord"
                className="flex items-center gap-2 self-start rounded-xl border border-brand/40 bg-brand/[0.06] px-3 py-2.5 lg:col-start-1 lg:row-[1/-1] lg:flex-col lg:justify-center lg:self-center lg:text-center"
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand/50 bg-brand/15 text-brand-strong ${reduced ? "" : "animate-pulse-soft"}`}
                >
                  ◆
                </span>
                <span className="font-mono text-[11px] text-text lg:mt-1.5">{facts.coordinator}</span>
                <span className="font-mono text-[9.5px] text-faint lg:-mt-0.5">{labels.coordinator}</span>
              </div>

              {/* For each lane: a dispatch connector (the fan-out bus branch) + the lane itself. */}
              {scene.groups.map((group) => (
                <FlowLaneRow key={group.repo} group={group} facts={facts} scene={scene} labels={labels} reduced={reduced} dispatchActive={dispatchActive} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2 font-mono text-[11px] text-faint">
              <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full bg-brand ${reduced ? "" : "animate-pulse"}`} />
              {labels.dispatching}
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 py-2 font-mono text-[11px] text-faint">
            <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full bg-brand ${reduced ? "" : "animate-pulse"}`} />
            {labels.receiving}
          </div>
        )}
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
                {i < LEDGER_RAMP.length - 1 ? <span aria-hidden="true" className="text-[10px] text-faint">→</span> : null}
              </span>
            );
          })}
        </div>
      </div>

      {/* One short caption for the current beat — a label, never a paragraph. */}
      <div className="border-t border-line-soft bg-surface-2/40 px-3.5 py-2.5">
        <p data-flow-caption className="flex items-center gap-2 font-mono text-[12px] text-text">
          <span aria-hidden="true" className="text-brand">▸</span>
          {labels.caption}
        </p>
      </div>
    </div>
  );
}

/**
 * A lane and the dispatch connector that feeds it — two grid cells (bus branch
 * in column 2, lane in column 3) so the branch aligns to its lane row with no
 * measuring. Across rows the branches read as one fan-out from the coordinator.
 * On mobile the two stack (a down arrow, then the lane).
 */
function FlowLaneRow({
  group,
  facts,
  scene,
  labels,
  reduced,
  dispatchActive,
}: {
  group: Group;
  facts: FlowFacts;
  scene: FlowState;
  labels: FlowFloorLabels;
  reduced?: boolean;
  dispatchActive: boolean;
}) {
  return (
    <>
      <Connector tone="brand" active={dispatchActive} reduced={reduced} label={labels.conn.dispatch} className="lg:col-start-2 lg:self-stretch" />
      <div className="lg:col-start-3">
        <Lane group={group} facts={facts} scene={scene} labels={labels} reduced={reduced} />
      </div>
    </>
  );
}
