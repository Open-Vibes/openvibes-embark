import Section from "../../components/Section";
import EnvelopePricer from "./signature/EnvelopePricer";
import { useI18n } from "../../i18n";

export default function CostSection() {
  const { t } = useI18n();
  return (
    <Section id="cost" eyebrow={t.cost.eyebrow} title={t.cost.title} lead={t.cost.lead}>
      <EnvelopePricer />
    </Section>
  );
}
