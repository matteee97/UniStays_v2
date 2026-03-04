import React from "react";
import NavigationButtons from "./NavigationButtons";

const StepWrapper = ({
  children,
  currentStep,
  totalSteps,
  navigation,
  isSubmitting,
  loading,
  showTips,
  setShowTips,
  onPublish,
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="space-y-6">
      {/* Contenuto della sezione corrente */}
      <div className="min-h-[350px]">{children}</div>

      {/* Pulsanti di navigazione */}
      <NavigationButtons
        canGoToPrevious={navigation.canGoToPrevious()}
        canGoToNext={navigation.canGoToNext()}
        goToPrevious={navigation.goToPrevious}
        goToNext={navigation.goToNext}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        loading={loading}
        onPublish={onPublish}
      />

      {/* Toggle suggerimenti  */}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="text-sm text-[#228E8D] hover:underline"
        >
          {showTips ? "Nascondi suggerimenti" : "Mostra suggerimenti"}
        </button>
      </div>
    </div>
  );
};

export default StepWrapper;
