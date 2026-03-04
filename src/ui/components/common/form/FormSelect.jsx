import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import DropdownMenu from "../buttons/buttonDropDown/DropdownMenu";
import ArrowIcon from "../shared/icons/ArrowIcon";
import DropdownItem from "../buttons/buttonDropDown/DropdownItem";

export function useDropdownPosition({
  isOpen,
  position,
  buttonRef,
  dropdownHeight = 200,
}) {
  const [dropdownPosition, setDropdownPosition] = useState(position);

  useEffect(() => {
    if (!isOpen) return;
    const buttonEl = buttonRef.current;
    if (!buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    const shouldFlip = rect.bottom + dropdownHeight > window.innerHeight;
    const nextPosition = shouldFlip
      ? position.includes("bottom")
        ? position.replace("bottom", "top")
        : "top-right"
      : position;

    setDropdownPosition((prev) =>
      prev === nextPosition ? prev : nextPosition,
    );
  }, [isOpen, position, dropdownHeight, buttonRef]);

  return dropdownPosition;
}

export default function FormSelectDropdown({
  name,
  options = [],
  value,
  onChange,
  required = false,
  label,
  id,
  className = "",
  placeholder = "Seleziona un'opzione",
  position = "bottom-left",
  minWidth = "",
  bg = "semiTransparent",
  blur = "xl",
  hasFieldError = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);
  const selectId = id || name;
  const buttonRef = useRef(null);
  const dropdownPosition = useDropdownPosition({ isOpen, position, buttonRef });

  const handleOptionClick = (val) => {
    onChange?.({ target: { name, value: val } });
    setIsOpen(false);
  };

  const currentLabel = options.find((opt) =>
    typeof opt === "object" ? opt.value === value : opt === value,
  );

  return (
    <div className="relative w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="text-gray-600 text-sm">
          {label}:
        </label>
      )}

      <button
        id={selectId}
        ref={buttonRef}
        className={clsx(
          "flex items-center justify-between w-full px-3 py-2 bg-white rounded-lg border-2 text-left focus:outline-none",
          value === "" ? "text-gray-500" : "text-gray-600",
          hasFieldError
            ? "focus:ring-1 border-red-300 focus:ring-red-500"
            : "focus:ring-2 border-[#D4F1EF] focus:ring-[#228E8D]",
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={(e) => {
          setIsOpen((prev) => !prev);
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {value
          ? typeof currentLabel === "object"
            ? currentLabel.label
            : currentLabel
          : `${placeholder}${required ? " *" : ""}`}
        <ArrowIcon
          className={`text-[#228E8D] h-4 w-4 ${
            isOpen ? "rotate-180" : ""
          } transition-transform duration-200 ease-in-out`}
        />
      </button>

      <DropdownMenu
        isOpen={isOpen}
        setIsDropdownOpen={setIsOpen}
        position={dropdownPosition}
        excludedSelector={"#" + selectId}
        anchorRef={buttonRef}
        matchAnchorWidth
        bg={bg}
        blur={blur}
      >
        <ul
          className={`max-h-64 ${minWidth} overflow-y-auto py-1 text-sm`}
          role="listbox"
          aria-labelledby={selectId}
        >
          {options.map((opt, i) => {
            const optionValue = typeof opt === "object" ? opt.value : opt;
            const optionLabel = typeof opt === "object" ? opt.label : opt;
            const isFeatured = typeof opt === "object" ? opt.isFeatured : false;
            const isActive = value === optionValue;
            const isHovered = hoveredValue === optionValue;

            return (
              <li key={optionValue || i} role="option" aria-selected={isActive}>
                <DropdownItem
                  isActive={isHovered}
                  onHover={() => setHoveredValue(optionValue)}
                  onClick={() => handleOptionClick(optionValue)}
                  isFeatured={isFeatured}
                >
                  {optionLabel}
                </DropdownItem>
              </li>
            );
          })}
        </ul>
      </DropdownMenu>
    </div>
  );
}
