import { Children, useEffect, useRef, useState } from "react";

const HIDDEN_SCROLLBAR_CLASS =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const createEdgeMaskStyle = (
  orientation = "horizontal",
  direction = "start",
) => {
  if (orientation === "horizontal") {
    const maskImage =
      direction === "start"
        ? "linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))"
        : "linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))";

    return {
      WebkitMaskImage: maskImage,
      maskImage,
    };
  }

  const maskImage =
    direction === "start"
      ? "linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))"
      : "linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))";

  return {
    WebkitMaskImage: maskImage,
    maskImage,
  };
};

export default function ScrollLane({
  children,
  orientation = "horizontal",
  className = "",
  viewportClassName = "",
  contentClassName = "",
  itemClassName = "",
  fadeStartClassName = "",
  fadeEndClassName = "",
}) {
  const viewportRef = useRef(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateFadeState = () => {
      if (orientation === "horizontal") {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        setCanScrollStart(viewport.scrollLeft > 4);
        setCanScrollEnd(maxScroll - viewport.scrollLeft > 4);
        return;
      }

      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      setCanScrollStart(viewport.scrollTop > 4);
      setCanScrollEnd(maxScroll - viewport.scrollTop > 4);
    };

    updateFadeState();
    viewport.addEventListener("scroll", updateFadeState, { passive: true });
    window.addEventListener("resize", updateFadeState);

    return () => {
      viewport.removeEventListener("scroll", updateFadeState);
      window.removeEventListener("resize", updateFadeState);
    };
  }, [orientation]);

  const items = Children.toArray(children);

  if (!items.length) return null;

  const isHorizontal = orientation === "horizontal";

  const viewportOverflowClass = isHorizontal
    ? "overflow-x-auto overflow-y-hidden"
    : "overflow-y-auto overflow-x-hidden";

  const contentLayoutClass = isHorizontal
    ? "flex-row w-max min-w-full snap-x snap-mandatory gap-4"
    : "flex-col h-max min-h-full snap-y snap-mandatory gap-4";

  const itemSnapClass = isHorizontal ? "snap-start" : "snap-start";

  const fadeStartPositionClass = isHorizontal
    ? "absolute inset-y-0 left-0 w-12"
    : "absolute inset-x-0 top-0 h-12";

  const fadeEndPositionClass = isHorizontal
    ? "absolute inset-y-0 right-0 w-12"
    : "absolute inset-x-0 bottom-0 h-12";

  return (
    <div className={`relative ${className}`}>
      <div
        ref={viewportRef}
        className={`${viewportOverflowClass} ${HIDDEN_SCROLLBAR_CLASS} ${viewportClassName}`}
      >
        <div
          className={`flex items-stretch ${contentLayoutClass} ${contentClassName}`}
        >
          {items.map((child, index) => (
            <div
              key={index}
              className={`shrink-0 self-stretch ${itemSnapClass} ${itemClassName}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {canScrollStart ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none z-10 bg-transparent backdrop-blur-2xl ${fadeStartPositionClass} ${fadeStartClassName}`}
          style={createEdgeMaskStyle(orientation, "start")}
        />
      ) : null}

      {canScrollEnd ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none z-10 bg-transparent backdrop-blur-2xl ${fadeEndPositionClass} ${fadeEndClassName}`}
          style={createEdgeMaskStyle(orientation, "end")}
        />
      ) : null}
    </div>
  );
}
