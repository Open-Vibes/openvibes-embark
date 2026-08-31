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
  /** The amber "it is happening right now" marker (item 1). Never carried by
   *  colour alone — this label rides with the `--st-running` amber everywhere a
   *  unit or gate is actively working. */
  inProgress: string;
  caption: string;
  spec: string;
  mainBranch: string;
  /** The law's serialize half, shown beside the parallel verdict (SERIALIZE fix). */
  lawSerial: string;
  /** The reject→fix loop read as the same serialize principle at the unit scale. */
  serial: string;
  /** "→ <repo>" prefix for the destination node that both cards point at (item 3). */
  landsIn: string;
  // The PE's flowchart form (v4).
  pe: string;
  peTasks: (n: number) => string;
  classifyDispatch: (n: number) => string;
  taskWord: string;
  reprovedQ: string;
  answerNo: string;
  answerYes: string;
  adjustAfterRequest: string;
  prDevSection: string;
  prMainSection: string;
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

/**
 * Item 1 — "em andamento". A unit is IN PROGRESS when work is actively advancing
 * on it at this beat: a dev coding (`running`) or a dev re-working a bounce
 * (`fixing`). This is the moment the PE wanted flagged amber, in ANY step. It is
 * deliberately distinct from `rejected` (a stop — red `--st-failed`) and from a
 * resting state (delivered/verified/merged awaiting the next hand-off).
 *
 * The amber comes from `--st-running` — the palette's canonical "the session is
 * alive / running" token — NOT from `--st-escalated`, the amber reserved for the
 * gate/escalation elsewhere in the system. Using the running token keeps the two
 * ambers semantically apart (progress ≠ escalation) and never invents a colour.
 * The state stays legible without the colour: an `in progress` label always rides
 * with it (see `InProgressPill`).
 */
function agentInProgress(state: AgentPhase): boolean {
  return state === "running" || state === "fixing";
}

/** The amber, labelled, pulsing "in progress" marker — colour + glyph + word, so
 *  the state never depends on hue alone. `reduced` drops only the pulse. */
function InProgressPill({ label, reduced }: { label: string; reduced?: boolean }) {
  return (
    <span
      data-flow-inprogress
      className="inline-flex items-center gap-1 rounded-full border border-state-running/50 bg-state-running/10 px-1.5 py-0.5 font-mono text-[10px] text-state-running"
    >
      <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full bg-state-running ${reduced ? "" : "animate-pulse"}`} />
      {label}
    </span>
  );
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
  running: "bg-state-running/60",
};
const TONE_DOT: Record<string, string> = {
  brand: "bg-brand",
  delivered: "bg-state-delivered",
  verified: "bg-state-verified",
  failed: "bg-state-failed",
  running: "bg-state-running",
};
const TONE_TEXT: Record<string, string> = {
  brand: "text-brand",
  delivered: "text-state-delivered",
  verified: "text-state-verified",
  failed: "text-state-failed",
  running: "text-state-running",
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
  const showSpec = specVisible(agent.state);
  // A bounce is a STOP (red); actively working is IN PROGRESS (amber) — item 1.
  const isRejected = agent.state === "rejected";
  const inProgress = agentInProgress(agent.state);
  const statusNote = agent.state === "in-review" ? labels.inReview : null;
  const frame = isRejected
    ? "border-state-failed/45 bg-state-failed/[0.06]"
    : inProgress
      ? "border-state-running/45 bg-state-running/[0.07]"
      : "border-line-soft bg-surface-2/40";
  const barColor = isRejected ? "bg-state-failed" : inProgress ? "bg-state-running" : "bg-brand";
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
            {inProgress ? (
              <>
                <InProgressPill label={labels.inProgress} reduced={reduced} />
                {agent.state === "fixing" ? <span className="font-mono text-[9.5px] text-state-running/80">{labels.fixing}</span> : null}
              </>
            ) : badge ? (
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
            className={`h-full rounded-full ${barColor}`}
            initial={false}
            animate={{ width: `${Math.round(target * 100)}%` }}
            transition={reduced ? { duration: 0 } : { duration: agent.state === "running" ? 3 : 0.5, ease: "easeOut" }}
          />
        </div>

        {/* the agent's own artifacts: → spec → PR, each reached by a drawn arrow */}
        <div className="flex min-h-[1.15rem] flex-wrap items-center gap-1">
          {isRejected || agent.state === "fixing" ? (
            <span data-flow-serial className="inline-flex items-center gap-1 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-faint" title={labels.lawSerial}>
              <span aria-hidden="true">⧗</span>
              {labels.serial}
            </span>
          ) : null}
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

// `reviewing` is a gate WORKING right now → the same amber `--st-running`
// in-progress language as a coding/fixing dev (item 1). `rejected`/`approved`
// are settled verdicts (red / green).
const QA_VERDICT_CLASS: Record<"reviewing" | "rejected" | "approved", string> = {
  reviewing: "border-state-running/50 bg-state-running/10 text-state-running",
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
      <span data-flow-badge className={`flex w-fit items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[10px] ${QA_VERDICT_CLASS[gate.verdict]}`}>
        {gate.verdict === "reviewing" ? (
          <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full bg-state-running ${reduced ? "" : "animate-pulse"}`} />
        ) : null}
        {verdictLabel}
      </span>
    </motion.div>
  );
}

