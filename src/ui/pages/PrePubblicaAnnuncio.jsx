import { useEffect } from "react";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import AnalyticsListener from "@/ui/components/common/AnalyticsListener";
import {
  HeroSection,
  HowItWorksSection,
  BenefitsSection,
  TipsSection,
  FinalCTASection,
} from "@/ui/components/sections/PrePubblicaAnnuncioSection";
import {
  heroContent,
  steps,
  benefits,
  tips,
  finalCTAContent,
} from "@/ui/data/prePubblicaAnnuncioData";

export default function PrePubblicaAnnuncio() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <AnalyticsListener />
      <MetaManager />

      <main className="min-h-screen">
        <HeroSection content={heroContent} />
        <HowItWorksSection steps={steps} />
        <BenefitsSection benefits={benefits} />
        <TipsSection tips={tips} />
        <FinalCTASection content={finalCTAContent} />
      </main>
    </>
  );
}
