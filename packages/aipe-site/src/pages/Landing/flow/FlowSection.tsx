import Section from "../../../components/Section";
import FlowScene from "./FlowScene";
import { useI18n } from "../../../i18n";

/**
 * The Flow section — "see it run" — sits right after the hero and before the
 * Console. The hero makes the claim in prose; this section is the claim happening:
 * three agents across two repos, dispatched in parallel, working, delivering,
 * reviewed, merged — on a loop, with nothing to press. It reuses none of the
 * hero's decorative backdrop and does not touch the interactive Console; it is the
 * foreground, non-interactive scene the PE asked for. See `README.md` for the
 * design rationale.
 */
export default function FlowSection() {
  const { t } = useI18n();
  const f = t.flow;
  return (
    <Section
      id="flow"
      eyebrow={f.section.eyebrow}
      title={f.section.title}
      lead={f.section.lead}
    >
      <FlowScene />
    </Section>
  );
}
