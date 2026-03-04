import { useState } from "react";
import CoolButton from "@/ui/components/common/buttons/CoolButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function ReviewForm({ onSubmit, disabled, onClose }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ rating5: Number(rating), text });
    setRating(5);
    setText("");
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-600 mb-1">Valutazione:</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              className={`transition-colors rounded-full p-1 focus:outline-none ${
                rating >= r
                  ? "text-[#228E8D]"
                  : "text-gray-300 hover:text-[#228e8d]/40"
              }`}
              aria-label={`${r} stelle`}
              tabIndex={0}
            >
              <FontAwesomeIcon icon={faStar} className="w-5 h-5" />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">{rating} stelle</span>
        </div>
      </div>
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-[#d4f1ef] rounded-lg px-4 py-3 focus:outline-none"
          rows={4}
          placeholder="Scrivi la tua recensione..."
        />
      </div>
      <CoolButton
        type="submit"
        disabled={disabled}
        className="px-4 py-2 rounded-lg"
      >
        Invia recensione
      </CoolButton>
    </form>
  );
}
