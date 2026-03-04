import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faImage,
  faInfo,
  faLocationDot,
  faRulerCombined,
  faBed,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useScrollProgress } from "@/ui/hooks";
import ProgressBar, { PercentageBar } from "@/ui/components/common/indicators/ProgressBar";

/**
 * Componente per mostrare il progresso del form di pubblicazione
 * Completamente reattivo e sincronizzato con lo stato del form
 */
const FormProgress = ({
  currentStep = 1,
  totalSteps = 6,
  progressPercentage = 0,
  steps = [],
  className = "",
  showStepNames = true,
  compact = false,
  enableScrollBehavior = true,
  onStepClick = null,
  hasErrors = false,
  errorMessage = "",
  goToFirstError = null,
}) => {
  // Hook per gestire il comportamento durante lo scroll
  const { shouldCompact } = useScrollProgress(10);

  // Determina se usare la modalità compatta
  const isCompactMode = compact || (enableScrollBehavior && shouldCompact);
  // Step di default se non forniti
  const defaultSteps = [
    {
      id: "basic",
      name: "Informazioni base",
      iconName: faInfo,
      completed: false,
    },
    {
      id: "characteristics",
      name: "Caratteristiche e dettagli",
      iconName: faRulerCombined,
      completed: false,
    },
    {
      id: "address",
      name: "Indirizzo",
      iconName: faLocationDot,
      completed: false,
    },
    {
      id: "rooms",
      name: "Stanze",
      iconName: faBed,
      completed: false,
    },
    { id: "images", name: "Immagini", iconName: faImage, completed: false },
    {
      id: "review",
      name: "Pronto per pubblicare",
      iconName: faEye,
      completed: false,
    },
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps;

  // Modalità compatta (esplicitamente richiesta o durante scroll)
  if (isCompactMode) {
    const completedSteps = displaySteps.filter((step) => step.completed).length;

    return (
      <div
        className={`
          bg-white/90 backdrop-blur-lg rounded-xl p-3 border border-[#d4f1ef] shadow-lg
          transition-all duration-200 ease-out
          ${enableScrollBehavior && shouldCompact ? "sticky top-2 z-50" : ""}
          ${className}
        `}
      >
        <PercentageBar
          value={progressPercentage}
          max={100}
          variant={hasErrors ? "danger" : "default"}
          size="sm"
          interactive={false}
          label={
            <div className="flex items-center gap-4 mb-1">
              <span className="text-sm text-gray-600">Progresso del form</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {completedSteps} completati
              </span>
              {hasErrors && (
                <span className="bg-red-50 dark:bg-[#42262656] text-red-500 text-xs px-2 py-1 rounded-full">
                  Errore di validazione
                </span>
              )}
            </div>
          }
          className="mb-2"
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-white/80 backdrop-blur-lg sticky top-4 rounded-2xl p-6 border-2 border-[#d4f1ef] shadow-lg z-40 transition-all duration-300 ease-linear ${className}`}
    >
      {/* Header Progress Bar */}
      <div className="mb-6">
        <div className="mb-6">
          <PercentageBar
            percentage={progressPercentage}
            max={100}
            variant={hasErrors ? "danger" : "default"}
            size="md"
            animated={true}
            showValue={false}
            showPercentage={false}
            className="w-full"
            label={
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Progresso del form
                  </h3>
                  <p className="text-sm text-gray-600">
                    Step {currentStep} di {totalSteps}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#228E8D]">
                    {progressPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">Completato</div>
                </div>
              </div>
            }
          />

          {hasErrors && errorMessage && (
            <div className="m-3 p-3 flex justify-between items-center bg-red-50 dark:bg-[#42262656] border border-red-200 dark:border-red-700 text-red-400  dark:text-red-600  rounded-lg">
              <div className="flex items-center gap-2 ">
                <span>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                </span>
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
              <button
                className="text-sm py-1 px-4 rounded-md border border-red-200 hover:border-red-400  dark:border-red-600 hover:text-red-500 dark:hover:text-red-800
                dark:hover:border-red-800  font-medium transition-all duration-300"
                onClick={goToFirstError}
              >
                Vai all'errore
              </button>
            </div>
          )}
        </div>

        {/* Steps Grid */}
        {showStepNames && (
          <div
            className={`grid grid-cols-2 md:grid-cols-3 ${
              totalSteps <= 6 ? "lg:grid-cols-6" : "lg:grid-cols-7"
            } gap-4`}
          >
            {displaySteps.map((step, index) => {
              const isActive = index + 1 === currentStep;
              const isCompleted = step.completed;
              const isPending = index + 1 > currentStep;

              return (
                <div
                  key={step.id || index}
                  className={`text-center group ${
                    onStepClick && (isCompleted || index < currentStep - 1)
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() => {
                    if (
                      onStepClick &&
                      (isCompleted || index < currentStep - 1)
                    ) {
                      onStepClick(index);
                    }
                  }}
                >
                  {/* Step Circle */}
                  <div
                    className={`
                    w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-2
                    transition-all duration-300 transform group-hover:scale-105
                    ${
                      isCompleted
                        ? "bg-[#228E8D] text-white shadow-lg"
                        : isActive
                        ? "bg-[#62C1BA] text-white shadow-md animate-pulse"
                        : "bg-gray-200 text-gray-500"
                    }
                    ${
                      onStepClick && (isCompleted || index < currentStep - 1)
                        ? "hover:shadow-lg"
                        : ""
                    }
                  `}
                  >
                    {isCompleted ? (
                      <span className="text-lg">✓</span>
                    ) : step.iconName ? (
                      <FontAwesomeIcon icon={step.iconName} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Step Name */}
                  <div
                    className={`
                    text-xs leading-tight transition-colors duration-300
                    ${
                      isCompleted
                        ? "text-[#228E8D] font-medium"
                        : isActive
                        ? "text-[#62C1BA] font-medium"
                        : "text-gray-500"
                    }
                  `}
                  >
                    {step.name}
                  </div>

                  {/* Active Step Indicator */}
                  {isActive && (
                    <div className="w-1 h-1 bg-[#62C1BA] rounded-full mx-auto mt-1 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Progress Summary */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#1F2937]">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {displaySteps.filter((step) => step.completed).length} di{" "}
              {displaySteps.length} step completati
            </span>
            <span>
              {displaySteps.length -
                displaySteps.filter((step) => step.completed).length}{" "}
              rimanenti
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

FormProgress.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
  progressPercentage: PropTypes.number,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      iconName: PropTypes.object, // FontAwesome icon object
      completed: PropTypes.bool.isRequired,
    })
  ),
  className: PropTypes.string,
  showStepNames: PropTypes.bool,
  compact: PropTypes.bool,
  enableScrollBehavior: PropTypes.bool,
  onStepClick: PropTypes.func,
  hasErrors: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default FormProgress;
