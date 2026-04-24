import { Link, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import HomeIcon from "@/ui/components/common/shared/icons/HomeIcon";
import GoToButton from "../buttons/GoToButton.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faHeart,
  faListAlt,
} from "@fortawesome/free-regular-svg-icons";
import { ROUTES } from "@/app/routes";
import FloatingMenuPanel from "./FloatingMenuPanel";
import AccountIcon from "../shared/icons/AccountIcon.jsx";
import LogoutIcon from "../shared/icons/LogoutIcon.jsx";
import { useTheme } from "@/ui/hooks/index.js";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { USER_ROLES } from "@/shared/types/index.js";

export default function FloatingMenu({ menuRef, setMenuOpen, ...props }) {
  const { signOut, openUserProfile } = useClerk();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <FloatingMenuPanel ref={menuRef} className="shadow-xl" {...props}>
      <ul className="flex flex-col font-medium p-3 sm:p-5">
        <li>
          <GoToButton
            onClick={() => setMenuOpen(false)}
            to={"/"}
            role="menuitem"
            icon={<HomeIcon />}
            className={"p-3 border-[1.3px] border-[#228E8D] "}
          >
            <span className="text-[#228E8D]">Home</span>
          </GoToButton>
        </li>
        <SignedIn>
          <li>
            <GoToButton
              to={ROUTES.PRE_PUBLISH_ANNOUNCEMENT}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              Pubblica annuncio
            </GoToButton>
          </li>
        </SignedIn>

        <li>
          <GoToButton
            to={ROUTES.CONTACT}
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Contatti
          </GoToButton>
        </li>

        <SignedOut>
          <li>
            <hr className="sm:my-2  bg-white border-gray-300 px-6" />
            <Link
              to={ROUTES.PRE_PUBLISH_ANNOUNCEMENT}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              className="relative flex items-center justify-between px-3 py-3 sm:py-1"
            >
              <div className="grid grid-cols-1 gap-1 ">
                <h3 className="font-semibold text-gray-700 text-sm">
                  Sei un {USER_ROLES.HOST}?
                </h3>
                <p className="text-gray-500 text-xs">
                  Pubblica il tuo primo annuncio e inizia a guadagnare.
                </p>
              </div>

              <img
                src="/img/3D/common/mascotte-with-tablet.png"
                alt="mascotte"
                className="w-20 sm:w-16 h-auto"
              />
            </Link>
          </li>
        </SignedOut>

        <li>
          <hr className="sm:my-2  bg-white border-gray-300 px-6" />
        </li>

        <SignedIn>
          <li>
            <GoToButton
              to={ROUTES.FAVORITES}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              icon={<FontAwesomeIcon icon={faHeart} />}
            >
              Annunci preferiti
            </GoToButton>
          </li>
          <li>
            <GoToButton
              to={ROUTES.MY_ANNOUNCEMENTS}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              icon={<FontAwesomeIcon icon={faListAlt} />}
            >
              I tuoi annunci
            </GoToButton>
          </li>
          <li>
            <GoToButton
              className={"text-gray-600"}
              to={ROUTES.CHAT}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              icon={<FontAwesomeIcon icon={faComments} />}
            >
              Chat
            </GoToButton>
          </li>

          <li>
            <hr className="sm:my-2  bg-white border-gray-300 px-6" />
          </li>

          <li>
            <GoToButton
              onClick={() => {
                openUserProfile();
                setMenuOpen(false);
              }}
              role="menuitem"
              icon={<AccountIcon className={"w-5 h-5"} />}
            >
              Account
            </GoToButton>
          </li>
          <li>
            <GoToButton
              onClick={() => {
                handleLogout().then(setMenuOpen(false), );
              }}
              role="menuitem"
              icon={<LogoutIcon className={"w-5 h-5"} />}
            >
              Esci
            </GoToButton>
          </li>
        </SignedIn>
        <SignedOut>
          <li>
            <GoToButton
              to={ROUTES.SIGN_UP}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              Registrati
            </GoToButton>
          </li>
          <li>
            <GoToButton
              to={ROUTES.SIGN_IN}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              Accedi
            </GoToButton>
          </li>
        </SignedOut>

        <li>
          <hr className="sm:my-2  bg-white border-gray-300 px-6" />
        </li>

        <li>
          <GoToButton
            role="menuitem"
            className={"text-gray-600"}
            onClick={toggleTheme}
            icon={
              <FontAwesomeIcon
                icon={theme === "dark" ? faSun : faMoon}
                className="h-5 w-5 mt-1"
              />
            }
          >
            {theme === "dark" ? "Tema chiaro" : "Tema scuro"}
          </GoToButton>
        </li>
      </ul>
    </FloatingMenuPanel>
  );
}
