import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faSort } from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/ui/components/common/badges";
import FormSelectDropdown from "@/ui/components/common/form/FormSelect";

/**
 * Componente per i filtri delle recensioni
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Sezione filtri
 */
export default function ReviewsFilters({
  filterRating,
  setFilterRating,
  sortBy,
  setSortBy,
  filteredReviewsCount,
}) {
  return (
    <div className="p-6 border-b border-[#d4f1ef] bg-[#228E8D]/5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4">
          <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtra:</span>
          <FormSelectDropdown
            options={[
              { label: "Tutte le recensioni", value: "all" },
              { label: "5 stelle", value: "5" },
              { label: "4 stelle", value: "4" },
              { label: "3 stelle", value: "3" },
              { label: "2 stelle", value: "2" },
              { label: "1 stella", value: "1" },
            ]}
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="text-sm text-gray-500"
            minWidth="min-w-44"
            bg="white"
            blur="none"
          />
        </div>

        <div className="flex items-center  gap-4">
          <FontAwesomeIcon icon={faSort} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 w-28">
            Ordina per:
          </span>
          <FormSelectDropdown
            options={[
              { label: "Più recenti", value: "recent" },
              { label: "Rating più alto", value: "rating" },
              { label: "Più utili", value: "helpful" },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm text-gray-500"
            minWidth="min-w-36"
          />
        </div>

        <div className="flex items-center justify-end">
          <Badge variant="primary" size="sm">
            {filteredReviewsCount} recension
            {filteredReviewsCount !== 1 ? "i" : "e"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
