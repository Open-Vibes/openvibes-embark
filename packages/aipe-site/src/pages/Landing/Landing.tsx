import Hero from "./Hero";
import FlowSection from "./flow/FlowSection";
import ConsoleSection from "./ConsoleSection";
import ProblemSection from "./ProblemSection";
import CompanySection from "./CompanySection";
import HowItWorks from "./HowItWorks";
import LawsSection from "./LawsSection";
import Statement from "./Statement";
import HarnessSection from "./HarnessSection";
import CostSection from "./CostSection";
import GetStarted from "./GetStarted";

export default function Landing() {
  return (
    <>
      <Hero />
      <FlowSection />
      <ConsoleSection />
      <ProblemSection />
      <CompanySection />
      <HowItWorks />
      <LawsSection />
      <Statement />
      <HarnessSection />
      <CostSection />
      <GetStarted />
    </>
  );
}
