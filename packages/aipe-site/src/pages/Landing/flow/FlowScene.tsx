import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n";
import { useInView } from "../../../lib/useInView";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import FlowFloor, { type FlowFloorLabels } from "./FlowFloor";
import FlowTerminal from "./FlowTerminal";
import {
  buildFlowFacts,
  buildFlowTerminal,
  foldFlow,
  summarizeCycle,
  FLOW_PHASES,
  FLOW_PHASE_IDS,
  FLOW_LAST_PHASE,
  type FlowCarry,
} from "./flowModel";

/**
 * The ambient orchestrator — the ONLY stateful piece, and it holds no controls.
 * It owns a looping clock that advances one phase per dwell, folds the phase into
 * a `FlowState`, and stacks the informative floor ABOVE the terminal log in one
 * card. There is no play/pause, no scrub, and nothing is clickable: the scene
 * runs on its own and the visitor watches.
 *
 * The clock is paused when the scene is off-screen or the tab is hidden (no wasted
 * frames), and it never starts under `prefers-reduced-motion` — there the scene
 * opens on the folded LAST phase, a complete still frame with the same information.
 *
 * v4 — "no reset seco": earlier versions remounted the whole card on every loop
 * (a `key={cycle}` on the wrapper), which tore down and rebuilt every row and
 * replayed every entrance animation from an empty frame — exactly the abrupt
 * wipe the PE flagged as reading like a bug. This version keeps `FlowFloor`/
 * `FlowTerminal` mounted across cycles (rows animate OUT via `AnimatePresence`
 * inside `FlowFloor` instead of vanishing), and carries a `FlowCarry` summary
 * of what the JUST-FINISHED cycle closed with into the next cycle's opening
 * frame (`FlowState.previousCycle`) — so the first frame after a loop is
 * provably not the same blank picture the very first cycle opened on.
 */
export default function FlowScene() {
  const { t } = useI18n();
  const f = t.flow;
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  const facts = useMemo(() => buildFlowFacts(), []);
  const allLines = useMemo(() => buildFlowTerminal(facts, f.script), [facts, f.script]);

  // Reduced motion opens on the complete, settled frame; otherwise from the top.
  const [phaseIndex, setPhaseIndex] = useState(() => (reduced ? FLOW_LAST_PHASE : 0));
  // What the previous cycle closed with — null until the first loop completes.
  const [previousCycle, setPreviousCycle] = useState<FlowCarry | null>(null);

  useEffect(() => {
    if (reduced) setPhaseIndex(FLOW_LAST_PHASE);
  }, [reduced]);

  // Pause the clock when the tab is hidden.
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const scene = useMemo(() => foldFlow(phaseIndex, facts, previousCycle), [phaseIndex, facts, previousCycle]);

  // The looping clock: one phase per dwell. Wrapping from the settled hold
  // carries this cycle's summary forward before resetting the phase index —
  // the floor/terminal stay mounted throughout, so nothing is torn down.
  useEffect(() => {
    if (reduced || !inView || !tabVisible) return;
    const dwell = FLOW_PHASES[phaseIndex]?.ms ?? 2000;
    const id = window.setTimeout(() => {
      setPhaseIndex((n) => {
        if (n >= FLOW_LAST_PHASE) {
          setPreviousCycle(summarizeCycle(scene));
          return 0;
        }
        return n + 1;
      });
    }, dwell);
    return () => window.clearTimeout(id);
  }, [phaseIndex, reduced, inView, tabVisible, scene]);

  const revealedLines = useMemo(() => {
    const order = FLOW_PHASE_IDS.indexOf(scene.phase);
    return allLines.filter((l) => FLOW_PHASE_IDS.indexOf(l.phase) <= order);
  }, [allLines, scene.phase]);

  const labels: FlowFloorLabels = {
    ariaLabel: f.aria.label,
    coordinator: f.labels.coordinator,
    dispatchLaw: f.labels.dispatchLaw,
    parallel: f.labels.parallel,
    units: f.labels.units,
    repos: f.labels.repos,
    placed: f.labels.placed,
    worktree: f.labels.worktree,
    ledger: f.labels.ledger,
    receiving: f.labels.receiving,
    dispatching: f.labels.dispatching,
    qaRole: f.labels.qaRole,
    prOpened: f.labels.prOpened,
    prToDev: f.labels.prToDev,
    prMergedToDev: f.labels.prMergedToDev,
    promotePr: f.labels.promotePr,
    promoteMerged: f.labels.promoteMerged,
    inReview: f.labels.inReview,
    rejected: f.labels.rejected,
    fixing: f.labels.fixing,
    reviewing: f.labels.reviewing,
    approved: f.labels.approved,
    caption: f.captions[scene.captionKey],
    previousCycle: f.previousCycle,
  };

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-surface-1">
      <FlowFloor facts={facts} scene={scene} labels={labels} reduced={reduced} />
      <FlowTerminal header={f.terminalHeader} lines={revealedLines} reduced={reduced} />
    </div>
  );
}
