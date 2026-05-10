import useRelativeAnchorLayout from "./useRelativeAnchorLayout";
import useBubbleAnchorMotion from "./useBubbleAnchorMotion";

const EMPTY_DRAG_TARGETS = [];

/**
 * Reusable animated highlight that follows a target inside a relative container.
 */
export default function ActiveAnchor({
  active,
  containerRef,
  targetRef,
  className = "bg-[#228E8D] active:bg-[#1a6b6a]",
  offsetX = 0,
  offsetY = 0,
  widthOffset = 0,
  heightOffset = 0,
  bubble = false,
  dragTargets = EMPTY_DRAG_TARGETS,
  onDragSnap,
  maxBubblePressScale = 1.035,
}) {
  const layout = useRelativeAnchorLayout({
    containerRef,
    targetRef,
    enabled: active,
  });
  const bubbleMotion = useBubbleAnchorMotion({
    layout,
    active,
    containerRef,
    targetRef,
    enabled: bubble,
    dragTargets,
    onDragSnap,
    maxPressScale: maxBubblePressScale,
  });

  if (!layout) return null;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 rounded-full transition-[transform,width,height,opacity] duration-300 ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
      style={{
        width: layout.width + widthOffset,
        height: layout.height + heightOffset,
        transform: `translate3d(${layout.left + offsetX}px, ${
          layout.top + offsetY
        }px, 0)`,
      }}
    >
      <span
        className={`absolute inset-0 rounded-full ${className}`}
        style={{
          transform: `translate3d(${bubbleMotion.translateX}px, ${bubbleMotion.translateY}px, 0) scale3d(${bubbleMotion.scaleX}, ${bubbleMotion.scaleY}, 1)`,
          transformOrigin: bubbleMotion.transformOrigin,
          transition: bubbleMotion.transition,
        }}
      />
    </span>
  );
}
