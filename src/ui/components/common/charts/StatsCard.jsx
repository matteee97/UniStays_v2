import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CountUp from "react-countup";

export default function StatsCard({
  title,
  value,
  icon,
  countUp = true,
  className = "",
}) {
  return (
    <div
      className={`group relative bg-white rounded-2xl p-6 flex flex-col items-center shadow-[0_0_15px_5px_rgba(0,0,0,0.05)] border border-[#d4f1ef] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 cursor-pointer ${className}`}
    >
      {/* 3D Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#228e8c0b] to-[#196865]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon with glow effect */}
      <div className="relative mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#228e8cd8] to-[#1c7774] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-[#228E8D]/30 transition-all duration-300 group-hover:scale-110">
          <FontAwesomeIcon icon={icon} className="text-white w-6 h-6 " />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <p className="text-sm text-gray-600 font-medium mb-2 group-hover:text-[#228E8D] transition-colors duration-300">
          {title}
        </p>
        <div className="text-3xl font-bold text-gray-800 group-hover:text-[#228E8D] transition-colors duration-300">
          {countUp ? <CountUp end={value} duration={3.5} /> : value}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-[#228e8c] to-[#1c7774] rounded-full group-hover:w-16 transition-all duration-300" />
    </div>
  );
}
