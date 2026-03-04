import React from "react";
import BackroundPattern from "@/ui/components/common/shared/icons/BackroundPattern";

const HeroContentCard = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white/70 dark:bg-[#0F1829] backdrop-blur-md relative rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl max-w-4xl mx-auto mb-12 z-40 ${className}`}
    >
      <div className="absolute top-2/3 -left-10 w-44 h-80 bg-[#228e8c3d] dark:opacity-0 rounded-full blur-3xl -z-1"></div>
      <div className="absolute bottom-4 left-4 w-44 h-44 opacity-55 dark:opacity-0 rounded-full -z-1">
        <BackroundPattern />
      </div>

      <div className="absolute top-0 -right-14 w-44 h-80 bg-[#228e8c3d] dark:opacity-0 rounded-full blur-3xl -z-1"></div>
      <div className="absolute top-4 right-4 w-44 h-44 opacity-55 dark:opacity-0 rounded-full -z-1">
        <BackroundPattern />
      </div>
      {children}
    </div>
  );
};

export default HeroContentCard;
