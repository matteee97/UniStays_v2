import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { useChat } from "@/ui/hooks";
import {
  getSearchModeFromSearchParams,
  SEARCH_MODES,
} from "@/application/filters/searchModeQuery";

import { DesktopNavBar, MobileNavBar } from "./components";
import { USER_MENU_CLOSE_EVENT } from "./constants";
import { useNavbarVisibility } from "./hooks";
import { isApartmentDetailPath, isApartmentsListingPath } from "./utils";
import "./NavBar.css";

/**
 * Renders the main navigation bar.
 *
 * It contains a sticky header with three parts:
 * - The logo on the left
 * - A search bar in the center
 * - User menu and actions on the right
 *
 * The user menu toggle is driven by <code>UserMenuFloatingButton</code> and
 * renders a floating menu in the top right corner of the screen.
 *
 * @param {object} props
 * @param {number} [props.visibleAt=140] Scroll offset after which the navbar becomes visible.
 * @param {(shouldShow: boolean) => void} [props.setScrollToTop] Optional callback for page UI.
 * @returns {React.ReactElement}
 */
export default function NavBar({ visibleAt = 140, setScrollToTop }) {
  const location = useLocation();
  const { unreadCount } = useChat();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const urlSearchMode = useMemo(
    () => getSearchModeFromSearchParams(new URLSearchParams(location.search)),
    [location.search],
  );
  const [searchMode, setSearchMode] = useState(urlSearchMode);

  const isApartmentDetailPage = isApartmentDetailPath(location.pathname);
  const isApartmentsListingPage = isApartmentsListingPath(location.pathname);
  const handleVisibilityChange = useCallback(
    (shouldShow) => setScrollToTop?.(shouldShow),
    [setScrollToTop],
  );
  const resolvedVisibleAt = isApartmentsListingPage ? 0 : visibleAt;

  const closeUserMenu = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(USER_MENU_CLOSE_EVENT));
  }, []);

  const isNavVisible = useNavbarVisibility({
    visibleAt: resolvedVisibleAt,
    onVisibilityChange: handleVisibilityChange,
  });

  const shouldShowNav = isNavVisible && !isApartmentDetailPage;

  useEffect(() => {
    if (!shouldShowNav) {
      closeUserMenu();
      setIsSearchExpanded((current) => (current ? false : current));
    }
  }, [shouldShowNav, closeUserMenu]);

  useEffect(() => {
    setSearchMode(urlSearchMode || SEARCH_MODES.APARTMENTS);
  }, [urlSearchMode]);

  useEffect(() => {
    setIsSearchExpanded((current) => (current ? false : current));
  }, [location.pathname]);

  return (
    <div className="relative">
      <div
        className="absolute inset-0 bg-transparent backdrop-blur-2xl "
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.8)), rgba(0, 0, 0, 0))",
        }}
      />

      <DesktopNavBar
        isVisible={shouldShowNav}
        isApartmentsListingPage={isApartmentsListingPage}
        isSearchExpanded={isSearchExpanded}
        onSearchExpandedChange={setIsSearchExpanded}
        onActionClick={closeUserMenu}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
      />

      {!isApartmentDetailPage && (
        <MobileNavBar
          isVisible={isNavVisible}
          unreadCount={unreadCount}
          onActionClick={closeUserMenu}
        />
      )}
    </div>
  );
}
