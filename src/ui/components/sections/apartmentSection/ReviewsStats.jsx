import { renderStars } from "@/ui/helpers/renderStars.jsx";
import RatingBar from "@/ui/components/common/indicators/RatingBar";

/**
 * Componente per le statistiche delle recensioni
 * @param {Object} stats - Statistiche delle recensioni
 * @returns {JSX.Element} Sezione statistiche
 */
export default function ReviewsStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Overall Rating */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-700 mb-2">
          {stats.average}
        </div>
        <div className="flex justify-center mb-2">
          {renderStars(Math.round(stats.average))}
        </div>
        <p className="text-gray-500">
          Basato su {stats.total} recension
          {stats.total > 1 ? "i" : "e"}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <RatingBar
            key={rating}
            rating={rating}
            count={stats.distribution[rating]}
            total={stats.total}
          />
        ))}
      </div>
    </div>
  );
}
