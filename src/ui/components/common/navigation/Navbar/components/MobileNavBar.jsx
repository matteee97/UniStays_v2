import { SignedOut } from "@clerk/clerk-react";

import PlatformNotifications from "../../PlatformNotifications";
import UserMenuFloatingButton from "@/ui/components/common/navigation/UserMenuFloatingButton";
import MobileChatLink from "./MobileChatLink";
import MobileSearchLink from "./MobileSearchLink";
import { NAV_CLASS_NAME, PATTERN_OVERLAY_CLASS } from "./navBarClasses";

/**
 * Small-screen bottom navigation bar.
 */
export default function MobileNavBar({ isVisible, unreadCount, onActionClick }) {
  return (
    <header
      className={
        "fixed bottom-0 z-[999] w-full p-3 transition-all duration-500 ease-out sm:hidden " +
        (isVisible ? "translate-y-0 opacity-100" : "translate-y-[95%]")
      }
    >
      <nav className={"relative " + NAV_CLASS_NAME}>
        <div className={`${PATTERN_OVERLAY_CLASS} rounded-2xl`} />

        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex w-full items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-6 rounded-2xl">
              <SignedOut>
                <MobileSearchLink onClick={onActionClick} />
              </SignedOut>
              <PlatformNotifications />
            </div>

            <UserMenuFloatingButton />

            <div className="flex items-center gap-6">
              <MobileChatLink
                unreadCount={unreadCount}
                onClick={onActionClick}
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
