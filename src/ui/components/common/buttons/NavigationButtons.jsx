import { useCallback } from "react";
import PrevButton from "./PrevButton.jsx";
import NextButton from "./NextButton.jsx";
import { useWindowWidth } from "@/ui/hooks/index.js";

const getGapValue = (container) => {
  if (!container || typeof window === "undefined") return 0;
  const computed = window.getComputedStyle(container);
  return (
    parseFloat(computed.gap || computed.columnGap) ||
    parseFloat(computed.rowGap) ||
    0
  );
};

const NavigationButtons = ({ scrollRef, atStart = true, atEnd = false }) => {
  const width = useWindowWidth();

  const scrollByCard = useCallback(
    (direction) => {
      const container = scrollRef?.current;
      if (!container) return;

      const card = container.querySelector(".shrink-0");
      if (!card) return;

      const gap = getGapValue(container);
      const step = Math.max(
        card.offsetWidth * (width <= 640 ? 1 : 3) +
          (width <= 640 ? gap : gap * 3),
        1,
      );
      const maxScroll = Math.max(
        container.scrollWidth - container.clientWidth,
        0,
      );
      const currentIndex = Math.round(container.scrollLeft / step);
      const potentialIndex =
        direction === "prev" ? currentIndex - 1 : currentIndex + 1;
      const targetIndex = Math.max(
        0,
        Math.min(potentialIndex, Math.ceil(maxScroll / step)),
      );
      const target = Math.min(maxScroll, targetIndex * step);

      container.scrollTo({ left: target, behavior: "smooth" });
    },
    [scrollRef],
  );

  return (
    <>
      <PrevButton
        onClick={() => scrollByCard("prev")}
        disabled={atStart}
        ariaLabel="Mostra le card precedenti"
        className="left-2 sm:left-5"
      >
        &#10094;
      </PrevButton>

      <NextButton
        onClick={() => scrollByCard("next")}
        disabled={atEnd}
        ariaLabel="Mostra le card successive"
        className="right-2 sm:right-5"
      >
        &#10095;
      </NextButton>
    </>
  );
};

export default NavigationButtons;
