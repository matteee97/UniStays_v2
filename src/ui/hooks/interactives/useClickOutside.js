import { useEffect } from "react";

export default function useClickOutside(
  ref,
  callback,
  exceptSelector = null,
  isActive = true
) {
  useEffect(() => {
    if (!isActive) return;
    const handleClickOutside = (event) => {
      // se clicchi sull'elemento da escludere, non fare nulla
      if (exceptSelector && event.target.closest(exceptSelector)) return;

      // se clic fuori dal ref, chiama la callback
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback, exceptSelector, isActive]);
}
