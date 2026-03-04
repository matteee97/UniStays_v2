import React from "react";

const CloseButton = ({
  ariaLabel = "Chiudi",
  className = "",
  onClick,
  ...props
}) => {
  const handleClick = (event) => {
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#D4F1EF] bg-white transition-colors duration-150 hover:border-[#228E8D]/30 text-[#228E8D] ${className}`}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
      >
        <path
          d="M4.25 4.25L11.75 11.75M11.75 4.25L4.25 11.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default CloseButton;
