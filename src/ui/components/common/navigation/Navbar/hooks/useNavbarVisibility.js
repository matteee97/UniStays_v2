import { useEffect, useState } from "react";

/**
 * Handles navbar visibility based on scroll position.
 * @param {object} params
 * @param {number} params.visibleAt
 * @param {(isVisible: boolean) => void} [params.onVisibilityChange]
 * @param {() => void} [params.onHidden]
 * @returns {boolean}
 */
export default function useNavbarVisibility({
  visibleAt,
  onVisibilityChange,
  onHidden,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleScroll = () => {
      const shouldShow = window.scrollY > visibleAt;
      setIsVisible(shouldShow);
      onVisibilityChange?.(shouldShow);

      if (!shouldShow) {
        onHidden?.();
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleAt, onVisibilityChange, onHidden]);

  return isVisible;
}
