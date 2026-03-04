import React from "react";
import clsx from "clsx";

const GreenButton = ({
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[#228E8D] px-4 py-3 text-white font-semibold shadow-md transition-all duration-200 hover:bg-[#1a6b6a] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default GreenButton;
