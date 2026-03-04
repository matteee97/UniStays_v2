import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import CoolButton from "@/ui/components/common/buttons/CoolButton";

const HeroSection = ({ content }) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#228E8D]/10 to-[#1a6f6e]/10"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            {content.title}{" "}
            <span className="text-[#228E8D] text-5xl md:text-7xl">
              {content.highlightedTitle}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            {content.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-10">
            <Link to={content.primaryCTA.link}>
              <CoolButton className="px-8 py-4 text-lg">
                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                {content.primaryCTA.text}
              </CoolButton>
            </Link>
            <Link to={content.secondaryCTA.link}>
              <button className="bg-white border border-[#228E8D] text-[#228E8D] font-medium px-4 py-1.5 rounded-full hover:bg-[#228E8D] hover:text-white transition flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                {content.secondaryCTA.text}
              </button>
            </Link>
          </div>
        </div>
      </div>
      <img
        src="/img/3D/common/mascotte-with-tablet.png"
        alt="Unistays mascot with a tablet"
        className="absolute -bottom-4 sm:opacity-45 xl:opacity-100 right-2 xl:right-32 w-[140px] h-fit object-contain"
      />
    </section>
  );
};

export default HeroSection;
