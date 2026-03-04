import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { usePubblicaAnnuncioForm } from "../index";
import { useFormProgress } from "../index";
import { useFormNavigation } from "./useFormNavigation";
import { ERROR_MESSAGES } from "@/shared/types";
import { useApartmentPublishValidation } from "./useApartmentPublishValidation";

const SECTION_LABELS = {
  title: "Titolo",
  description: "Descrizione",
  address: "Indirizzo",
  features: "Caratteristiche",
  amenities: "Servizi",
  houseRules: "Regole",
  apartmentPhotoFiles: "Immagini alloggio",
  ownerDetails: "Proprietario",
  rooms: "Stanze",
};

const FIELD_TO_STEP = {
  title: "basic",
  description: "basic",
  ownerDetails: "owner",
  address: "address",
  features: "characteristics",
  amenities: "characteristics",
  houseRules: "characteristics",
  apartmentPhotoFiles: "images",
  rooms: "rooms",
};

const getErrorPrefix = (error, steps = []) => {
  const stepFromError = steps.find((step) => step.id === error?.stepId);
  if (stepFromError?.name) {
    return stepFromError.name;
  }

  const field = error?.field;
  if (!field || typeof field !== "string") return null;

  const roomMatch = field.match(/^rooms\.(\d+)\./);
  if (roomMatch) {
    const roomIndex = Number(roomMatch[1]);
    if (Number.isFinite(roomIndex)) {
      return `Stanza ${roomIndex + 1}`;
    }
  }

  const sectionKey = field.split(".")[0];
  return SECTION_LABELS[sectionKey] || null;
};

const buildPublishValidationToast = (error, steps = []) => {
  if (!error?.message) {
    return "Completa i dati richiesti prima di pubblicare.";
  }
  const prefix = getErrorPrefix(error, steps);
  return prefix ? `${prefix}: ${error.message}` : error.message;
};

/**
 * Hook per il flusso "Pubblica Annuncio" con validazione centralizzata.
 *
 * @param {object} props - Parametri passati dal componente pagina.
 * @param {boolean|null} props.getOwnerInfo - Flag che indica se richiedere ownerDetails.
 * @param {(value: boolean) => void} props.setGetOwnerInfo - Setter flag owner.
 * @returns {object} API completa del form con validazione, progresso e navigazione.
 */
