import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SignedOut } from "@clerk/clerk-react";

import { useChat } from "@/ui/hooks";

import PlatformNotifications from "../PlatformNotifications";
import {
  FavoritesLink,
  LogoLink,
  MobileChatLink,
  MobileSearchLink,
  SearchBar,
} from "./components";
import { HEADER_BASE_CLASS, USER_MENU_CLOSE_EVENT } from "./constants";
import { useNavbarVisibility } from "./hooks";
import { isApartmentDetailPath, isApartmentsListingPath } from "./utils";
import UserMenuFloatingButton from "@/ui/components/common/navigation/UserMenuFloatingButton";
import "./NavBar.css";

const NAV_CLASS_NAME = [
  "w-full p-1 sm:p-0 bg-white/90 sm:bg-white/80",
  "backdrop-blur-xl rounded-2xl shadow-[0_0_15px_5px_rgba(0,0,0,0.05)] transform z-50",
].join(" ");

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
    }
  }, [shouldShowNav, closeUserMenu]);

  return (
    <div className="relative">
      <header
        className={
          HEADER_BASE_CLASS +
          (shouldShowNav
            ? " -translate-y-0 opacity-100 "
            : " translate-y-[95%] sm:-translate-y-full ") +
          (isApartmentDetailPage ? " hidden sm:block " : "") +
          (isApartmentsListingPage ? " sm:!p-0 " : "")
        }
      >
        <nav
          id="stickyMenu"
          className={
            "relative " +
            NAV_CLASS_NAME +
            (isApartmentsListingPage ? " sm:!rounded-none " : "")
          }
        >
          {/* overlay pattern: buchi */}
          <div
            className={`pointer-events-none overflow-hidden ${isApartmentsListingPage ? " rounded-2xl sm:rounded-none " : "rounded-2xl"} absolute inset-0 bg-white/80 dot-hole-mask`}
          />

          <div className="px-6 h-14 sm:h-[70px] flex justify-between items-center">
            {/* Logo */}
            <LogoLink />

            {/* Search Bar */}
            <SearchBar />

            {/* Actions */}
            <div className="flex items-center justify-between w-full sm:w-fit px-2 gap-4">
              <div className="flex rounded-2xl gap-6 sm:gap-4 items-center">
                {/* Favorites Button */}
                <FavoritesLink onClick={closeUserMenu} />

                {/* Search Button for Mobile */}
                <SignedOut>
                  <MobileSearchLink onClick={closeUserMenu} />
                </SignedOut>
                {/* Platform Notifications */}
                <PlatformNotifications />
              </div>

              {/* User Menu Button */}
              <UserMenuFloatingButton />

              <div className="sm:hidden flex items-center gap-6">
                <MobileChatLink
                  unreadCount={unreadCount}
                  onClick={closeUserMenu}
                />
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
