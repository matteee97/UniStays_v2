import { useCallback, useRef } from "react";

/**
 * Gestione swipe touch orizzontale con prevenzione dello scroll solo quando serve.
 */
export default function useTouchSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 40,
  preventScrollThreshold = 10,
  disabled = false,
} = {}) {
  const touchStart = useRef({ x: 0, y: 0 });
  const isTouching = useRef(false);

  const handleTouchStart = useCallback(
    (event) => {
      if (disabled || !event.touches?.length) return;
      const touch = event.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
      isTouching.current = true;
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (event) => {
      if (disabled || !isTouching.current || !event.touches?.length) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (
        isHorizontal &&
        Math.abs(deltaX) > preventScrollThreshold &&
        event.cancelable
      ) {
        event.preventDefault();
      }
    },
    [disabled, preventScrollThreshold]
  );

  const handleTouchEnd = useCallback(
    (event) => {
      if (disabled || !isTouching.current || !event.changedTouches?.length)
        return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontal && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }

      isTouching.current = false;
    },
    [disabled, onSwipeLeft, onSwipeRight, threshold]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
