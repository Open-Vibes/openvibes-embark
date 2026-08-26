import Hero from "./Hero";
import ProblemSection from "./ProblemSection";
import CompanySection from "./CompanySection";
import HowItWorks from "./HowItWorks";
import LawsSection from "./LawsSection";
import HarnessSection from "./HarnessSection";
import CostSection from "./CostSection";
import GetStarted from "./GetStarted";

export default function Landing() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <CompanySection />
      <HowItWorks />
      <LawsSection />
      <HarnessSection />
      <CostSection />
      <GetStarted />
    </>
  );
}
