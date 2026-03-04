import { useMemo } from "react";
import {
  faEye,
  faImage,
  faInfo,
  faLocationDot,
  faRulerCombined,
  faUser,
  faBed,
} from "@fortawesome/free-solid-svg-icons";
import { ApartmentValidator } from "@/core/services/ApartmentValidator";

const STEP_ICONS = Object.freeze({
  owner: faUser,
  basic: faInfo,
  characteristics: faRulerCombined,
  address: faLocationDot,
  rooms: faBed,
  images: faImage,
  review: faEye,
});

/**
 * Espone lo stato di avanzamento del wizard "Pubblica Annuncio"
 * basandosi esclusivamente sul validatore centrale.
 *
 * @param {object} formData - Dati correnti del form.
 * @param {boolean|null} [getOwnerInfo=false] - Se true richiede ownerDetails.
 * @returns {{
 *   steps: Array<object>,
 *   currentStep: object | null,
 *   currentStepIndex: number,
 *   totalSteps: number,
 *   completedSteps: number,
 *   progressPercentage: number,
 *   isFormComplete: boolean,
 *   getStepById: (id: string) => object | undefined,
 *   getNextIncompleteStep: () => object | null
 * }}
 */
export const useFormProgress = (formData, getOwnerInfo = false) => {
  const requireOwnerDetails = getOwnerInfo === true;

  const validationSnapshot = useMemo(
    () =>
      ApartmentValidator.validate(formData, formData?.rooms, {
        requireOwnerDetails,
      }),
    [formData, requireOwnerDetails]
  );

  const stepsWithStatus = useMemo(
    () =>
      (validationSnapshot.steps || []).map((step) => ({
        ...step,
        iconName: STEP_ICONS[step.id] || null,
      })),
    [validationSnapshot.steps]
  );

  const currentStep =
    stepsWithStatus[validationSnapshot.currentStepIndex] || null;

  return {
    steps: stepsWithStatus,
    currentStep,
    currentStepIndex: validationSnapshot.currentStepIndex + 1,
    totalSteps: stepsWithStatus.length,
    completedSteps: validationSnapshot.completedSteps,
    progressPercentage: validationSnapshot.progressPercentage,
    isFormComplete: validationSnapshot.isFormComplete,
    getStepById: (id) => stepsWithStatus.find((step) => step.id === id),
    getNextIncompleteStep: () =>
      stepsWithStatus.find((step) => step.required && !step.completed) || null,
  };
};
