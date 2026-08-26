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
export default function ConsoleSection() {
  const { t } = useI18n();
  const g = t.console.glossary;
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
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{g.title}</p>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {GLOSSARY_TERMS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-0.5">
              <dt className="font-mono text-[12px] font-semibold text-brand">{label}</dt>
              <dd className="text-[13px] leading-snug text-muted">{g[key]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
