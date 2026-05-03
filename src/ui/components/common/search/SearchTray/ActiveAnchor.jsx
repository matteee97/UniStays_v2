import useRelativeAnchorLayout from "./useRelativeAnchorLayout";

/**
 * Reusable animated highlight that follows a target inside a relative container.
 */
export default function ActiveAnchor({
  active,
  containerRef,
  targetRef,
  className = "",
  offsetX = 0,
  offsetY = 0,
  widthOffset = 0,
  heightOffset = 0,
}) {
  const layout = useRelativeAnchorLayout({
    containerRef,
    targetRef,
    enabled: active,
  });

  if (!layout) return null;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 rounded-full transition-[transform,width,height,opacity] duration-300 ease-out ${
        active ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        width: layout.width + widthOffset,
        height: layout.height + heightOffset,
        transform: `translate3d(${layout.left + offsetX}px, ${
          layout.top + offsetY
        }px, 0)`,
      }}
    />
  );
}
