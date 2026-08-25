import Section from "../../components/Section";
import EnvelopePricer from "./signature/EnvelopePricer";

export default function CostSection() {
  return (
    <Section
      id="cost"
      eyebrow="Cost control"
      title="Price every way to run a unit — before you spend a token."
      lead="Four axes decide what a dispatch costs and whether it needs your signature. AIPe enumerates and prices every viable envelope; it never chooses for you."
    >
      <EnvelopePricer />
    </Section>
  );
}