/* --------------------------------------------- the repo as a place (v4 #2) */

/**
 * The PE wants the repository as a CONTAINER, not a destination: one box that
 * HOLDS `PR DEV` and `PR MAIN` as two stacked sections, and the same-repo lanes
 * converge INTO it. The unit branches land inside the `PR DEV` section (derived,
 * distinct per unit — the old two-arrow answer, in the form he asked for); the
 * `dev → main` promotion is the `PR MAIN` section — the two distinct PRs, now as
 * two rooms of one repo. Sections dim until their beat, so nothing reflows.
 */
function RepoContainer({ group, labels, reduced }: { group: Group; labels: FlowFloorLabels; reduced?: boolean }) {
  const { promotion } = group;
  const devLit = group.agents.some((a) => a.prDevVisible);
  return (
    <div data-flow-node="repo" className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-brand/45 bg-brand/[0.04]">
      <div className="flex items-center gap-1.5 border-b border-brand/25 bg-brand/[0.06] px-2.5 py-1 font-mono text-[10.5px] font-semibold text-brand-strong">
        <span aria-hidden="true">⬢</span>
        <span className="min-w-0 break-all">{group.repo}</span>
      </div>

      {/* PR DEV — the branches land here (item 3, now inside the container) */}
      <div className={`border-b border-brand/20 px-2.5 py-1.5 ${devLit ? "" : "opacity-40"}`}>
        <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-state-delivered">{labels.prDevSection}</span>
        <div className="mt-0.5 flex flex-col gap-0.5">
          {group.agents.map((a) => (
            <span
              key={a.id}
              data-flow-branch
              className={`min-w-0 break-all font-mono text-[8px] leading-tight ${a.prDevMerged ? "text-state-verified" : a.prDevVisible ? "text-state-running" : "text-faint"}`}
            >
              {a.branch}
              {a.prDevMerged ? <span className="text-state-verified"> ✓</span> : null}
            </span>
          ))}
        </div>
      </div>

      {/* PR MAIN — the promotion is the container's second section */}
      <div className={`px-2.5 py-1.5 ${promotion.visible ? "" : "opacity-40"}`}>
        <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-brand-strong">
          {labels.prMainSection}
          {promotion.visible ? <span className="ml-1 text-brand-strong">#{promotion.number}</span> : null}
        </span>
        {promotion.merged ? <span className="mt-0.5 block font-mono text-[8px] text-state-merged">✓ {labels.promoteMerged}</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- the origin: PE + coord */

/** The PE, the ORIGIN of the flow (v4 #3) — the scene begins with them, not the
 *  coordinator. The tasks count is derived (Tasks 1–N). */
function PENode({ facts, labels }: { facts: FlowFacts; labels: FlowFloorLabels }) {
  return (
    <div data-flow-node="pe" className="flex flex-col items-center justify-center gap-1 rounded-xl border border-line bg-surface-2/50 px-3 py-2.5 text-center">
      <span className="font-mono text-[8.5px] uppercase tracking-wide text-faint">{labels.peTasks(facts.agents.length)}</span>
      <span className="font-mono text-[11px] font-semibold text-text">{labels.pe}</span>
    </div>
  );
}

/** The coordinator — classifies and dispatches the tasks the PE handed over. */
function CoordNode({ facts, labels, reduced }: { facts: FlowFacts; labels: FlowFloorLabels; reduced?: boolean }) {
  return (
    <div
      data-flow-node="coord"
      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-brand/40 bg-brand/[0.06] px-3 py-2.5 text-center"
    >
      <span aria-hidden="true" className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand/50 bg-brand/15 text-brand-strong ${reduced ? "" : "animate-pulse-soft"}`}>
        ◆
      </span>
      <span className="font-mono text-[10.5px] text-text">{facts.coordinator}</span>
      <span className="max-w-[7.5rem] font-mono text-[8px] leading-tight text-faint">{labels.classifyDispatch(facts.agents.length)}</span>
    </div>
  );
}

/* ------------------------------------------------------- one repo's task lanes */

/**
 * One repo's task lanes — expressed as SCENE, not diagram (v4 read: the PE wanted
 * the idea of his sketch animated, not the sketch transcribed). No labelled arcs,
 * no decision captions: each task flows `dev → QA` and the story is told by
 * MOVEMENT and colour. Rejection isn't a drawn return arc — it HAPPENS: the card
 * reddens, and the work travels BACK to the dev (a backwards pulse on the same
 * path), who turns amber and resumes. The lanes of one repo land in the one repo
 * place (`row-[1/-1]`). What the boxes carry is identity and live state; what the
 * connectors carry is motion.
 */
function GroupBlock({ group, facts, scene, labels, reduced }: { group: Group; facts: FlowFacts; scene: FlowState; labels: FlowFloorLabels; reduced?: boolean }) {
  const p = scene.phase;
  const flowActive = p === "pr-dev" || p === "qa-review" || p === "qa-approve" || p === "merge-dev";

  return (
    <div className="grid grid-cols-1 gap-2 lg:gap-x-0 lg:gap-y-2 lg:[grid-template-columns:minmax(0,1fr)_2.25rem_minmax(6.5rem,8.5rem)]">
      {group.agents.map((agent, i) => {
        const gate = group.qaGates[i] ?? null;
        const isRejectedLane = agent.id === facts.rejectedAgentId;
        const rejecting = isRejectedLane && p === "qa-reject"; // the bounce: red, travelling back
        const fixing = isRejectedLane && p === "dev-fix"; // the rework: amber, still on the return path
        const returning = rejecting || fixing;
        return (
          <div key={agent.id} className="contents">
            {/* the lane: the owner, their work, their QA — flowing left→right */}
            <div className="min-w-0 rounded-2xl border border-line-soft/70 bg-surface-1/30 p-2 lg:col-start-1">
              <span className="mb-1 block truncate font-mono text-[8.5px] uppercase tracking-wide text-faint">
                {agent.persona} · {agent.repo}
              </span>
              <div className="flex flex-col gap-1.5 lg:flex-row lg:items-stretch">
                <div className="min-w-0 flex-1">
                  <AgentCard agent={agent} labels={labels} reduced={reduced} />
                </div>
                {/* dev ↔ QA: forward while under review, and a RED pulse travelling
                    BACK to the dev the moment it is rejected — the motion IS the decision. */}
                <Connector
                  tone={rejecting ? "failed" : fixing ? "running" : "delivered"}
                  active={flowActive || returning}
                  back={returning}
                  reduced={reduced}
                  className="lg:w-16 lg:shrink-0"
                />
                <div className="lg:w-[8.5rem] lg:shrink-0">
                  <QaCell gate={gate} labels={labels} reduced={reduced} />
                </div>
              </div>
            </div>

            {/* the lane lands in the repo place — a pulse travelling in as it merges */}
            <Connector
              tone={agent.prDevMerged ? "verified" : "running"}
              active={agent.prDevVisible && !agent.prDevMerged}
              reduced={reduced}
              className="lg:col-start-2"
            />
          </div>
        );
      })}

      {/* the repo: one place the lanes land in */}
      <div className="lg:col-start-3 lg:row-[1/-1] lg:self-stretch">
        <RepoContainer group={group} labels={labels} reduced={reduced} />
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
      {/* Header: the journey + the LAW's real verdict (both halves). The coordinator
          is now a NODE in the flow (the PE's form), not a header label. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line-soft bg-surface-2/40 px-3.5 py-2.5">
        <span className="font-mono text-[10px] text-faint">{facts.journey}</span>
        {scene.validated ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-state-verified/40 bg-state-verified/10 px-2 py-0.5">
            <span aria-hidden="true" className="text-state-verified">✓</span>
            <span className="font-mono text-[10px] text-state-verified">
              {labels.dispatchLaw}: {labels.parallel} · {scene.verdict.batch} {labels.units} · {scene.verdict.repos} {labels.repos}
            </span>
          </span>
        ) : null}
        {/* the law's OTHER half, so the scene teaches the whole rule, not the parallel half only */}
        {scene.validated ? <span className="font-mono text-[9.5px] text-faint">· {labels.lawSerial}</span> : null}
      </div>

      {/* The PE's flowchart: PE (origin) → coordinator → per-task lanes → repo containers. */}
      <div className="p-3.5 lg:p-4">
        <div className="grid grid-cols-1 gap-3 lg:gap-x-0 lg:gap-y-4 lg:items-stretch lg:[grid-template-columns:auto_2.5rem_auto_2.75rem_minmax(0,1fr)]">
          {/* PE — the origin */}
          <div className="lg:col-start-1 lg:row-[1/-1] lg:self-center">
            <PENode facts={facts} labels={labels} />
          </div>
          <Connector tone="brand" active reduced={reduced} className="lg:col-start-2 lg:row-[1/-1] lg:self-stretch" />
          {/* Coordinator — classifies & dispatches */}
          <div className="lg:col-start-3 lg:row-[1/-1] lg:self-center">
            <CoordNode facts={facts} labels={labels} reduced={reduced} />
          </div>
          <Connector tone="brand" active={dispatchActive} reduced={reduced} className="lg:col-start-4 lg:row-[1/-1] lg:self-stretch" />
          {/* The task lanes, grouped by repo; each repo is a container the lanes land in. */}
          <div className="flex min-w-0 flex-col justify-center gap-3 lg:col-start-5 lg:gap-4">
            {anyAgentVisible ? (
              scene.groups.map((group) => (
                <GroupBlock key={group.repo} group={group} facts={facts} scene={scene} labels={labels} reduced={reduced} />
              ))
            ) : (
              <div className="flex items-center gap-2 py-2 font-mono text-[11px] text-faint">
                <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full bg-brand ${reduced ? "" : "animate-pulse"}`} />
                {scene.validated ? labels.dispatching : labels.receiving}
              </div>
            )}
          </div>
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
