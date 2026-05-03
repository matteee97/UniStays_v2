import { useMemo, useRef } from "react";

import PlatformNotifications from "../../PlatformNotifications";
import UserMenuFloatingButton from "@/ui/components/common/navigation/UserMenuFloatingButton";
import ActiveAnchor from "@/ui/components/common/search/SearchTray/ActiveAnchor";
import FavoritesLink from "./FavoritesLink";
import LogoLink from "./LogoLink";
import SearchBar from "./SearchBar";
import { NAV_CLASS_NAME, PATTERN_OVERLAY_CLASS } from "./navBarClasses";

const NAVBAR_MOTION_CLASS =
  "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
const SEARCH_MODE_CHIP_ATTR = "data-search-mode-chip";

function SearchModeChip({ mode, onChange }) {
  const isApartments = mode === "apartments";
  const chipRef = useRef(null);
  const apartmentsButtonRef = useRef(null);
  const roomsButtonRef = useRef(null);
  const activeButtonRef = useMemo(
    () => ({
      get current() {
        return isApartments
          ? apartmentsButtonRef.current
          : roomsButtonRef.current;
      },
    }),
    [isApartments],
  );

  return (
    <div
      ref={chipRef}
      {...{ [SEARCH_MODE_CHIP_ATTR]: "true" }}
      className="relative z-20 mx-auto flex items-center rounded-full border-2 border-[#d4f1ef] bg-white gap-2 p-1 shadow-[0_10px_30px_rgba(34,142,141,0.12)] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <ActiveAnchor
        active
        containerRef={chipRef}
        targetRef={activeButtonRef}
        className="bg-[#228E8D] "
        offsetX={-6}
        offsetY={-6}
      />
      <button
        ref={apartmentsButtonRef}
        type="button"
        onClick={() => onChange("apartments")}
        className={`relative z-10 rounded-full p-1 transition-opacity duration-200 ${
          isApartments ? "opacity-100" : "opacity-50 hover:opacity-80"
        }`}
        aria-label="Ricerca per alloggi"
      >
        <img
          src="/img/3D/common/house.png"
          alt="Alloggi"
          className="h-9 w-9 object-contain drop-shadow-md"
        />
      </button>
      <button
        ref={roomsButtonRef}
        type="button"
        onClick={() => onChange("rooms")}
        className={`relative z-10 hover:bg-[#228E8D]/10 rounded-full p-1 transition-opacity duration-200 ${
          !isApartments ? "opacity-100" : "opacity-50 hover:opacity-80"
        }`}
        aria-label="Ricerca per camere"
      >
        <img
          src="/img/3D/common/bed.png"
          alt="Camere"
          className="h-9 w-9 object-contain drop-shadow-md"
        />
      </button>
    </div>
  );
}

/**
 * Desktop navigation bar with the full search tray and desktop-only actions.
 */
export default function DesktopNavBar({
  isVisible,
  isApartmentsListingPage,
  isSearchExpanded,
  onSearchExpandedChange,
  onActionClick,
  searchMode,
  onSearchModeChange,
}) {
  return (
    <>
      <header
        className={
          "fixed left-0 top-0 z-[999] hidden w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:block " +
          (isVisible ? "translate-y-0 opacity-100" : "-translate-y-full ") +
          (isApartmentsListingPage || isSearchExpanded ? "!p-0" : "p-2")
        }
      >
        <nav
          id="stickyMenu"
          className={
            "relative " +
            NAV_CLASS_NAME +
            " " +
            NAVBAR_MOTION_CLASS +
            (isApartmentsListingPage || isSearchExpanded
              ? " !rounded-none"
              : "")
          }
        >
          <div
            className={`${PATTERN_OVERLAY_CLASS} ${
              isApartmentsListingPage || isSearchExpanded
                ? "rounded-none"
                : "rounded-2xl"
            }`}
          />

          <div
            className={
              `relative flex flex-col items-center overflow-visible ${NAVBAR_MOTION_CLASS} ` +
              (isSearchExpanded
                ? "h-[150px] gap-4 py-4"
                : "h-[70px] gap-0 py-0")
            }
          >
            <div
              className={
                `order-1 flex w-full justify-center overflow-visible ${NAVBAR_MOTION_CLASS} ` +
                (isSearchExpanded
                  ? "max-h-16 translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none max-h-0 -translate-y-3 scale-95 opacity-0")
              }
            >
              <SearchModeChip mode={searchMode} onChange={onSearchModeChange} />
            </div>

            <div
              className={
                `relative order-2 flex w-full items-center justify-between px-6 ${NAVBAR_MOTION_CLASS} ` +
                (isSearchExpanded ? "h-[82px]" : "h-[70px]")
              }
            >
              <div className="relative z-20">
                <LogoLink />
              </div>
              <SearchBar
                expanded={isSearchExpanded}
                onExpandedChange={onSearchExpandedChange}
                searchMode={searchMode}
                outsideClickExceptSelector={`[${SEARCH_MODE_CHIP_ATTR}]`}
              />
              <div className="relative z-20 flex w-fit items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4 rounded-2xl">
                  <FavoritesLink onClick={onActionClick} />
                  <PlatformNotifications />
                </div>
                <UserMenuFloatingButton />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {isVisible && isSearchExpanded && (
        <div className="fixed inset-0 z-[998] hidden bg-slate-950/25 transition-opacity duration-300 sm:block" />
      )}
    </>
  );
}
