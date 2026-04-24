import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GlassContainer from "../../common/containers/GlassContainer";

const StatCard = ({ stat, backgroundImage }) => (
  <div className="relative text-center bg-transparent rounded-xl shadow-[0_15px_25px_rgba(0,0,0,0.25)] p-6 group  transition-transform duration-300 overflow-hidden">
    <div>{backgroundImage}</div>
    {backgroundImage && (
      <div className="absolute inset-0 bg-gradient-to-t from-[#13605f]/50 dark:from-[#0F1829]/70 to-transparent dark:to-[#0F1829]/20 scale-110"></div>
    )}
    <div className="w-16 h-16 bg-white border-2 border-[#228e8c47] group-hover:border-[#228e8c] rounded-full flex items-center justify-center opacity-95 mx-auto mb-4 transition-all duration-300">
      <FontAwesomeIcon icon={stat.icon} className="text-2xl text-[#228e8c]" />
    </div>
    <GlassContainer distortion={"strong"} className="w-full px-6 py-2">
      <div
        className="text-4xl md:text-5xl font-bold mb-2 group-hover:brightness-105 transition-colors duration-300"
        style={
          !backgroundImage
            ? { color: "#000" }
            : { color: "#fff", textShadow: "0 0 10px rgba(0,0,0,0.2)" }
        }
      >
        {stat.number}
      </div>
      <div
        className="text-lg  font-bold mb-2"
        style={
          !backgroundImage
            ? { color: "#228e8c" }
            : { color: "#fff", textShadow: "0 0 7px rgba(0,0,0,0.2)" }
        }
      >
        {stat.label}
      </div>
      <div
        className="text-sm text-gray-100 font-semibold opacity-80"
        style={!backgroundImage ? { color: "#228e8c" } : {}}
      >
        {stat.description}
      </div>
    </GlassContainer>
  </div>
);

export default StatCard;