export default function usePubblicaAnnuncioEnhanced(props) {
  const originalHook = usePubblicaAnnuncioForm(props);
  const handleOriginalSubmit = originalHook.handleSubmit;
  const handleOriginalChange = originalHook.handleChange;
  const [showTips, setShowTips] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requireOwnerDetails = props.getOwnerInfo === true;

  const validation = useApartmentPublishValidation({
    formData: originalHook.formData,
    requireOwnerDetails,
  });

  const progress = useFormProgress(originalHook.formData, props.getOwnerInfo);

  const baseNavigation = useFormNavigation(progress.steps, (stepId) => {
    const step = progress.steps.find((entry) => entry.id === stepId);
    return step ? step.completed : false;
  });

  const goToFirstError = useCallback(
    (errorsOverride = null) => {
      const allErrors = Array.isArray(errorsOverride)
        ? errorsOverride
        : validation.result.errors;

      const relevantErrors = allErrors.filter((error) => {
        if (!requireOwnerDetails && error?.field?.startsWith("ownerDetails.")) {
          return false;
        }
        return Boolean(error?.field);
      });

      if (relevantErrors.length === 0) return;

      const firstError = relevantErrors[0];
      const stepId =
        firstError.stepId ||
        FIELD_TO_STEP[firstError.field.split(".")[0]] ||
        null;

      if (stepId) {
        const stepIndex = progress.steps.findIndex((step) => step.id === stepId);
        if (stepIndex >= 0) {
          baseNavigation.goToStep(stepIndex);
        }
      }

      setTimeout(() => {
        const selector = `[name="${firstError.field}"]`;
        const targetElement = document.querySelector(selector);
        if (!targetElement) return;
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        targetElement.focus();
      }, 300);
    },
    [baseNavigation, progress.steps, requireOwnerDetails, validation.result.errors]
  );

  const handleNextStep = useCallback(() => {
    if (baseNavigation.canGoToNext()) {
      baseNavigation.goToNext();
      return;
    }

    const currentStepId = baseNavigation.currentStep?.id;
    const currentStep = validation.result.steps?.find(
      (step) => step.id === currentStepId
    );
    const stepErrors = Array.isArray(currentStep?.errors)
      ? currentStep.errors
      : [];

    if (stepErrors.length > 0) {
      stepErrors.forEach((error) => {
        if (error?.field) validation.touchField(error.field);
      });
      const firstError = stepErrors[0];
      toast.error(buildPublishValidationToast(firstError, progress.steps));
      goToFirstError([firstError]);
      return;
    }

    toast.error(
      `Completa la sezione "${baseNavigation.currentStep?.name || "corrente"}" per continuare.`
    );
  }, [baseNavigation, goToFirstError, progress.steps, validation]);

  const handleSubmitEnhanced = useCallback(
    async (event) => {
      event.preventDefault();

      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const isValidationValid = validation.validateAll();
        if (!isValidationValid) {
          const firstError = validation.getFirstError();
          toast.error(buildPublishValidationToast(firstError, progress.steps));
          goToFirstError(validation.result.errors);
          return;
        }

        if (!progress.isFormComplete) {
          const nextStep = progress.getNextIncompleteStep();
          if (nextStep) {
            toast.error(
              `Completa la sezione "${nextStep.name}" prima di pubblicare l'annuncio`
            );
            const nextStepIndex = progress.steps.findIndex(
              (step) => step.id === nextStep.id
            );
            if (nextStepIndex >= 0) {
              baseNavigation.goToStep(nextStepIndex);
            }
          }
          return;
        }

        await handleOriginalSubmit(event);
      } catch (error) {
        console.error("Errore durante il submit:", error);
        toast.error(ERROR_MESSAGES.SUBMIT_ERROR);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      goToFirstError,
      handleOriginalSubmit,
      isSubmitting,
      baseNavigation,
      progress,
      validation,
    ]
  );

  const handleChangeEnhanced = useCallback(
    (event) => {
      const { name, value } = event.target || {};
      if (!name) return;

      handleOriginalChange(event);
      validation.touchField(name);

      const shouldValidateRooms =
        (name.startsWith("rooms.") && name.endsWith(".areaMq")) ||
        name === "features.totalAreaMq";

      if (shouldValidateRooms) {
        validation.touchField("rooms");
      }

      if (value == null || (typeof value === "string" && value.trim() === "")) {
        validation.clearFieldError(name);
        return;
      }
    },
    [handleOriginalChange, validation]
  );

  const handleBlurEnhanced = useCallback(
    (event) => {
      const { name, value, type, checked, files } = event.target || {};
      if (!name) return;

      // Sync difensivo: alcuni autocomplete browser non emettono change.
      handleOriginalChange({
        target: { name, value, type, checked, files },
      });

      validation.touchField(name);

      const shouldValidateRooms =
        (name.startsWith("rooms.") && name.endsWith(".areaMq")) ||
        name === "features.totalAreaMq";

      if (shouldValidateRooms) {
        validation.touchField("rooms");
      }
    },
    [handleOriginalChange, validation]
  );

  const currentSection = useMemo(
    () => baseNavigation.currentStep?.id || "basic",
    [baseNavigation.currentStep]
  );

  const isFormValid = useMemo(
    () => progress.isFormComplete && validation.isValid && !isSubmitting,
    [isSubmitting, progress.isFormComplete, validation.isValid]
  );

  const navigation = useMemo(
    () => ({
      ...baseNavigation,
      goToNext: handleNextStep,
    }),
    [baseNavigation, handleNextStep]
  );

  return {
    loading: originalHook.loading,
    formData: originalHook.formData,
    setFormData: originalHook.setFormData,
    cityHandle: originalHook.cityHandle,

    currentSection,
    showTips,
    setShowTips,
    isSubmitting,

    progress: progress.progressPercentage,
    currentStep: baseNavigation.currentStepIndex + 1,
    totalSteps: baseNavigation.totalSteps,
    steps: progress.steps,
    isFormComplete: progress.isFormComplete,

    formErrors: validation.errors,
    isFormValid,
    hasVisibleErrors: validation.hasVisibleErrors,

    navigation,
    goToFirstError,

    handleSubmit: handleSubmitEnhanced,
    handleChange: handleChangeEnhanced,
    handleBlur: handleBlurEnhanced,
    getFieldError: validation.getFieldError,
    hasFieldError: validation.hasFieldError,

    validateForm: validation.validateAll,
    clearErrors: validation.clearErrors,
    getStepById: progress.getStepById,
    getNextIncompleteStep: progress.getNextIncompleteStep,
  };
}
