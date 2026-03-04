import { useCallback, useEffect, useRef } from "react";

export default function useGalleryNavigation({
  open,
  itemsLength,
  activeIndex,
  setActiveIndex,
  onClose,
}) {
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < itemsLength - 1;

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, [setActiveIndex]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev < itemsLength - 1 ? prev + 1 : prev));
  }, [itemsLength, setActiveIndex]);

  const touchRef = useRef({ x: 0, y: 0 });
  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchRef.current.x;
      const dy = touch.clientY - touchRef.current.y;
      if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0) goPrev();
      else goNext();
    },
    [goPrev, goNext]
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, goPrev, goNext]);

  useEffect(() => {
    if (!open) return;
    if (activeIndex > itemsLength - 1) setActiveIndex(0);
  }, [open, activeIndex, itemsLength, setActiveIndex]);

  return {
    canPrev,
    canNext,
    goPrev,
    goNext,
    handleTouchStart,
    handleTouchEnd,
  };
}
