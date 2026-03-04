import React, { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

/**
 * Input custom per react-datepicker.
 * Usa forwardRef per compatibilità con il datepicker.
 */
const CustomDateInput = forwardRef(
  (
    { value, onClick, placeholder = "Seleziona una data", className = "" },
    ref,
  ) => {
    return (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        className={clsx(
          "w-full px-4 py-2.5 min-w-[200px] bg-white border-2 border-[#d4f1ef] rounded-2xl text-left text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#228E8D]/50 focus:border-[#228E8D] transition-all duration-150 flex items-center justify-between",
          className,
        )}
      >
        <span className="text-sm">{value || placeholder}</span>
        <FontAwesomeIcon icon={faCalendarDays} className="text-[#228E8D]" />
      </button>
    );
  },
);

CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
