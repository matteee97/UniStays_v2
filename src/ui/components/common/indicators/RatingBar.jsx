/**
 * Componente per la barra di distribuzione del rating
 * @param {number} rating - Il rating (1-5)
 * @param {number} count - Numero di recensioni con questo rating
 * @param {number} total - Numero totale di recensioni
 * @returns {JSX.Element} Barra di rating
 */
export default function RatingBar({ rating, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const getBarColor = (rating) => {
    switch (rating) {
      case 5:
        return "bg-[#228E8D]";
      case 4:
        return "bg-[#228E8D]/80";
      case 3:
        return "bg-[#228E8D]/65";
      case 2:
        return "bg-[#228E8D]/50";
      case 1:
        return "bg-[#228E8D]/35";
      default:
        return "bg-[#228E8D]";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 w-8">{rating}★</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`${getBarColor(
            rating
          )} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 w-12">{count}</span>
    </div>
  );
}
