import { useMemo, useRef } from "react";

import { SEARCH_MODES } from "@/application/filters/searchModeQuery";
import ActiveAnchor from "@/ui/components/common/search/SearchTray/ActiveAnchor";

export const SEARCH_MODE_SWITCH_ATTR = "data-search-mode-chip";

const SEARCH_MODE_OPTIONS = [
  {
    mode: SEARCH_MODES.APARTMENTS,
    label: "Ricerca per alloggi",
    image: "/img/3D/common/house.png",
    imageAlt: "Alloggi",
  },
  {
    mode: SEARCH_MODES.ROOMS,
    label: "Ricerca per camere",
    image: "/img/3D/common/bed.png",
    imageAlt: "Camere",
  },
];

/**
 * Shared search mode switch used by the navbar and search results controls.
 *
 * @param {object} props
 * @param {"apartments" | "rooms"} props.mode
 * @param {(mode: "apartments" | "rooms") => void} props.onChange
 * @param {string} [props.className]
 * @param {string} [props.iconClassName]
 * @returns {React.ReactElement}
 */
export default function SearchModeSwitch({
  mode = SEARCH_MODES.APARTMENTS,
  onChange,
  className = "",
  iconClassName = "h-9 w-9",
}) {
  const chipRef = useRef(null);
  const apartmentsButtonRef = useRef(null);
  const roomsButtonRef = useRef(null);
  const normalizedMode =
    mode === SEARCH_MODES.ROOMS ? SEARCH_MODES.ROOMS : SEARCH_MODES.APARTMENTS;
  const activeButtonRef = useMemo(
    () => ({
      get current() {
        return normalizedMode === SEARCH_MODES.APARTMENTS
          ? apartmentsButtonRef.current
          : roomsButtonRef.current;
      },
    }),
    [normalizedMode],
  );
  const anchorDragTargets = useMemo(
    () => [
      {
        id: SEARCH_MODES.APARTMENTS,
        ref: apartmentsButtonRef,
      },
      {
        id: SEARCH_MODES.ROOMS,
        ref: roomsButtonRef,
      },
    ],
    [],
  );

  return (
    <div
      ref={chipRef}
      {...{ [SEARCH_MODE_SWITCH_ATTR]: "true" }}
      className={`relative z-20 mx-auto flex items-center gap-2 rounded-full border-2 border-[#d4f1ef] bg-white p-1 shadow-[0_10px_30px_rgba(34,142,141,0.12)] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}
    >
      <ActiveAnchor
        active
        containerRef={chipRef}
        targetRef={activeButtonRef}
        offsetX={-6}
        offsetY={-6}
        bubble
        maxBubblePressScale={1.002}
        dragTargets={anchorDragTargets}
        onDragSnap={onChange}
      />

      {SEARCH_MODE_OPTIONS.map((option) => {
        const isActive = normalizedMode === option.mode;
        const buttonRef =
          option.mode === SEARCH_MODES.APARTMENTS
            ? apartmentsButtonRef
            : roomsButtonRef;

        return (
          <button
            key={option.mode}
            ref={buttonRef}
            type="button"
            aria-label={option.label}
            aria-pressed={isActive}
            onClick={() => {
              if (!isActive) onChange?.(option.mode);
            }}
            className={`relative z-10 rounded-full p-1 touch-none select-none transition-opacity duration-200 ${
              isActive ? "opacity-100" : "opacity-50 hover:opacity-80"
            }`}
          >
            <img
              src={option.image}
              alt={option.imageAlt}
              draggable={false}
              className={`${iconClassName} pointer-events-none object-contain drop-shadow-md`}
            />
          </button>
        );
      })}
    </div>
  );
}
