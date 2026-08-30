import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../../../i18n";
import { useInView } from "../../../lib/useInView";
import { useReducedMotion } from "../../../lib/useReducedMotion";
import FlowFloor, { type FlowFloorLabels } from "./FlowFloor";
import FlowTerminal from "./FlowTerminal";
import {
  buildFlowFacts,
  buildFlowTerminal,
  foldFlow,
  FLOW_PHASES,
  FLOW_PHASE_IDS,
  FLOW_LAST_PHASE,
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
  // Bumped each time the loop wraps, so the whole card crossfades on restart.
  const [cycle, setCycle] = useState(0);

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

  // The looping clock: one phase per dwell; wrapping from the settled hold back
  // to the demand triggers a crossfade (the "gentle fade-reset").
  useEffect(() => {
    if (reduced || !inView || !tabVisible) return;
    const dwell = FLOW_PHASES[phaseIndex]?.ms ?? 2000;
    const id = window.setTimeout(() => {
      setPhaseIndex((n) => {
        if (n >= FLOW_LAST_PHASE) {
          setCycle((c) => c + 1);
          return 0;
        }
        return n + 1;
      });
    }, dwell);
    return () => window.clearTimeout(id);
  }, [phaseIndex, reduced, inView, tabVisible]);

  const scene = useMemo(() => foldFlow(phaseIndex, facts), [phaseIndex, facts]);

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
    wave: f.labels.wave,
    placed: f.labels.placed,
    running: f.labels.running,
    worktree: f.labels.worktree,
    ledger: f.labels.ledger,
    receiving: f.labels.receiving,
    caption: f.captions[scene.captionKey],
  };

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-surface-1">
      <motion.div
        key={cycle}
        initial={reduced ? false : { opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
      >
        <FlowFloor facts={facts} scene={scene} labels={labels} reduced={reduced} />
        <FlowTerminal header={f.terminalHeader} lines={revealedLines} reduced={reduced} />
      </motion.div>
    </div>
  );
}
