import { Link } from "react-router-dom";
import { useState } from "react";

import LogoutIcon from "@/ui/components/common/shared/icons/LogoutIcon.jsx";
import AccountIcon from "@/ui/components/common/shared/icons/AccountIcon";
import ListIcon from "@/ui/components/common/shared/icons/ListIcon";
import HomeIcon from "@/ui/components/common/shared/icons/HomeIcon";
import UpLoadIcon from "@/ui/components/common/shared/icons/UpLoadIcon";
import { useClerk } from "@clerk/clerk-react";
import { useWindowWidth } from "@/ui/hooks";
import { ROUTES } from "@/app/routes";

export default function SideMenu({ isOpen, onClose }) {
  const { signOut, openUserProfile } = useClerk();
  const [hovered, setHovered] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  const width = useWindowWidth();
  const isMobile = width < 640;

  return (
    <>
      {/* Overlay solo per mobile */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 sm:hidden"
        />
      )}
      <div className="block">
        <nav
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`${
            isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""
          } fixed left-0 top-0 flex flex-col h-screen bg-white border-2 border-[#d4f1ef] sm:bg-[#d4f1ef] sm:border-none font-medium text-gray-600 py-4 z-50
        transition-all duration-300 ease-in-out overflow-hidden
        ${!isMobile && (hovered ? "w-60 shadow-md" : "w-[62px]")} ${
            isMobile && "w-60 sm:hidden"
          }`}
        >
          <Link to="/" className="fixed top-4 left-3">
            <img
              src="/img/logo.svg"
              alt="logo"
              className="aspect-square w-8 h-8"
            />
          </Link>

          <div className="flex flex-col justify-between h-full mt-20 gap-2">
            <div className="flex flex-col gap-4">
              <MenuItem
                to="/"
                icon={<HomeIcon className="text-[#228E8D] h-6 w-6" />}
                text="Torna alla home"
                expanded={hovered || isMobile}
              />
              <MenuItem
                to="dettagli"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="text-[#228E8D] h-6 w-6"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.39.39 0 0 0-.029-.518z" />
                    <path
                      fillRule="evenodd"
                      d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A8 8 0 0 1 0 10m8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3"
                    />
                  </svg>
                }
                text="Dettagli tecnici"
                expanded={hovered || isMobile}
              />
              <MenuItem
                to="/dashboard/annunci"
                icon={<ListIcon className="text-[#228E8D] h-6 w-6" />}
                text="I tuoi annunci"
                expanded={hovered || isMobile}
              />
              <MenuItem
                to={ROUTES.PRE_PUBLISH_ANNOUNCEMENT}
                icon={<UpLoadIcon className="text-[#228E8D] h-6 w-6" />}
                text="Pubblica annuncio"
                expanded={hovered || isMobile}
                external
              />
            </div>

            <div className="flex flex-col gap-4">
              <MenuItem
                onClick={() => openUserProfile()}
                icon={<AccountIcon className="text-[#228E8D] h-6 w-6" />}
                text="Account"
                expanded={hovered || isMobile}
              />
              <MenuItem
                onClick={() => handleLogout()}
                icon={<LogoutIcon className="text-[#228E8D] h-6 w-6" />}
                text="Esci"
                expanded={hovered || isMobile}
              />
            </div>
          </div>
        </nav>
        <div
          className={`hidden sm:block transition-all duration-300 ease-in-out ${
            hovered ? "w-[240px]" : "w-[62px]"
          }`}
        ></div>
      </div>
    </>
  );
}

function MenuItem({ to, icon, text, expanded, external = false, onClick }) {
  const Tag = external ? "a" : Link;
  return (
    <Tag
      onClick={onClick}
      href={external ? to : undefined}
      to={!external ? to : undefined}
      target={external ? "_blank" : undefined}
      className="flex items-center gap-3 text-gray-600 px-4 py-2 rounded-md transition-colors relative group"
    >
      <span className="text-xl">{icon}</span>
      <span
        className={`whitespace-nowrap overflow-hidden inline-block transition-all duration-150
          ${
            expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
          }`}
        style={{ willChange: "opacity, transform" }}
      >
        {text}
        <span className="absolute bottom-0 left-0 h-[1.2px] bg-[#228E8D] w-0 group-hover:w-full transition-width duration-300"></span>
      </span>
    </Tag>
  );
}
