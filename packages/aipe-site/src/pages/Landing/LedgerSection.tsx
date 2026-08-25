import Section from "../../components/Section";
import LedgerScrubber from "./signature/LedgerScrubber";

export default function LedgerSection() {
  return (
    <Section
      id="ledger"
      eyebrow="The journey ledger"
      title="Scrub the ledger. Watch the gates hold."
      lead="Every dispatch is recorded in a durable, human-inspectable ledger. Drag through a journey and see exactly where the evidence gate and the QA gate stop a write cold."
    >
      <LedgerScrubber />
    </Section>
  );
}
