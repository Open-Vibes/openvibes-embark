import Section from "../../components/Section";
import HarnessBay from "./signature/HarnessBay";

export default function HarnessSection() {
  return (
    <Section
      id="harness"
      eyebrow="Multi-harness"
      title="Four harnesses. Two can be contained. That's the honest line."
      lead="AIPe can dispatch a specialist to different agent CLIs — and cross-check one model's work with another. But session mode needs true containment, and only claude-code and gemini have it today. Pick a lane and see what changes."
      className="bg-surface-1/40"
    >
      <HarnessBay />
    </Section>
  );
}
