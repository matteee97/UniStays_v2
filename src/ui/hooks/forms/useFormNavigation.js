import { useState, useCallback, useMemo } from 'react';

/**
 * Hook per gestire la navigazione tra le sezioni del form
 * @param {Array} steps - Array degli step del form
 * @param {Function} isStepComplete - Funzione per verificare se uno step è completo
 * @returns {Object} Oggetto con metodi e stato per la navigazione
 */
export const useFormNavigation = (steps, isStepComplete) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Determina la sezione corrente
  const currentStep = useMemo(() => {
    return steps[currentStepIndex] || null;
  }, [steps, currentStepIndex]);

  // Verifica se può andare al prossimo step
  const canGoToNext = useCallback(() => {
    if (!currentStep) return false;
    // Può andare avanti se lo step corrente è completo
    return isStepComplete(currentStep.id);
  }, [currentStep, isStepComplete]);



  // Verifica se può andare al step precedente
  const canGoToPrevious = useCallback(() => {
    return currentStepIndex > 0;
  }, [currentStepIndex]);

  // Vai al prossimo step
  const goToNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      // Vai al prossimo step solo se quello corrente è completo
      if (isStepComplete(currentStep?.id)) {
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  }, [currentStepIndex, steps.length, currentStep, isStepComplete]);

  // Vai al step precedente
  const goToPrevious = useCallback(() => {
    if (canGoToPrevious()) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [canGoToPrevious]);

  // Vai a uno step specifico
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      // Permetti di andare a step precedenti o step completati
      const targetStep = steps[stepIndex];
      const isTargetStepComplete = isStepComplete(targetStep.id);
      const isPreviousStep = stepIndex < currentStepIndex;
      
      if (isPreviousStep || isTargetStepComplete) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [steps, currentStepIndex, isStepComplete]);

  // Vai al primo step incompleto
  const goToFirstIncomplete = useCallback(() => {
    const firstIncompleteIndex = steps.findIndex(step => !isStepComplete(step.id));
    if (firstIncompleteIndex !== -1) {
      setCurrentStepIndex(firstIncompleteIndex);
    }
  }, [steps, isStepComplete]);

  // Verifica se tutti gli step sono completati
  const isAllComplete = useMemo(() => {
    return steps.every(step => isStepComplete(step.id));
  }, [steps, isStepComplete]);

  return {
    currentStepIndex,
    currentStep,
    totalSteps: steps.length,
    canGoToNext,
    canGoToPrevious,
    goToNext,
    goToPrevious,
    goToStep,
    goToFirstIncomplete,
    isAllComplete,
    setCurrentStepIndex
  };
};
