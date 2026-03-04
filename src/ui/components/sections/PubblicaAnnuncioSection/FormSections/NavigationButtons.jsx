import React from "react";
import CoolButton from "@/ui/components/common/buttons/CoolButton";

const NavigationButtons = ({
  canGoToPrevious,
  canGoToNext,
  goToPrevious,
  goToNext,
  isLastStep,
  isSubmitting,
  loading,
  onPublish,
}) => {
  return (
    <div className="flex justify-between items-center gap-6 sm:gap-14 pt-6 border-t border-gray-200">
      {/* Pulsante Precedente */}
      <CoolButton
        type="button"
        onClick={goToPrevious}
        disabled={!canGoToPrevious}
        ariaLabel="Vai alla sezione precedente"
        className={`${canGoToPrevious ? "" : "opacity-70 cursor-not-allowed"}`}
      >
        ← Precedente
      </CoolButton>

      {/* Pulsante Successivo/Pubblica */}
      {isLastStep ? (
        <CoolButton
          type="button"
          onClick={onPublish}
          ariaLabel="Pubblica annuncio"
          className={`${!isSubmitting ? "" : "opacity-70 cursor-not-allowed"}`}
          disabled={isSubmitting}
        >
          {isSubmitting || loading
            ? "Pubblicazione in corso..."
            : "Pubblica annuncio"}
        </CoolButton>
      ) : (
        <CoolButton
          type="button"
          onClick={goToNext}
          ariaLabel="Vai alla sezione successiva"
          aria-disabled={!canGoToNext}
          className={`${canGoToNext ? "" : "opacity-70"}`}
        >
          Successivo →
        </CoolButton>
      )}
    </div>
  );
};

export default NavigationButtons;
