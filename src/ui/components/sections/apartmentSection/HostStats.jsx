import { useMemo } from "react";
import { faHome, faComment, faHeart } from "@fortawesome/free-solid-svg-icons";
import StatsCard from "@/ui/components/common/charts/StatsCard";
import { RatingBar } from "@/ui/components/common/indicators/ProgressBar";
import { USER_ROLES } from "@/shared/types";

export default function HostStats({
  host,
  apartments = [],
  apartmentsCount,
  favorites = new Set(),
}) {
  // Calcola le statistiche aggregate dagli appartamenti
  const stats = useMemo(() => {
    let totalReviews = 0;
    let totalScore = 0;
    let totalFavorites = 0;

    apartments.forEach((apt) => {
      // Recensioni aggregate
      const ratingCount = apt.metrics?.ratingCount || 0;
      const ratingAvg = apt.metrics?.ratingAvg || 0;
      if (ratingCount > 0) {
        totalReviews += ratingCount;
        totalScore += ratingAvg * ratingCount;
      }

      // Favorites
      const appId = apt.id ?? null;
      if (favorites.has(appId)) {
        totalFavorites += 1;
        console.log(appId);
      }
    });

    const averageRating = totalReviews > 0 ? totalScore / totalReviews : 0;
    const averageRating5 = Math.round(averageRating * 10) / 10; // Una cifra decimale

    return {
      totalReviews,
      averageRating5,
      totalApartments: apartmentsCount,
      totalFavorites,
    };
  }, [apartments]);

  if (!host) return null;

  return (
    <div className="space-y-6 ">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Statistiche {USER_ROLES.HOST}
        </h2>
        <p className="text-gray-600">
          Performance complessive basate sugli annunci
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-10">
        <StatsCard
          title="Annunci Totali"
          value={stats.totalApartments || 0}
          icon={faHome}
        />
        <StatsCard
          title="Aggiunti ai Preferiti"
          value={stats.totalFavorites || 0}
          icon={faHeart}
          countUp={false}
        />
        <StatsCard
          title="N. Recensioni"
          value={stats.totalReviews || 0}
          icon={faComment}
          countUp={false}
          className="hidden lg:flex"
        />
      </div>

      {/* Rating Bar Visual */}
      {stats.averageRating5 > 0 && (
        <RatingBar
          rating={stats.averageRating5}
          max={5}
          label="Rating Medio"
          description={`Basato su ${stats.totalReviews} recensioni`}
          size="lg"
          interactive={false}
          animated={true}
          animationDuration={1500}
        />
      )}
    </div>
  );
}
