import React, { useEffect, useState } from "react";
import {
  FormHeader,
  FormProgress,
  StepWrapper,
} from "@/ui/components/sections/PubblicaAnnuncioSection";
import { SectionRenderer } from "@/ui/components/sections/PubblicaAnnuncioSection/FormSections";
import FormFieldset from "@/ui/components/common/form/FormFieldset";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import AnalyticsListener from "@/ui/components/common/AnalyticsListener";
import { usePubblicaAnnuncioEnhanced } from "@/ui/hooks";

export default function PubblicaAnnuncio() {
  const [getOwnerInfo, setGetOwnerInfo] = useState(null);

  const {
    loading,
    formData,
    setFormData,
    handleChange,
    handleBlur,
    handleSubmit,
    cityHandle,
    showTips,
    setShowTips,
    progress,
    currentStep,
    totalSteps,
    steps,
    isSubmitting,
    getFieldError,
    hasFieldError,
    navigation,
    hasVisibleErrors,
    goToFirstError,
  } = usePubblicaAnnuncioEnhanced({
    getOwnerInfo,
    setGetOwnerInfo,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Renderizza la sezione corrente usando il componente SectionRenderer
  const renderCurrentSection = () => (
    <SectionRenderer
      currentStepId={navigation.currentStep?.id}
      formData={formData}
      setFormData={setFormData}
      handleChange={handleChange}
      handleBlur={handleBlur}
      cityHandle={cityHandle}
      showTips={showTips}
      getFieldError={getFieldError}
      hasFieldError={hasFieldError}
      getOwnerInfo={getOwnerInfo}
    />
  );

  return (
    <>
      <AnalyticsListener />
      <MetaManager />

      <main className="relative bg-[#F0FAFA] min-h-screen">
        <div className="relative z-10 max-w-[1700px] mx-auto sm:px-6 sm:py-9">
          {/* Header */}
          <FormHeader loading={loading} />

          {/* Progress Bar */}
          <FormProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            progressPercentage={progress}
            steps={steps}
            enableScrollBehavior
            onStepClick={navigation.goToStep}
            hasErrors={hasVisibleErrors}
            errorMessage={
              "Ci sono errori di validazione. Controlla i campi evidenziati in rosso."
            }
            goToFirstError={goToFirstError}
            className="my-16"
          />

          <FormFieldset disabled={loading}>
            <form>
              <StepWrapper
                currentStep={currentStep}
                totalSteps={totalSteps}
                navigation={navigation}
                isSubmitting={isSubmitting}
                loading={loading}
                showTips={showTips}
                setShowTips={setShowTips}
                onPublish={handleSubmit}
              >
                {renderCurrentSection()}
              </StepWrapper>
            </form>
          </FormFieldset>
        </div>
      </main>
    </>
  );
}
