import React from "react";
import CloseIcon from "@/ui/components/common/shared/icons/CloseIcon";

const MapButton = ({ isOpen = false, onToggle, onClick }) => {
  const clicked = Boolean(isOpen);
  const handleToggle = () => {
    if (typeof onToggle === "function") {
      onToggle();
      return;
    }
    if (typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <div
      className={`fixed ${
        clicked
          ? "bottom-10 left-1/2 transform -translate-x-[26px] z-[999]"
          : "lg:hidden bottom-24 right-10 sm:right-14"
      } w-6 z-40`}
    >
      <button
        type="button"
        aria-label={clicked ? "Chiudi mappa alloggi" : "Apri mappa alloggi"}
        title={clicked ? "Chiudi mappa alloggi" : "Apri mappa alloggi"}
        aria-expanded={clicked}
        className="bg-white/90 backdrop-blur-xl text-[#228E8Def] border-2 border-[#D4F1EF] p-4 sm:p-3 rounded-full hover:scale-105 transition-all"
        onClick={handleToggle}
      >
        {!clicked ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="w-5 h-5"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M16 .5a.5.5 0 0 0-.598-.49L10.5.99 5.598.01a.5.5 0 0 0-.196 0l-5 1A.5.5 0 0 0 0 1.5v14a.5.5 0 0 0 .598.49l4.902-.98 4.902.98a.5.5 0 0 0 .196 0l5-1A.5.5 0 0 0 16 14.5zM5 14.09V1.11l.5-.1.5.1v12.98l-.402-.08a.5.5 0 0 0-.196 0zm5 .8V1.91l.402.08a.5.5 0 0 0 .196 0L11 1.91v12.98l-.5.1z"
            />
          </svg>
        ) : (
          <CloseIcon className="w-5 h-5" strokeWidth={3.5} />
        )}
      </button>
    </div>
  );
};

export default MapButton;
