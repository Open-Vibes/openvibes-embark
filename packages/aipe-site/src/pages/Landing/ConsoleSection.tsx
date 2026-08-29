import Section from "../../components/Section";
import ConsoleScene from "./console/ConsoleScene";
import { GLOSSARY_TERMS } from "./console/consoleScript";
import { useI18n } from "../../i18n";

/**
 * The Console gets its own near-full-viewport section (round 3): the terminal and
 * the stage each need room for the dispatch → wave → gate execution to read without
 * squinting. It is the same two synchronised panes from round 2 — this is scale and
 * legibility, not a rebuild. At small viewports the panes stack (see `ConsoleScene`).
 *
 * Beneath it sits a plain-language key: every AIPe noun the stage prints as a label
 * gets one short definition, so a reader with no AIPe vocabulary can follow the
 * console. It is deliberately a static reference below the scene, not more text on
 * the stage — the stage stays one short caption per beat (round 2's hard-won rule).
 */
const STEPS = GLOSSARY_TERMS.filter((term) => term.kind === "step");
const CONCEPTS = GLOSSARY_TERMS.filter((term) => term.kind !== "step");

export default function ConsoleSection() {
  const { t } = useI18n();
  const g = t.console.glossary;
  const f = t.console.flow;
  return (
    <Section
      id="console"
      eyebrow={t.console.section.eyebrow}
      title={t.console.section.title}
      lead={t.console.section.lead}
      className="bg-surface-1/30"
    >
      <ConsoleScene />

      <div className="mt-6 rounded-2xl border border-line-soft bg-surface-1/50 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{g.title}</p>
          <p className="font-sans text-[11px] text-faint">{f.legend}</p>
        </div>

        {/* The stages, numbered in the order they happen. */}
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-brand">{f.stepsTitle}</p>
        <ol className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((term) => (
            <li key={term.key} className="flex gap-3">
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/12 font-mono text-[12px] font-semibold text-brand tabular-nums"
                aria-hidden="true"
              >
                {term.order}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-mono text-[12px] font-semibold text-brand">
                  {term.label}
                  {"loops" in term && term.loops ? (
                    <span className="text-state-running" title={f.loopNote} aria-label={f.loop}>
                      ↺
                    </span>
                  ) : null}
                </p>
                <p className="text-[13px] leading-snug text-muted">{g[term.key]}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-2.5 flex items-center gap-1.5 pl-9 font-sans text-[11px] text-faint">
          <span aria-hidden="true" className="text-state-running">↺</span>
          {f.loopNote}
        </p>

        {/* The concepts — decisions and things that attach to a stage, not stages. */}
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{f.conceptsTitle}</p>
        <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((term) => (
            <div key={term.key} className="flex gap-3">
              <span className="mt-0.5 select-none font-mono text-[13px] text-faint" aria-hidden="true">—</span>
              <div className="min-w-0">
                <dt className="flex flex-wrap items-baseline gap-x-2 font-mono text-[12px] font-semibold text-muted">
                  {term.label}
                  <span className="font-sans text-[10px] uppercase tracking-wide text-faint">
                    {term.kind === "decision" ? f.kindDecision : f.kindThing}
                  </span>
                </dt>
                <dd className="text-[13px] leading-snug text-muted">{g[term.key]}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
