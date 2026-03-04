import React from "react";

const PrevButton = ({
  children,
  className = "",
  onClick,
  disabled = false,
  ariaLabel = "Mostra elementi precedenti",
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/75 px-1 text-lg font-semibold text-[#115756] transition duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 z-20 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrevButton;
