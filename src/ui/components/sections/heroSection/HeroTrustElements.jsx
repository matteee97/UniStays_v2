import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faBolt,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

const HeroTrustElements = ({ className = "" }) => {
  const trustItems = [
    {
      icon: faShieldAlt,
      text: "500+ annunci verificati",
    },
    {
      icon: faBolt,
      text: "Risposta media < 24h",
    },
    {
      icon: faGraduationCap,
      text: "Università in tutta Italia",
    },
  ];

  return (
    <div
      className={`flex flex-wrap items-center gap-3 text-xs md:text-base ${className}`}
    >
      {trustItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-[#d4f1ef]  text-[#1f5f5d] px-4 py-2 rounded-full dark:bg-[#0F172A] dark:border-white/10 dark:text-gray-400"
        >
          <FontAwesomeIcon icon={item.icon} className="text-[#228E8D]" />
          <span className="font-medium">{item.text}</span>
        </div>
      ))}
    </div>
  );
};

export default HeroTrustElements;
