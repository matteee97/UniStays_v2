import { useCallback, useEffect, useRef, useState } from "react";

import { useClickOutside } from "@/ui/hooks";

import FloatingMenu from "@/ui/components/common/navigation/FloatingMenu";
import UserMenuToggle from "@/ui/components/common/navigation/Navbar/components/UserMenuToggle";
import {
  FLOATING_MENU_ID,
  MENU_BUTTON_ID,
  USER_MENU_CLOSE_EVENT,
} from "@/ui/components/common/navigation/Navbar/constants";

/**
 * Renders the user menu toggle button together with the floating panel it drives.
 * This component is fully self-contained so it can be placed anywhere the menu
 * should be available without having to carry state or refs around.
 */
export default function UserMenuFloatingButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  const handleExternalClose = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    window.addEventListener(USER_MENU_CLOSE_EVENT, handleExternalClose);
    return () =>
      window.removeEventListener(USER_MENU_CLOSE_EVENT, handleExternalClose);
  }, [handleExternalClose]);

  useClickOutside(menuRef, closeMenu, `#${MENU_BUTTON_ID}`, menuOpen);

  return (
    <>
      <UserMenuToggle
        menuOpen={menuOpen}
        onToggle={toggleMenu}
        menuRef={menuRef}
      />

      {menuOpen && (
        <FloatingMenu
          menuRef={menuRef}
          setMenuOpen={setMenuOpen}
          id={FLOATING_MENU_ID}
          role="menu"
          overlayPattern
        />
      )}
    </>
  );
}
