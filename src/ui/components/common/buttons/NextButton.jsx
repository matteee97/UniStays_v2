import React from "react";
import GlassContainer from "@/ui/components/common/containers/GlassContainer.jsx";

const NextButton = ({
  children,
  className = "",
  onClick,
  disabled = false,
  ariaLabel = "Mostra elementi successivi",
  glassEffect = true,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center ${!glassEffect ? " bg-white/75 backdrop-blur px-1 text-[#115756] " : "text-gray-700"} rounded-full text-lg font-semibold shadow-md   disabled:cursor-not-allowed disabled:hidden z-20 ${className}`}
      {...props}
    >
      {glassEffect ? (
        <GlassContainer
          preset={"frost"}
          radius={"full"}
          className={"py-3 px-2"}
        >
          {children}
        </GlassContainer>
      ) : (
        children
      )}
    </button>
  );
};

export default NextButton;
