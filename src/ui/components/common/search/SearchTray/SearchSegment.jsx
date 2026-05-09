import { forwardRef } from "react";

const BASE_CLASSES =
  "relative min-w-0 rounded-full text-left group hover:bg-[#228E8D]/10 transition-all duration-300 ease-out focus:outline-none";

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
      ? "flex-1 px-4 py-1.5"
      : "flex-1 flex justify-center items-center gap-0.5 px-3";

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={`${BASE_CLASSES}  ${widthClass} ${className}`}
      >
        <div
          className={`flex items-center truncate ${expanded ? "gap-2" : "gap-2"}`}
        >
          {icon ? (
            <span className={active ? "text-white" : "text-[#228E8D]"}>
              {icon}
            </span>
          ) : null}
          <div className="flex items-center justify-between truncate whitespace-nowrap w-full gap-2">
            <span
              className={`truncate font-semibold ${
                expanded ? "text-[15px]" : "text-sm"
              } ${active ? "text-white" : "text-slate-700"}`}
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
          className={`overflow-hidden text-[12px] text-[#228E8D]/20 whitespace-nowrap group-hover:opacity-100 group-hover:text-[#d4f1ef]/40 group-hover:max-w-[200px] transition-all duration-300 ${
            expanded && active
              ? "max-w-[200px] opacity-100 !text-gray-200"
              : "max-w-0  opacity-0 text-gray-400 "
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
