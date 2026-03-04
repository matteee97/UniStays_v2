import React from "react";
import BackroundPattern from "@/ui/components/common/shared/icons/BackroundPattern";

const HeroBackground = ({
  urlImage,
  className = "",
  imageClassName = "",
  overlayClassName = "",
  showImage = true,
}) => {
  return (
    <>
      {/* Background with parallax effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#228E8D]/70 via-[#1a6f6e]/60 to-[#228E8D]/80 dark:opacity-15 ${className}`}
      >
        <BackroundPattern />
        {showImage && (
          <img
            src={urlImage}
            alt="Hero background"
            loading="eager"
            className={`w-full h-full object-cover opacity-50 blur-[3px] ${imageClassName}`}
          />
        )}
      </div>

      {/* Overlay gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-transparent dark:from-[#0B1220]/70 via-black/20 dark:via-black/60 to-[#02393894] dark:to-[#0B1220]/70 -z-1 ${overlayClassName}`}
      ></div>
    </>
  );
};

export default HeroBackground;
