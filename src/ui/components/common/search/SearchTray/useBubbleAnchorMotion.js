import { useEffect, useRef, useState } from "react";

const SETTLED_TRANSITION =
  "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
const PRESS_TRANSITION =
  "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
const DRAG_TRANSITION = "none";
const RELEASE_TRANSITION =
  "transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const STRETCH_TRANSITION =
  "transform 80ms cubic-bezier(0.16, 1, 0.3, 1)";
const REBOUND_TRANSITION =
  "transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const DRAG_THRESHOLD_PX = 5;
const EMPTY_DRAG_TARGETS = [];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getNode = (target) =>
  target?.ref?.current || target?.current || target?.node || null;

const getLayoutCenter = (layout) => ({
  x: layout.left + layout.width / 2,
  y: layout.top + layout.height / 2,
});

const getRelativeLayout = (containerRect, node) => {
  const rect = node.getBoundingClientRect();

  return {
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    width: rect.width,
    height: rect.height,
  };
};

const normalizeDragTargets = (targets = []) =>
  targets
    .map((target) => ({
      id: target.id,
      node: getNode(target),
    }))
    .filter(
      (target) =>
        target.id != null && target.node && target.node.getClientRects().length,
    );

const findNearestTarget = ({ containerNode, targets, point }) => {
  if (!containerNode || targets.length === 0) return null;

  const containerRect = containerNode.getBoundingClientRect();

  return targets.reduce(
    (nearest, target) => {
      const targetLayout = getRelativeLayout(containerRect, target.node);
      const distance = getDistanceToRect(point, targetLayout);

      return distance < nearest.distance ? { distance, target } : nearest;
    },
    { distance: Number.POSITIVE_INFINITY, target: null },
  ).target;
};

const getBoundedDragOffset = ({ containerNode, layout, event }) => {
  const containerRect = containerNode.getBoundingClientRect();
  const currentCenter = getLayoutCenter(layout);
  const minCenterX = layout.width / 2;
  const maxCenterX = Math.max(minCenterX, containerRect.width - minCenterX);
  const minCenterY = layout.height / 2;
  const maxCenterY = Math.max(minCenterY, containerRect.height - minCenterY);
  const center = {
    x: clamp(event.clientX - containerRect.left, minCenterX, maxCenterX),
    y: clamp(event.clientY - containerRect.top, minCenterY, maxCenterY),
  };

  return {
    x: center.x - currentCenter.x,
    y: center.y - currentCenter.y,
    center,
  };
};

const getSubtleFollowOffset = ({ layout, maxOffset, targetNode, event }) => {
  const rect = targetNode.getBoundingClientRect();
  const currentCenter = getLayoutCenter(layout);
  const raw = {
    x: event.clientX - (rect.left + rect.width / 2),
    y: event.clientY - (rect.top + rect.height / 2),
  };
  const distance = Math.hypot(raw.x, raw.y);
  const ratio = distance > maxOffset && distance > 0 ? maxOffset / distance : 1;
  const offset = {
    x: raw.x * ratio,
    y: raw.y * ratio,
  };

  return {
    ...offset,
    center: {
      x: currentCenter.x + offset.x,
      y: currentCenter.y + offset.y,
    },
  };
};

const getDistanceToRect = (point, layout) => {
  const dx = Math.max(
    layout.left - point.x,
    0,
    point.x - (layout.left + layout.width),
  );
  const dy = Math.max(
    layout.top - point.y,
    0,
    point.y - (layout.top + layout.height),
  );
  return Math.hypot(dx, dy);
};

const getTravelShape = ({ previousLayout, nextLayout, maxStretch }) => {
  const previousCenter = getLayoutCenter(previousLayout);
  const nextCenter = getLayoutCenter(nextLayout);
  const deltaX = nextCenter.x - previousCenter.x;
  const deltaY = nextCenter.y - previousCenter.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance < 1) return null;

  const intensity = clamp(distance / 270, 0, 1.75);
  const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);

  if (horizontal) {
    return {
      origin: `${deltaX >= 0 ? "left" : "right"} center`,
      stretch: {
        scaleX: 1 + maxStretch * intensity,
        scaleY: 1 - maxStretch * 0.55 * intensity,
      },
      rebound: {
        scaleX: 1 - maxStretch * 0.22 * intensity,
        scaleY: 1 + maxStretch * 0.16 * intensity,
      },
    };
  }

  return {
    origin: `center ${deltaY >= 0 ? "top" : "bottom"}`,
    stretch: {
      scaleX: 1 - maxStretch * 0.38 * intensity,
      scaleY: 1 + maxStretch * 0.75 * intensity,
    },
    rebound: {
      scaleX: 1 + maxStretch * 0.84 * intensity,
      scaleY: 1 - maxStretch * 0.88 * intensity,
    },
  };
};

/**
 * Lightweight bubble motion for an active anchor surface.
 *
 * Drag events stay local to the active target and its container. No global
 * document/window listeners are needed, so unrelated app clicks keep flowing.
 */
