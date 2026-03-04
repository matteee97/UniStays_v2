import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import ReviewForm from "./ReviewForm";
import { useState } from "react";

/**
 * Componente per lo stato vuoto delle recensioni
 * @param {boolean} loading - Se sta caricando
 * @param {Function} submitReview - Callback per scrivere una recensione
 * @param {boolean} submitting - Se sta inviando una recensione
 * @param {string} customMessage - Messaggio personalizzato per lo stato vuoto
 * @returns {JSX.Element} Stato vuoto
 */
export default function EmptyReviewsState({
  loading,
  submitReview,
  submitting,
  customMessage = null,
}) {
  const [showForm, setShowForm] = useState(false);

  const handleWriteReview = () => {
    setShowForm(true);
  };

  return (
    <div className="text-center py-5">
      {loading ? (
        <>
          <div className="w-16 h-16 bg-[#228E8D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#228E8D]"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Caricamento recensioni...
          </h3>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-[#228E8D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faStar} className="text-[#228E8D] w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Nessuna recensione ancora
          </h3>
          <p className="text-gray-600 mb-6">
            {customMessage ||
              "Sii il primo a lasciare una recensione per questo alloggio!"}
          </p>
          {submitReview && !showForm && (
            <button
              onClick={handleWriteReview}
              className="bg-[#228E8D] text-white px-6 py-3 rounded-lg hover:bg-[#196865] transition-colors"
            >
              Scrivi una recensione
            </button>
          )}
          {submitReview && showForm && (
            <ReviewForm
              onSubmit={submitReview}
              disabled={submitting}
              onClose={() => setShowForm(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
