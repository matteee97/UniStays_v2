import { forwardRef } from "react";

const BASE_CLASSES =
  "relative min-w-0 rounded-full px-3 sm:px-5 py-1 text-left hover:bg-[#228E8D]/10  transition-all duration-300 ease-out focus:outline-none";

/**
 * Search tray segment button with compact/expanded rendering states.
 */
const SearchSegment = forwardRef(
  (
    {
      label,
      description,
      icon,
      badge = null,
      active = false,
      expanded = false,
      onClick,
      onMouseEnter,
      className = "",
    },
    ref,
  ) => {
    const widthClass = expanded
      ? "flex-1"
      : "flex-1 flex justify-center items-center";

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={`${BASE_CLASSES} ${widthClass} ${className}`}
      >
        <div className="flex items-center truncate gap-2">
          {icon ? (
            <span
              className={"pb-1 " + (active ? "text-white" : "text-[#228E8D]")}
            >
              {icon}
            </span>
          ) : null}
          <div className="flex items-center justify-between truncate whitespace-nowrap w-full gap-2">
            <span
              className={`truncate text-sm font-semibold ${active ? "text-white" : "text-slate-700"}`}
            >
              {label}
            </span>
            {badge != null && (
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full  px-1 text-[10px] font-semibold ${!active ? "text-white bg-[#228E8D]" : "text-[#228E8D] bg-white"}`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
        <p
          className={`overflow-hidden whitespace-nowrap text-[11px] transition-all duration-300 ${
            expanded && active
              ? "max-w-[220px] opacity-100 text-gray-200"
              : "max-w-0 opacity-0 text-gray-400 "
          }`}
        >
          {description}
        </p>
      </button>
    );
  },
);

SearchSegment.displayName = "SearchSegment";

export default SearchSegment;
