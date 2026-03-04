import React from "react";

const HeroLogo = ({ urlLogo, className = "" }) => {
  return (
    <div className={`mb-12 ${className}`}>
      <img
        src={urlLogo}
        alt="Logo"
        className="mx-auto w-80 md:w-[400px] h-auto object-contain shadow-white drop-shadow-sm"
      />
    </div>
  );
};

export default HeroLogo;
