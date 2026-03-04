import React from "react";
import { SectionTitle } from "@/ui/components/common";
import InfoCard from "@/ui/components/common/cards/InfoCard";

const HowItWorksSection = ({ steps }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle position="text-center">
          Come funziona? È semplicissimo!
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <InfoCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              hoverable={false}
              size="xl"
              variant="transparent"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
