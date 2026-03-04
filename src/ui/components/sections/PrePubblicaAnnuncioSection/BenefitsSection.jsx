import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SectionTitle } from "@/ui/components/common";
import InfoCard from "@/ui/components/common/cards/InfoCard";

const BenefitsSection = ({ benefits }) => {
  return (
    <section className="py-16 bg-[#F0FAFA] ">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle position="text-center">
          Vantaggi esclusivi per i proprietari
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <InfoCard
              key={index}
              icon={<FontAwesomeIcon icon={benefit.icon} />}
              title={benefit.title}
              description={benefit.description}
              variant="default"
              size="lg"
              hoverable={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
