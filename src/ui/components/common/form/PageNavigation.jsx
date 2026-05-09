import React, { useMemo, useRef } from "react";
import ActiveAnchor from "../search/SearchTray/ActiveAnchor";

const PageNavigation = ({
  paginaCorrente = 1,
  numeroPagine = 1,
  hasNextPage = false,
  onPageChange,
  setPaginaCorrente,
  loadMore,
}) => {
  const hasKnownTotalPages =
    Number.isFinite(numeroPagine) && Number(numeroPagine) > 0;

  const containerRef = useRef(null);

  const clampPage = (page) =>
    Math.min(Math.max(page, 1), Math.max(numeroPagine, 1));

  const emitChange = (page) => {
    const nextPage = hasKnownTotalPages ? clampPage(page) : Math.max(page, 1);
    if (nextPage === paginaCorrente) return;

    if (loadMore && nextPage > paginaCorrente) {
      loadMore();
    }

    if (typeof onPageChange === "function") {
      onPageChange(nextPage);
    }

    if (typeof setPaginaCorrente === "function") {
      setPaginaCorrente(nextPage);
    }
  };

  const buildPages = () => {
    if (!hasKnownTotalPages) {
      return [paginaCorrente];
    }

    if (numeroPagine <= 4) {
      return Array.from({ length: numeroPagine }, (_, idx) => idx + 1);
    }

    const pages = [1];
    const start = Math.max(paginaCorrente - 1, 2);
    const end = Math.min(paginaCorrente + 1, numeroPagine - 1);

    if (start > 2) pages.push("prev-ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < numeroPagine - 1) pages.push("next-ellipsis");

    pages.push(numeroPagine);
    return pages;
  };

  const activeRef = useMemo(
    () => ({
      get current() {
        return containerRef.current?.querySelector(
          `[data-tab-id="${paginaCorrente}"]`,
        );
      },
    }),
    [paginaCorrente],
  );

  const renderButton = (page) => {
    if (typeof page !== "number") {
      return (
        <span key={page} className="px-2 text-gray-500 select-none">
          …
        </span>
      );
    }

    const isActive = page === paginaCorrente;
    return (
      <button
        key={page}
        data-tab-id={page}
        type="button"
        onClick={() => emitChange(page)}
        aria-current={isActive ? "page" : undefined}
        className={`w-8 h-8 z-10 rounded-full text-sm font-semibold transition-colors ${
          isActive
            ? " text-white shadow-xl"
            : "text-gray-700 hover:bg-[#228E8D]/10"
        }`}
      >
        {page}
      </button>
    );
  };

  const canGoPrev = paginaCorrente > 1;
  const canGoNext = hasKnownTotalPages
    ? paginaCorrente < numeroPagine
    : hasNextPage;

  return (
    <nav
      aria-label="Navigazione pagine"
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#eff6f5]/90 via-white/80 to-[#eff6f5] dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#0F172A] p-2 border-2 border-[#d4f1ef] backdrop-blur"
    >
      <button
        type="button"
        onClick={() => emitChange(paginaCorrente - 1)}
        disabled={!canGoPrev}
        className="px-3 py-1 text-base font-semibold text-[#228E8D] rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Pagina precedente"
      >
        ‹
      </button>

      <div className="flex items-center gap-1 relative " ref={containerRef}>
        <ActiveAnchor
          active
          containerRef={containerRef}
          targetRef={activeRef}
          className="bg-[#228E8D] "
        />

        {hasKnownTotalPages ? (
          buildPages().map(renderButton)
        ) : (
          <span className="px-3 py-1 text-sm font-semibold text-gray-700">
            Pagina {paginaCorrente}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => emitChange(paginaCorrente + 1)}
        disabled={!canGoNext}
        className="px-3 py-1 text-base font-semibold text-[#228E8D] rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Pagina successiva"
      >
        ›
      </button>
    </nav>
  );
};

export default PageNavigation;