export default function useBubbleAnchorMotion({
  layout,
  active,
  containerRef,
  targetRef,
  enabled = true,
  dragTargets = EMPTY_DRAG_TARGETS,
  onDragSnap,
  maxStretch = 0.13,
  maxPressScale = 1.035,
  maxFollowOffset = 8,
}) {
  const [drag, setDrag] = useState({
    x: 0,
    y: 0,
    transition: SETTLED_TRANSITION,
  });
  const [shape, setShape] = useState({
    scaleX: 1,
    scaleY: 1,
    transformOrigin: "center",
    transition: SETTLED_TRANSITION,
  });
  const [isPressed, setIsPressed] = useState(false);
  const previousLayoutRef = useRef(null);
  const timersRef = useRef([]);
  const frameRef = useRef(null);
  const pendingDragRef = useRef(null);
  const pointerIdRef = useRef(null);
  const dragStartRef = useRef(null);
  const dragCenterRef = useRef(null);
  const nearestSnapTargetIdRef = useRef(null);
  const didDragRef = useRef(false);
  const isInteractingRef = useRef(false);
  const layoutRef = useRef(layout);
  const snapTargetsRef = useRef([]);
  const onDragSnapRef = useRef(onDragSnap);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    snapTargetsRef.current = normalizeDragTargets(dragTargets);
  }, [dragTargets]);

  useEffect(() => {
    onDragSnapRef.current = onDragSnap;
  }, [onDragSnap]);

  useEffect(() => {
    if (!enabled || !active || !layout || prefersReducedMotion()) {
      previousLayoutRef.current = layout;
      return undefined;
    }

    const previousLayout = previousLayoutRef.current;
    previousLayoutRef.current = layout;
    if (!previousLayout) return undefined;

    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];

    const nextShape = getTravelShape({
      previousLayout,
      nextLayout: layout,
      maxStretch,
    });
    if (!nextShape) return undefined;

    setShape({
      ...nextShape.stretch,
      transformOrigin: nextShape.origin,
      transition: STRETCH_TRANSITION,
    });

    timersRef.current = [
      window.setTimeout(() => {
        setShape({
          ...nextShape.rebound,
          transformOrigin: nextShape.origin,
          transition: REBOUND_TRANSITION,
        });
      }, 155),
      window.setTimeout(() => {
        setShape({
          scaleX: 1,
          scaleY: 1,
          transformOrigin: "center",
          transition: SETTLED_TRANSITION,
        });
      }, 285),
    ];

    return () => {
      timersRef.current.forEach(window.clearTimeout);
      timersRef.current = [];
    };
  }, [active, enabled, layout, maxStretch]);

  useEffect(() => {
    if (!enabled || !active || !layoutRef.current || prefersReducedMotion()) {
      return undefined;
    }

    const targetNode = targetRef.current;
    const containerNode = containerRef?.current;
    if (!targetNode || !containerNode) return undefined;
    const hasSnapDrag = () =>
      snapTargetsRef.current.length > 0 &&
      typeof onDragSnapRef.current === "function";
    const previousTouchAction = targetNode.style.touchAction;
    const previousUserSelect = targetNode.style.userSelect;

    targetNode.style.touchAction = "none";
    targetNode.style.userSelect = "none";

    const queueDrag = (nextDrag) => {
      pendingDragRef.current = nextDrag;
      if (frameRef.current) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const pendingDrag = pendingDragRef.current;
        pendingDragRef.current = null;
        if (!pendingDrag) return;

        setDrag((current) =>
          Math.abs(current.x - pendingDrag.x) < 0.5 &&
          Math.abs(current.y - pendingDrag.y) < 0.5 &&
          current.transition === pendingDrag.transition
            ? current
            : pendingDrag,
        );
      });
    };

    const getOffset = (event) => {
      const currentLayout = layoutRef.current;
      if (!currentLayout) return null;

      return hasSnapDrag()
        ? getBoundedDragOffset({
            containerNode,
            layout: currentLayout,
            event,
          })
        : getSubtleFollowOffset({
            event,
            layout: currentLayout,
            maxOffset: maxFollowOffset,
            targetNode,
          });
    };

    const isActivePointer = (event) =>
      pointerIdRef.current == null || event.pointerId === pointerIdRef.current;

    const updateNearestSnapTarget = (point) => {
      if (!hasSnapDrag() || !point) {
        nearestSnapTargetIdRef.current = null;
        return null;
      }

      const nearestTarget = findNearestTarget({
        containerNode,
        targets: snapTargetsRef.current,
        point,
      });
      nearestSnapTargetIdRef.current = nearestTarget?.id ?? null;
      return nearestTarget;
    };

    const snapToNearestTarget = (point) => {
      if (!hasSnapDrag() || !point) return false;

      const nearestTarget = findNearestTarget({
        containerNode,
        targets: snapTargetsRef.current,
        point,
      });

      if (!nearestTarget) return false;

      nearestSnapTargetIdRef.current = nearestTarget.id;
      onDragSnapRef.current?.(nearestTarget.id);
      return true;
    };

    const resetVisualDrag = () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      pendingDragRef.current = null;
      isInteractingRef.current = false;
      setIsPressed(false);
      setDrag({
        x: 0,
        y: 0,
        transition: RELEASE_TRANSITION,
      });
    };

    const handlePointerDown = (event) => {
      if (pointerIdRef.current != null) return;

      pointerIdRef.current = event.pointerId;
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      didDragRef.current = false;
      nearestSnapTargetIdRef.current = null;
      isInteractingRef.current = true;

      const offset = getOffset(event);
      if (!offset) {
        pointerIdRef.current = null;
        dragStartRef.current = null;
        return;
      }
      dragCenterRef.current = offset.center;
      updateNearestSnapTarget(offset.center);
      setIsPressed(true);
      if (!hasSnapDrag()) {
        queueDrag({
          x: offset.x,
          y: offset.y,
          transition: DRAG_TRANSITION,
        });
      }
    };

    const handlePointerMove = (event) => {
      if (pointerIdRef.current == null || !isActivePointer(event)) return;

      const offset = getOffset(event);
      if (!offset) return;
      dragCenterRef.current = offset.center;
      updateNearestSnapTarget(offset.center);

      if (dragStartRef.current) {
        const distance = Math.hypot(
          event.clientX - dragStartRef.current.x,
          event.clientY - dragStartRef.current.y,
        );
        if (distance > DRAG_THRESHOLD_PX) {
          didDragRef.current = true;
        }
      }

      if (!didDragRef.current && hasSnapDrag()) return;

      event.preventDefault();

      queueDrag({
        x: offset.x,
        y: offset.y,
        transition: DRAG_TRANSITION,
      });
    };

    const handlePointerUp = (event) => {
      if (!isActivePointer(event)) return;

      const releaseOffset = getOffset(event);
      const releaseDistance = dragStartRef.current
        ? Math.hypot(
            event.clientX - dragStartRef.current.x,
            event.clientY - dragStartRef.current.y,
          )
        : 0;
      const hasDragged =
        didDragRef.current || releaseDistance > DRAG_THRESHOLD_PX;
      const shouldSnap = hasSnapDrag() && hasDragged;
      const snapPoint = releaseOffset?.center || dragCenterRef.current;
      pointerIdRef.current = null;
      dragStartRef.current = null;
      dragCenterRef.current = null;
      didDragRef.current = false;
      resetVisualDrag();

      if (shouldSnap && snapPoint) {
        event.preventDefault();
        snapToNearestTarget(snapPoint);
      }
      nearestSnapTargetIdRef.current = null;
    };

    const handlePointerCancel = (event) => {
      if (!isActivePointer(event)) return;

      pointerIdRef.current = null;
      dragStartRef.current = null;
      dragCenterRef.current = null;
      nearestSnapTargetIdRef.current = null;
      didDragRef.current = false;
      resetVisualDrag();
    };

    const handlePointerLeave = (event) => {
      if (pointerIdRef.current == null || !isActivePointer(event)) return;

      pointerIdRef.current = null;
      dragStartRef.current = null;
      dragCenterRef.current = null;
      nearestSnapTargetIdRef.current = null;
      didDragRef.current = false;
      resetVisualDrag();
    };

    targetNode.addEventListener("pointerdown", handlePointerDown);
    containerNode.addEventListener("pointermove", handlePointerMove);
    containerNode.addEventListener("pointerup", handlePointerUp);
    containerNode.addEventListener("pointercancel", handlePointerCancel);
    containerNode.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      const hadActiveInteraction =
        isInteractingRef.current ||
        frameRef.current != null ||
        pendingDragRef.current != null ||
        pointerIdRef.current != null;

      targetNode.style.touchAction = previousTouchAction;
      targetNode.style.userSelect = previousUserSelect;
      targetNode.removeEventListener("pointerdown", handlePointerDown);
      containerNode.removeEventListener("pointermove", handlePointerMove);
      containerNode.removeEventListener("pointerup", handlePointerUp);
      containerNode.removeEventListener("pointercancel", handlePointerCancel);
      containerNode.removeEventListener("pointerleave", handlePointerLeave);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      pendingDragRef.current = null;
      pointerIdRef.current = null;
      dragStartRef.current = null;
      dragCenterRef.current = null;
      didDragRef.current = false;
      isInteractingRef.current = false;

      if (hadActiveInteraction) {
        setIsPressed(false);
        setDrag({
          x: 0,
          y: 0,
          transition: RELEASE_TRANSITION,
        });
      }
    };
  }, [active, containerRef, enabled, maxFollowOffset, targetRef]);

  return {
    translateX: drag.x,
    translateY: drag.y * 0.02,
    scaleX: shape.scaleX * (isPressed ? maxPressScale * 0.92 : 1),
    scaleY: shape.scaleY * (isPressed ? maxPressScale * 1.04 : 1),
    transformOrigin: shape.transformOrigin,
    transition:
      drag.x !== 0 || drag.y !== 0
        ? drag.transition
        : isPressed
          ? PRESS_TRANSITION
          : shape.transition,
  };
}
