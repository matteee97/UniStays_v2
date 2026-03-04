import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import CoolButton from "@/ui/components/common/buttons/CoolButton";

const FinalCTASection = ({ content }) => {
  return (
    <section className="py-20 bg-[#F0FAFA]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-6">
          {content.title}
        </h2>
        <p className="text-xl text-gray-600 mb-8">{content.subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to={content.primaryCTA.link}>
            <CoolButton className="px-10 py-4 text-lg">
              <FontAwesomeIcon icon={faArrowRight} className="mr-4" />
              {content.primaryCTA.text}
            </CoolButton>
          </Link>
          <Link to={content.secondaryCTA.link}>
            <button className="bg-transparent border border-[#228E8D] text-[#228E8D] font-medium px-4 py-1.5 rounded-full hover:bg-[#228E8D] hover:text-white transition flex items-center gap-2">
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              {content.secondaryCTA.text}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
