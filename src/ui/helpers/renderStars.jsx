import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

/**
 * Renderizza le stelle per il rating
 * @param {number} rating - Il rating da 1 a 5
 * @param {string} activeColor - Colore per le stelle attive (default: #228E8D)
 * @param {string} inactiveColor - Colore per le stelle inattive (default: #d4f1ef)
 * @param {string} size - Dimensione delle stelle (default: w-4 h-4)
 * @returns {JSX.Element[]} Array di elementi stella
 */
export const renderStars = (
  rating,
  activeColor = "text-[#228E8D]",
  inactiveColor = "text-[#d4f1ef]",
  size = "w-4 h-4"
) => {
  return Array.from({ length: 5 }, (_, i) => (
    <FontAwesomeIcon
      key={i}
      icon={faStar}
      className={`${size} ${i < rating ? activeColor : inactiveColor}`}
    />
  ));
};
