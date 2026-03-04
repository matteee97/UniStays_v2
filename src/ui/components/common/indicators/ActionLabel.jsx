import { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function ActionLabel({
  text,
  count,
  className = "",
  alwaysBottom = false,
}) {
  const labelText = count > 0 ? `${text} (${count})` : text;
  const labelRef = useRef(null);
  const [style, setStyle] = useState({});

  useLayoutEffect(() => {
    const labelEl = labelRef.current;
    const parentEl = labelEl?.parentElement;
    if (!labelEl || !parentEl) return;

    const gap = 8;
    const updatePosition = () => {
      const parentRect = parentEl.getBoundingClientRect();
      const labelRect = labelEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const spaceAbove = parentRect.top;
      const top = !alwaysBottom
        ? spaceAbove >= labelRect.height + gap
          ? -(labelRect.height + gap)
          : parentRect.height + gap
        : parentRect.height + gap;

      const desiredLeft = (parentRect.width - labelRect.width) / 2;
      const minLeft = gap - parentRect.left;
      const maxLeft = viewportWidth - gap - labelRect.width - parentRect.left;
      const left = Math.min(Math.max(desiredLeft, minLeft), maxLeft);

      setStyle({
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [labelText]);

  return (
    <span
      ref={labelRef}
      style={style}
      className={clsx(
        "absolute z-50 hidden items-center justify-center rounded-full border border-[#228E8D]/15 bg-[#D4F1EF] px-2.5 py-1 text-[11px] font-semibold text-[#1f7e7c] shadow-sm  transition-all duration-200 ease-out sm:flex sm:opacity-0 sm:scale-95 sm:translate-y-1 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:scale-100 sm:group-hover:translate-y-0",
        className
      )}
    >
      {labelText}
    </span>
  );
}
