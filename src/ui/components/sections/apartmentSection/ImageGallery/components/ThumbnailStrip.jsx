import { ImageWithSkeleton } from "@/ui/components/common";
import { useEffect, useRef } from "react";

export default function ThumbnailStrip({ items, activeIndex, onSelect }) {
  const stripRef = useRef(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const active = strip.querySelector(`[data-idx='${activeIndex}']`);
    if (!active) return;
    active.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex, items.length]);

  if (!items.length) return null;

  return (
    <div
      ref={stripRef}
      className="flex gap-2 overflow-x-auto px-3 py-3 max-w-6xl mx-auto"
    >
      {items.map((item, index) => (
        <button
          key={`${item.url}-${index}`}
          data-idx={index}
          type="button"
          onClick={() => onSelect(index)}
          className={
            "relative h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition " +
            (index === activeIndex
              ? "ring-white "
              : "ring-transparent hover:ring-white/40")
          }
          aria-label={`Vai a immagine ${index + 1}`}
        >
          <ImageWithSkeleton
            src={item.url}
            alt="thumb"
            skeleton={
              <div className="w-full h-full bg-[#d4f1ef]/20 animate-pulse" />
            }
          />
          <div className="absolute inset-0 bg-black/0" />
        </button>
      ))}
    </div>
  );
}
