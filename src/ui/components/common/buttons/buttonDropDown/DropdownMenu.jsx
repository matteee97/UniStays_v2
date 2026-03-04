import clsx from "clsx";
import { useClickOutside } from "@/ui/hooks";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

export default function DropdownMenu({
  isOpen,
  setIsDropdownOpen,
  position = "bottom-left",
  transition = true,
  className = "",
  children,
  excludedSelector = null,
  bg = "semiTransparent",
  blur = "xl",
  useFixedPlacement = false,
  anchorRef = null,
  matchAnchorWidth = true,
  ...props
}) {
  const bgClasses = {
    white: "bg-white",
    semiTransparent: "bg-white/90",
    transparent: "bg-transparent",
  };
  const blurClasses = {
    md: "backdrop-blur-md",
    xl: "backdrop-blur-xl",
    none: "backdrop-blur-none",
  };
  const positionClasses = {
    "bottom-left": "left-0 top-full mt-3",
    "bottom-right": "right-0 top-full mt-3",
    "top-left": "left-0 bottom-[calc(100%-20px)] mb-2",
    "top-right": "right-0 bottom-[calc(100%-20px)] mb-2",
  };
  const dropdownRef = useRef(null);
  const [fixedStyle, setFixedStyle] = useState({});

  const updateFixedStyle = useCallback(() => {
    if (!useFixedPlacement || !anchorRef?.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const dropdownEl = dropdownRef.current;
    const viewportPadding = 8;
    const offset = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isTop = position.includes("top");
    const isRight = position.includes("right");

    const measuredWidth = matchAnchorWidth
      ? anchorRect.width
      : (dropdownEl?.offsetWidth ?? anchorRect.width);
    const measuredHeight = dropdownEl?.offsetHeight ?? 0;

    let top = isTop
      ? anchorRect.top - offset - measuredHeight
      : anchorRect.bottom + offset;
    let left = isRight ? anchorRect.right - measuredWidth : anchorRect.left;

    if (measuredHeight > 0) {
      const maxTop = viewportHeight - measuredHeight - viewportPadding;
      top = Math.min(Math.max(viewportPadding, top), maxTop);
    }

    if (measuredWidth > 0) {
      const maxLeft = viewportWidth - measuredWidth - viewportPadding;
      left = Math.min(Math.max(viewportPadding, left), maxLeft);
    }

    setFixedStyle({
      top,
      left,
      zIndex: 99999,
      width: matchAnchorWidth ? anchorRect.width : undefined,
    });
  }, [anchorRef, matchAnchorWidth, position, useFixedPlacement]);

  useLayoutEffect(() => {
    if (!isOpen || !useFixedPlacement) return;

    updateFixedStyle();
    const rafId = requestAnimationFrame(updateFixedStyle);

    window.addEventListener("resize", updateFixedStyle);
    window.addEventListener("scroll", updateFixedStyle, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateFixedStyle);
      window.removeEventListener("scroll", updateFixedStyle, true);
    };
  }, [isOpen, updateFixedStyle, useFixedPlacement]);

  useClickOutside(
    dropdownRef,
    () => setIsDropdownOpen(false),
    excludedSelector,
    isOpen,
  );

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        "z-[99999] rounded-xl border border-[#d4f1ef] shadow-[0_24px_70px_rgba(5,38,38,0.32)] ring-1 ring-[#228E8D]/10 overflow-hidden backdrop-blur-xl",
        useFixedPlacement ? "fixed" : "absolute",
        bgClasses[bg],
        blurClasses[blur],
        !useFixedPlacement && positionClasses[position],
        transition && "transition-all duration-200",
        useFixedPlacement
          ? isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          : isOpen
            ? `${
                position.includes("bottom")
                  ? "translate-y-0 shadow-[0_15px_20px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_25px_rgba(0,0,0,0.5)]"
                  : "-translate-y-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
              } opacity-100  pointer-events-auto`
            : "opacity-0 -translate-y-3 pointer-events-none",
        className,
      )}
      style={useFixedPlacement ? fixedStyle : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
