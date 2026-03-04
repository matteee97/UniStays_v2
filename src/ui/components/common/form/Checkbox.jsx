import React, { forwardRef, useId } from "react";
import clsx from "clsx";
import "./Checkbox.css";

const Checkbox = forwardRef(
  (
    {
      label,
      checked = false,
      onChange,
      className = "",
      name,
      disabled = false,
      description,
      ...props
    },
    ref,
  ) => {
    const inputId = useId();

    return (
      <label
        className={clsx(
          "flex group items-center gap-3 justify-between border-2 px-2.5 py-1.5 text-gray-700 cursor-pointer select-none transition-colors",
          checked
            ? "bg-[#228E8D]/60 dark:bg-[#228E8D]/20 border-[#228E8D]/80 dark:border-[#228E8D]/40"
            : "bg-[#f0fafb] dark:bg-[#0B1220] border-[#d4f1ef]",
          description ? "rounded-2xl" : "rounded-full",
          disabled && "opacity-60 cursor-not-allowed",
          className,
        )}
      >
        <div className="leading-tight">
          {label ? (
            <span
              className={clsx(
                "flex items-center gap-1 text-sm font-medium transition-colors ",
                checked
                  ? "text-white dark:text-[#228E8D]"
                  : "text-[#228E8D] dark:text-gray-500",
              )}
            >
              {label}
            </span>
          ) : null}
          {description ? (
            <p
              className={clsx(
                "text-xs mt-1 leading-snug tracking-tight",
                checked
                  ? "text-white dark:text-slate-400"
                  : "text-[#64748b] dark:text-slate-500",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        <span
          className={clsx("checkbox-wrapper", disabled && "cursor-not-allowed")}
        >
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
          <label htmlFor={inputId}></label>
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
