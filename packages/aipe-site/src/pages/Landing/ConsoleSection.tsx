import Section from "../../components/Section";
import ConsoleScene from "./console/ConsoleScene";
import { useI18n } from "../../i18n";

/**
 * The Console gets its own near-full-viewport section (round 3): the terminal and
 * the stage each need room for the dispatch → wave → gate execution to read without
 * squinting. It is the same two synchronised panes from round 2 — this is scale and
 * legibility, not a rebuild. At small viewports the panes stack (see `ConsoleScene`).
 */
export default function ConsoleSection() {
  const { t } = useI18n();
  return (
    <Section
      id="console"
      eyebrow={t.console.section.eyebrow}
      title={t.console.section.title}
      lead={t.console.section.lead}
      className="bg-surface-1/30"
    >
      <ConsoleScene />
    </Section>
  );
}
