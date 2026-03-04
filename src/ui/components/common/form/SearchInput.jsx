import React, { forwardRef, useEffect, useId, useMemo, useState } from "react";
import clsx from "clsx";
import CloseButton from "../buttons/CloseButton";

const MagnifierIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16.65" y1="16.65" x2="21" y2="21" />
  </svg>
);

const SearchInput = forwardRef(
  (
    {
      id,
      label,
      placeholder = "Cerca...",
      value,
      searchTerm,
      defaultValue = "",
      onChange,
      onDebouncedChange,
      debounceMs = 0,
      clearable = true,
      onClear,
      className = "",
      inputClassName = "",
      startAdornment,
      endAdornment,
      size = "md",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const [uncontrolledValue, setUncontrolledValue] = useState(
      value ?? searchTerm ?? defaultValue ?? ""
    );

    const isControlled = value !== undefined || searchTerm !== undefined;
    const currentValue = isControlled
      ? value ?? searchTerm ?? ""
      : uncontrolledValue;

    // Mantiene sincronizzato il valore interno con quello controllato
    useEffect(() => {
      if (isControlled) {
        setUncontrolledValue(value ?? searchTerm ?? "");
      }
    }, [isControlled, searchTerm, value]);

    // Debounce opzionale per callback pesanti
    useEffect(() => {
      if (!onDebouncedChange) return;
      const handle = setTimeout(
        () => onDebouncedChange(currentValue),
        debounceMs
      );
      return () => clearTimeout(handle);
    }, [currentValue, debounceMs, onDebouncedChange]);

    const emitChange = (eventOrValue) => {
      if (!onChange) return;

      if (eventOrValue?.target) {
        onChange(eventOrValue);
      } else {
        const syntheticEvent = { target: { value: eventOrValue ?? "" } };
        onChange(syntheticEvent);
      }
    };

    const handleChange = (event) => {
      if (!isControlled) {
        setUncontrolledValue(event.target.value);
      }
      emitChange(event);
    };

    const handleClear = () => {
      if (!isControlled) {
        setUncontrolledValue("");
      }
      emitChange({ target: { value: "" } });
      onClear?.();
    };

    const sizeClasses = useMemo(
      () => ({
        sm: "text-sm py-2",
        md: "text-base py-2.5",
        lg: "text-base py-3",
      }),
      []
    );

    const hasValue = Boolean(currentValue);
    const inputPaddingLeft = startAdornment ? "pl-12" : "pl-11";
    const inputPaddingRight = useMemo(() => {
      if (clearable && endAdornment) return "pr-16";
      if (clearable || endAdornment) return "pr-12";
      return "pr-4";
    }, [clearable, endAdornment]);
    const clearButtonPosition = endAdornment ? "right-10" : "right-2";

    return (
      <div className={clsx("flex flex-col gap-1", className)}>
        {label ? (
          <label
            className="text-sm font-semibold text-gray-700"
            htmlFor={id ?? generatedId}
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#228E8D]">
            {startAdornment ?? <MagnifierIcon className="w-5 h-5" />}
          </span>

          <input
            id={id ?? generatedId}
            ref={ref}
            type="text"
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              "w-full bg-white/95 border-2 border-[#d4f1ef] rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#228E8D]/50 focus:border-[#228E8D] transition-all duration-150",
              inputPaddingLeft,
              inputPaddingRight,
              sizeClasses[size] ?? sizeClasses.md,
              disabled && "cursor-not-allowed opacity-60",
              inputClassName
            )}
            {...props}
          />

          {clearable && hasValue && (
            <CloseButton
              onClick={handleClear}
              className={`absolute ${clearButtonPosition} top-1/2 -translate-y-1/2 !h-7 !w-7`}
            />
          )}

          {endAdornment ? (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {endAdornment}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
