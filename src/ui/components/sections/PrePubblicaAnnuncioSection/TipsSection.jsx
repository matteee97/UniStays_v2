import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { SectionTitle } from "@/ui/components/common";

const TipsSection = ({ tips, className = "" }) => {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        <SectionTitle position="text-center">
          Consigli per un annuncio di successo
        </SectionTitle>
        <div className="bg-[#d4f1ef] rounded-xl p-8 shadow-lg border border-[#43b3ab]">
          <ul className="space-y-4">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-[#228E8D] mt-1 flex-shrink-0"
                />
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TipsSection;
