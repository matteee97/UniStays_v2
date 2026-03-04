import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

/**
 * Pulsante/link stilizzato per navigare internamente o eseguire un'azione.
 * Se è presente `to` renderizza un Link, altrimenti un button.
 */
const GoToButton = ({
  children,
  to,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  icon,
  iconPosition = "left",
  ...props
}) => {
  const baseClasses =
    "group relative flex gap-2 items-center justify-start p-4 sm:py-3 sm:px-4 rounded-2xl w-full text-left transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#228E8D] focus-visible:ring-offset-2";
  const textClasses = "text-base font-medium text-gray-600 ";
  const hoverClasses = " ";

  const content = (
    <span className={`grid ${icon && "grid-cols-[30px,1fr]"} items-center`}>
      {icon && iconPosition === "left" ? (
        <span className="shrink-0 text-[#228E8D]">{icon}</span>
      ) : null}
      <span className={textClasses}>{children}</span>
      {icon && iconPosition === "right" ? (
        <span className="shrink-0 text-[#228E8D]">{icon}</span>
      ) : null}
      <span
        aria-hidden
        className="absolute right-6 text-[#228E8D] -translate-x-[75%] opacity-0 transition-all duration-200 group-hover:translate-x-[40%] group-hover:opacity-100"
      >
        &rarr;
      </span>
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={clsx(baseClasses, hoverClasses, className)}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        baseClasses,
        hoverClasses,
        disabled && "opacity-70 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {content}
    </button>
  );
};

export default GoToButton;
