import { useState, useMemo } from "react";
import { useInView, useReviewActions } from "@/ui/hooks";
import ReviewsStats from "./ReviewsStats";
import ReviewsFilters from "./ReviewsFilters";
import ReviewCard from "./ReviewCard";
import EmptyReviewsState from "./EmptyReviewsState";
import ReviewForm from "./ReviewForm";
import { renderStars } from "@/ui/helpers/renderStars.jsx";
import { USER_ROLES } from "@/shared/types";

export default function ApartmentFeedbackSection({
  // Original app props
  app,
  stats,
  loading = false,
  reviews = [],

  // Configuration props
  mode = "apartment", // "apartment" | "host"
  title = null,
  subtitle = null,
  showReviewForm = true,
  showStats = true,
  showFilters = true,
  initialVisibleCount = 3,
  loadMoreCount = 6,
  containerClassName = "",
}) {
  const [ref, isVisible] = useInView({ threshold: 0.01 });
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState("all");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  // Determine which data to use based on mode
  const currentReviews = reviews;

  const currentStats = mode === USER_ROLES.HOST ? null : stats; // Host stats calculated separately
  const currentApp = mode === USER_ROLES.HOST ? { id: "host-reviews" } : app;

  const { submitReview, toggleLike, replyToReview, submitting } =
    useReviewActions(currentApp);

  // Calculate host stats if in host mode
  const hostStats = useMemo(() => {
    if (mode !== USER_ROLES.HOST || !currentReviews.length) return null;

    const total = currentReviews.length;
    const average =
      currentReviews.reduce((acc, rev) => acc + rev.rating, 0) / total;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    currentReviews.forEach((rev) => {
      const roundedRating = Math.round(rev.rating);
      distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;
    });

    return {
      total,
      average: average.toFixed(1),
      distribution,
      percentage: ((average / 5) * 100).toFixed(0),
    };
  }, [mode, currentReviews]);

  // Filtra e ordina recensioni
  const filteredReviews = useMemo(() => {
    let filtered = currentReviews;

    // Filtra per rating
    if (filterRating !== "all") {
      const ratingValue = parseInt(filterRating);
      filtered = filtered.filter(
        (rev) => Math.round(rev.rating) === ratingValue,
      );
    }

    // Helper per ottenere il timestamp sicuro
    const getReviewTime = (rev) => {
      const value = rev?.createdAt;
      if (!value) return 0;
      if (typeof value.toDate === "function") {
        const d = value.toDate();
        return d instanceof Date ? d.getTime() : 0;
      }
      if (typeof value === "object" && typeof value.seconds === "number") {
        return value.seconds * 1000;
      }
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    };

    // Ordina
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "helpful":
        filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      case "recent":
      default:
        filtered.sort((a, b) => getReviewTime(b) - getReviewTime(a));
        break;
    }

    return filtered;
  }, [currentReviews, sortBy, filterRating]);

  // Recensioni visibili (solo le prime N)
  const visibleReviews = filteredReviews.slice(0, visibleCount);

  // Debug filtri

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + loadMoreCount);
  };

  // Dynamic titles and content based on mode
  const sectionTitle =
    title ||
    (mode === USER_ROLES.HOST
      ? "Recensioni ricevute"
      : "Recensioni degli studenti");
  const sectionSubtitle =
    subtitle ||
    (mode === USER_ROLES.HOST
      ? "Feedback degli studenti sui suoi alloggi"
      : null);
  const emptyStateMessage =
    mode === USER_ROLES.HOST
      ? `Questo ${USER_ROLES.HOST} non ha ancora ricevuto recensioni dai suoi inquilini.`
      : null;

  // Se non ci sono recensioni, mostra lo stato vuoto
  if (!currentReviews.length) {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-2xl p-8 border border-[#d4f1ef] transition-all duration-700 ${containerClassName} ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <EmptyReviewsState
          loading={loading}
          submitReview={showReviewForm ? submitReview : null}
          submitting={submitting}
          customMessage={emptyStateMessage}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`bg-white sm:rounded-2xl border-t sm:border border-[#d4f1ef] transition-all duration-700 ${containerClassName} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-[#d4f1ef]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {sectionTitle}
            </h3>
            {sectionSubtitle && (
              <p className="text-gray-600">{sectionSubtitle}</p>
            )}
          </div>
          {(currentStats || hostStats) && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {renderStars(parseFloat((currentStats || hostStats).average))}
                <span className="text-lg font-bold text-gray-800">
                  {(currentStats || hostStats).average}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {(currentStats || hostStats).total} recensioni
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {showStats && currentStats && <ReviewsStats stats={currentStats} />}
      </div>

      {/* Write Review Form */}
      {showReviewForm && (
        <div className="border-b border-[#d4f1ef]">
          <ReviewForm onSubmit={submitReview} disabled={submitting} />
        </div>
      )}

      {/* Filters and Sort */}
      {showFilters && currentReviews.length > 1 && (
        <ReviewsFilters
          filterRating={filterRating}
          setFilterRating={setFilterRating}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filteredReviewsCount={filteredReviews.length}
        />
      )}

      {/* Reviews List */}
      {visibleReviews.length > 0 && (
        <div className="divide-y divide-[#d4f1ef] dark:divide-[#1F2937]">
          {visibleReviews.map((review, index) => {
            return (
              <ReviewCard
                key={review.id || index}
                review={review}
                onToggleLike={toggleLike}
                onReply={replyToReview}
                mode={mode}
              />
            );
          })}
        </div>
      )}

      {/* Load More / Show All */}
      {filteredReviews.length > 0 && visibleCount < filteredReviews.length && (
        <div className="px-6 py-3 text-center border-t border-[#d4f1ef]">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLoadMore}
              className="text-sm font-semibold text-[#228E8D] hover:underline"
            >
              Mostra di più
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Mostrando {visibleCount} di {filteredReviews.length} recensioni
          </p>
        </div>
      )}

      {/* Show All Reviews Message */}
      {filteredReviews.length > 0 && visibleCount >= filteredReviews.length && (
        <div className="p-4 text-center rounded-b-2xl border-t border-[#d4f1ef] bg-[#228E8D]/5">
          <p className="text-sm text-gray-600">Hai visto tutte le recensioni</p>
        </div>
      )}
    </div>
  );
}
