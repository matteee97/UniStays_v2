import { useState, useEffect, useRef, useCallback } from "react";

export function useScroll(
  allLoaded,
  handleLoadMore,
  threshold = 100,
  direction = "horizontal",
  canLoadMore = true
) {
  const scrollRef = useRef(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const onScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (!canLoadMore) return;

    const isVertical = direction === "vertical";

    const scrollPos = isVertical ? container.scrollTop : container.scrollLeft;
    const scrollSize = isVertical ? container.scrollHeight : container.scrollWidth;
    const clientSize = isVertical ? container.clientHeight : container.clientWidth;

    const isAtStart = scrollPos === 0;
    const isAtEnd = Math.ceil(scrollPos + clientSize) >= scrollSize;

    setAtStart(isAtStart);
    setAtEnd(allLoaded ? isAtEnd : false);

    // Carica altri SOLO se:
    // - non è tutto caricato
    // - c'è davvero overflow
    // - siamo vicini alla fine
    if (
      !allLoaded &&
      scrollSize > clientSize &&
      scrollPos + clientSize >= scrollSize - threshold
    ) {
      handleLoadMore();
    }
  }, [allLoaded, handleLoadMore, threshold, direction]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return { scrollRef, atStart, atEnd };
}
