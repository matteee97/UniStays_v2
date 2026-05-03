import { useCallback, useLayoutEffect, useState } from "react";

const ANCHOR_CHANGE_TOLERANCE_PX = 0.5;

const areLayoutsEqual = (currentLayout, nextLayout) =>
  currentLayout &&
  Math.abs(currentLayout.left - nextLayout.left) < ANCHOR_CHANGE_TOLERANCE_PX &&
  Math.abs(currentLayout.top - nextLayout.top) < ANCHOR_CHANGE_TOLERANCE_PX &&
  Math.abs(currentLayout.width - nextLayout.width) <
    ANCHOR_CHANGE_TOLERANCE_PX &&
  Math.abs(currentLayout.height - nextLayout.height) <
    ANCHOR_CHANGE_TOLERANCE_PX;

/**
 * Measures a target element relative to its container and keeps the result in
 * sync with layout changes from transitions, responsive classes, or content.
 *
 * @param {object} params
 * @param {React.RefObject<HTMLElement>} params.containerRef Parent coordinate space.
 * @param {React.RefObject<HTMLElement>} params.targetRef Element to follow.
 * @param {boolean} [params.enabled=true] Whether measuring is active.
 * @returns {{left: number, top: number, width: number, height: number} | null}
 */
export default function useRelativeAnchorLayout({
  containerRef,
  targetRef,
  enabled = true,
}) {
  const [layout, setLayout] = useState(null);

  const updateLayout = useCallback(() => {
    const containerNode = containerRef.current;
    const targetNode = targetRef.current;

    if (!enabled || !containerNode || !targetNode) {
      setLayout(null);
      return;
    }

    const containerRect = containerNode.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    const nextLayout = {
      left: targetRect.left - containerRect.left,
      top: targetRect.top - containerRect.top,
      width: targetRect.width,
      height: targetRect.height,
    };

    setLayout((currentLayout) =>
      areLayoutsEqual(currentLayout, nextLayout) ? currentLayout : nextLayout,
    );
  }, [containerRef, enabled, targetRef]);

  useLayoutEffect(() => {
    if (!enabled) {
      setLayout(null);
      return undefined;
    }

    let animationFrameId = window.requestAnimationFrame(updateLayout);
    const syncLayout = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateLayout);
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(syncLayout);

    const containerNode = containerRef.current;
    const targetNode = targetRef.current;

    if (containerNode) resizeObserver?.observe(containerNode);
    if (targetNode) resizeObserver?.observe(targetNode);

    window.addEventListener("resize", syncLayout);
    window.addEventListener("scroll", syncLayout, true);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncLayout);
      window.removeEventListener("scroll", syncLayout, true);
    };
  }, [containerRef, enabled, targetRef, updateLayout]);

  return layout;
}
