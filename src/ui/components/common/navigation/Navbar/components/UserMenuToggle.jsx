import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import { FLOATING_MENU_ID, MENU_BUTTON_ID, MENU_ICON_ID } from "../constants";

export default function UserMenuToggle({ menuOpen, onToggle, menuRef }) {
  return (
    <div className="fixed sm:relative scale-110 sm:scale-100 w-20 sm:w-full h-20 sm:h-fit left-1/2 sm:left-auto -translate-x-1/2 sm:-translate-x-0 flex sm:block items-center justify-center">
      <button
        type="button"
        id={MENU_BUTTON_ID}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={FLOATING_MENU_ID}
        onClick={onToggle}
        className="flex items-center sm:gap-3 sm:bg-white dark:sm:bg-[#0f1829] sm:border-2 sm:border-[#d4f1ef] rounded-2xl p-4 sm:px-3 sm:py-2 focus:outline-none sm:focus:ring-2 sm:focus:ring-[#228E8D]/50 group"
      >
        <div className="hidden sm:block">
          <SignedIn>
            <div className="pointer-events-none flex items-center">
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="w-8 h-8 bg-[#228E8D]/10 rounded-full flex items-center justify-center group-hover:bg-[#228E8D]/20 transition-colors duration-300">
              <FontAwesomeIcon
                icon={faUser}
                className="h-4 w-4 text-[#228E8D]"
                aria-hidden
              />
            </div>
          </SignedOut>
        </div>

        <div
          id={MENU_ICON_ID}
          ref={menuRef}
          className={`${menuOpen ? "open" : ""} transition-transform duration-300`}
        >
          <span className="bg-[#228E8D] transition-all duration-300"></span>
          <span className="bg-[#228E8D] transition-all duration-300"></span>
          <span className="bg-[#228E8D] transition-all duration-300"></span>
          <span className="bg-[#228E8D] transition-all duration-300"></span>
        </div>
      </button>
    </div>
  );
}
