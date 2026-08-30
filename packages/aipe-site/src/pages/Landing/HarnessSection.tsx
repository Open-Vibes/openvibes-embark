import Section from "../../components/Section";
import HarnessBay from "./signature/HarnessBay";
import CompatibilityLedger from "./signature/CompatibilityLedger";
import { useI18n } from "../../i18n";

export default function HarnessSection() {
  const { t } = useI18n();
  return (
    <Section
      id="harness"
      eyebrow={t.harnessSection.eyebrow}
      title={t.harnessSection.title}
      lead={t.harnessSection.lead}
      className="bg-surface-1/40"
    >
      <HarnessBay />
      <div className="mt-20 sm:mt-28">
        <CompatibilityLedger />
      </div>
    </Section>
  );
}
