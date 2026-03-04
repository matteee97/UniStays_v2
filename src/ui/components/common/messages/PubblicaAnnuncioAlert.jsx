import { useState } from "react";
import CloseButton from "../buttons/CloseButton.jsx";

export default function Alert({ children, id = "alert", className = "" }) {
  const [isVisible, setIsVisible] = useState(true);
  const handleClose = () => setIsVisible((prev) => !prev);

  return (
    isVisible && (
      <div
        id={id}
        className="inset-x-0 bottom-0 z-10"
        role="alert"
        aria-live="polite"
      >
        <div
          className={`flex items-center justify-between rounded-xl bg-[#F0FAFA] px-4 py-3 text-gray-900 ${className}`}
        >
          <div className="w-full flex items-center justify-center">
            {children}
          </div>
          <CloseButton onClick={handleClose} ariaLabel="Chiudi avviso" />
        </div>
      </div>
    )
  );
}
