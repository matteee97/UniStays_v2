import { APARTMENTS, FILES, VALIDATION } from "@/shared/types";
import { ApartmentAggregateCalculator } from "./ApartmentAggregateCalculator";
import { RoomValidator } from "./RoomValidator";

const MIN_REQUIRED_BATHROOMS = Math.max(APARTMENTS.MIN_BATHROOMS, 1);

const BASE_STEP_DEFINITIONS = Object.freeze([
  {
    id: "basic",
    name: "Informazioni base",
    required: true,
    fields: ["title", "description"],
    prefixes: [],
  },
  {
    id: "characteristics",
    name: "Caratteristiche e dettagli",
    required: true,
    fields: [],
    prefixes: ["features.", "amenities.", "houseRules."],
  },
  {
    id: "address",
    name: "Indirizzo",
    required: true,
    fields: [],
    prefixes: ["address."],
  },
  {
    id: "rooms",
    name: "Stanze",
    required: true,
    fields: ["rooms"],
    prefixes: ["rooms."],
  },
  {
    id: "images",
    name: "Immagini",
    required: true,
    fields: ["apartmentPhotoFiles"],
    prefixes: ["apartmentPhotoUrls."],
  },
  {
    id: "review",
    name: "Pronto per pubblicare",
    required: true,
    fields: [],
    prefixes: [],
  },
]);

const OWNER_STEP_DEFINITION = Object.freeze({
  id: "owner",
  name: "Proprietario",
  required: true,
  fields: [],
  prefixes: ["ownerDetails."],
});

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value);
  }
  return Number.NaN;
};

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const getApartmentPhotosCount = (apartment) => {
  const urlsCount = Array.isArray(apartment?.apartmentPhotoUrls)
    ? apartment.apartmentPhotoUrls.filter(Boolean).length
    : 0;
  const filesCount = Array.isArray(apartment?.apartmentPhotoFiles)
    ? apartment.apartmentPhotoFiles.filter(Boolean).length
    : 0;
  return urlsCount + filesCount;
};

const sameDate = (left, right) => {
  if (!left && !right) return true;
  if (!left || !right) return false;
  const leftDate = parseDate(left);
  const rightDate = parseDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.getTime() === rightDate.getTime();
};

const addError = (errors, field, message) => {
  if (!field || !message) return;
  const alreadyExists = errors.some((entry) => entry.field === field);
  if (alreadyExists) return;
  errors.push({ field, message });
};

const buildStepDefinitions = ({ requireOwnerDetails = false } = {}) => {
  if (!requireOwnerDetails) {
    return [...BASE_STEP_DEFINITIONS];
  }
  return [OWNER_STEP_DEFINITION, ...BASE_STEP_DEFINITIONS];
};

const resolveStepIdFromField = (field, steps) => {
  if (!field || !Array.isArray(steps)) return null;

  const matchedStep = steps.find((step) => {
    const exactMatch =
      Array.isArray(step.fields) &&
      step.fields.some((configuredField) => configuredField === field);

    if (exactMatch) return true;

    return (
      Array.isArray(step.prefixes) &&
      step.prefixes.some((prefix) => field.startsWith(prefix))
    );
  });

  return matchedStep?.id || null;
};

const getErrorsByField = (errors) =>
  errors.reduce((acc, error) => {
    if (error?.field && !(error.field in acc)) {
      acc[error.field] = error.message;
    }
    return acc;
  }, {});

const validateOwnerDetails = (apartment, errors) => {
  const owner = apartment?.ownerDetails || {};
  const isAgency = Boolean(owner?.isAgency);

  if (!isNonEmptyString(owner?.firstName)) {
    addError(errors, "ownerDetails.firstName", "Il nome e' obbligatorio.");
  } else {
    const firstName = owner.firstName.trim();
    if (firstName.length < VALIDATION.MIN_NAME_LENGTH) {
      addError(
        errors,
        "ownerDetails.firstName",
        `Il nome deve avere almeno ${VALIDATION.MIN_NAME_LENGTH} caratteri.`
      );
    } else if (firstName.length > VALIDATION.MAX_NAME_LENGTH) {
      addError(
        errors,
        "ownerDetails.firstName",
        `Il nome non puo superare ${VALIDATION.MAX_NAME_LENGTH} caratteri.`
      );
    } else if (!VALIDATION.TEXT_REGEX.test(firstName)) {
      addError(
        errors,
        "ownerDetails.firstName",
        "Il nome contiene caratteri non validi."
      );
    }
  }

  if (!isAgency) {
    if (!isNonEmptyString(owner?.lastName)) {
      addError(
        errors,
        "ownerDetails.lastName",
        "Il cognome e' obbligatorio."
      );
    } else {
      const lastName = owner.lastName.trim();
      if (lastName.length < VALIDATION.MIN_NAME_LENGTH) {
        addError(
          errors,
          "ownerDetails.lastName",
          `Il cognome deve avere almeno ${VALIDATION.MIN_NAME_LENGTH} caratteri.`
        );
      } else if (lastName.length > VALIDATION.MAX_NAME_LENGTH) {
        addError(
          errors,
          "ownerDetails.lastName",
          `Il cognome non puo superare ${VALIDATION.MAX_NAME_LENGTH} caratteri.`
        );
      } else if (!VALIDATION.TEXT_REGEX.test(lastName)) {
        addError(
          errors,
          "ownerDetails.lastName",
          "Il cognome contiene caratteri non validi."
        );
      }
    }
  }

  if (!isNonEmptyString(owner?.phone)) {
    addError(errors, "ownerDetails.phone", "Il telefono e' obbligatorio.");
  } else if (!VALIDATION.PHONE_REGEX.test(owner.phone.trim())) {
    addError(
      errors,
      "ownerDetails.phone",
      "Inserisci un numero di telefono valido."
    );
  }

  if (owner?.bio && String(owner.bio).length > VALIDATION.MAX_BIO_LENGTH) {
    addError(
      errors,
      "ownerDetails.bio",
      `La bio non puo superare ${VALIDATION.MAX_BIO_LENGTH} caratteri.`
    );
  }
};

const buildStepStatuses = ({ errors, requireOwnerDetails }) => {
  const definitions = buildStepDefinitions({ requireOwnerDetails });
  const stepErrors = definitions.reduce((acc, step) => {
    acc[step.id] = [];
    return acc;
  }, {});

  const errorsWithStep = errors.map((error) => {
    const stepId = resolveStepIdFromField(error.field, definitions);
    if (stepId) {
      stepErrors[stepId].push({ ...error, stepId });
      return { ...error, stepId };
    }
    return error;
  });

  const steps = definitions.map((definition) => {
    const currentErrors = stepErrors[definition.id] || [];
    return {
      id: definition.id,
      name: definition.name,
      required: definition.required,
      completed: currentErrors.length === 0,
      isValid: currentErrors.length === 0,
      errors: currentErrors,
      errorCount: currentErrors.length,
    };
  });

  const reviewStep = steps.find((step) => step.id === "review");
  if (reviewStep) {
    const requiredWithoutReview = steps.filter(
      (step) => step.required && step.id !== "review"
    );
    const reviewCompleted = requiredWithoutReview.every((step) => step.completed);
    reviewStep.completed = reviewCompleted;
    reviewStep.isValid = reviewCompleted;
  }

  const completedSteps = steps.filter((step) => step.completed).length;
  const requiredSteps = steps.filter((step) => step.required);
  const isFormComplete = requiredSteps.every((step) => step.completed);

  const firstIncompleteRequiredIndex = steps.findIndex(
    (step) => step.required && !step.completed
  );
  const currentStepIndex =
    firstIncompleteRequiredIndex === -1
      ? Math.max(steps.length - 1, 0)
      : firstIncompleteRequiredIndex;

  const progressPercentage =
    steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  return {
    steps,
    errors: errorsWithStep,
    completedSteps,
    isFormComplete,
    currentStepIndex,
    progressPercentage,
  };
};

export const ApartmentValidator = {
  /**
   * Valida il form "Pubblica Annuncio" e restituisce uno snapshot completo.
   *
   * Questo metodo e' la singola fonte di verita per:
   * - validazione dei campi (errori campo per campo);
   * - validazione globale pre-pubblicazione;
   * - stato di avanzamento degli step del wizard.
   *
   * @param {object} [apartment={}] - Dati del form appartamento.
   * @param {Array<object>} [rooms=[]] - Stanze del form.
   * @param {object} [options={}] - Opzioni di validazione.
   * @param {boolean} [options.requireOwnerDetails=false] - Se true valida anche ownerDetails.
   * @param {Date} [options.now=new Date()] - Data di riferimento per check sulle disponibilita.
   * @returns {{
   *   isValid: boolean,
   *   errors: Array<{field: string, message: string, stepId?: string}>,
   *   errorsByField: Record<string, string>,
   *   steps: Array<{
   *     id: string,
   *     name: string,
   *     required: boolean,
   *     completed: boolean,
   *     isValid: boolean,
   *     errors: Array<{field: string, message: string, stepId?: string}>,
   *     errorCount: number
   *   }>,
   *   completedSteps: number,
   *   currentStepIndex: number,
   *   progressPercentage: number,
   *   isFormComplete: boolean
   * }}
   */
  validate(apartment = {}, rooms = [], options = {}) {
    const { requireOwnerDetails = false, now = new Date() } = options;
    const errors = [];
    const sourceRooms = Array.isArray(rooms) && rooms.length > 0
      ? rooms
      : apartment?.rooms;
    const safeRooms = Array.isArray(sourceRooms) ? sourceRooms : [];

    if (!isNonEmptyString(apartment?.title)) {
      addError(errors, "title", "Il titolo e' obbligatorio.");
    } else {
      const trimmedTitle = apartment.title.trim();
      if (trimmedTitle.length < VALIDATION.MIN_TITLE_LENGTH) {
        addError(
          errors,
          "title",
          `Il titolo deve avere almeno ${VALIDATION.MIN_TITLE_LENGTH} caratteri.`
        );
      } else if (trimmedTitle.length > VALIDATION.MAX_TITLE_LENGTH) {
        addError(
          errors,
          "title",
          `Il titolo non puo superare ${VALIDATION.MAX_TITLE_LENGTH} caratteri.`
        );
      }
    }

    if (!isNonEmptyString(apartment?.description)) {
      addError(errors, "description", "La descrizione e' obbligatoria.");
    } else {
      const trimmedDescription = apartment.description.trim();
      if (trimmedDescription.length < VALIDATION.MIN_DESCRIPTION_LENGTH) {
        addError(
          errors,
          "description",
          `La descrizione deve avere almeno ${VALIDATION.MIN_DESCRIPTION_LENGTH} caratteri.`
        );
      } else if (trimmedDescription.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
        addError(
          errors,
          "description",
          `La descrizione non puo superare ${VALIDATION.MAX_DESCRIPTION_LENGTH} caratteri.`
        );
      }
    }

    const address = apartment?.address || {};
    if (!isNonEmptyString(address?.street)) {
      addError(errors, "address.street", "La via e' obbligatoria.");
    }
    if (!isNonEmptyString(address?.city)) {
      addError(errors, "address.city", "La citta e' obbligatoria.");
    }
    if (!isNonEmptyString(address?.postalCode)) {
      addError(errors, "address.postalCode", "Il CAP e' obbligatorio.");
    } else if (!VALIDATION.CAP_REGEX.test(address.postalCode.trim())) {
      addError(errors, "address.postalCode", "Il CAP deve contenere 5 cifre.");
    }

    const features = apartment?.features || {};
    const totalAreaMq = toNumber(features?.totalAreaMq);
    if (!Number.isFinite(totalAreaMq) || totalAreaMq < APARTMENTS.MIN_SQUARE_METERS) {
      addError(
        errors,
        "features.totalAreaMq",
        `La superficie totale deve essere almeno ${APARTMENTS.MIN_SQUARE_METERS} mq.`
      );
    } else if (totalAreaMq > APARTMENTS.MAX_SQUARE_METERS) {
      addError(
        errors,
        "features.totalAreaMq",
        `La superficie totale non puo superare ${APARTMENTS.MAX_SQUARE_METERS} mq.`
      );
    }

    const bathroomsCount = toNumber(features?.bathroomsCount);
    if (!Number.isFinite(bathroomsCount) || bathroomsCount < MIN_REQUIRED_BATHROOMS) {
      addError(
        errors,
        "features.bathroomsCount",
        `Indica almeno ${MIN_REQUIRED_BATHROOMS} bagno.`
      );
    } else if (bathroomsCount > APARTMENTS.MAX_BATHROOMS) {
      addError(
        errors,
        "features.bathroomsCount",
        `Il numero di bagni non puo superare ${APARTMENTS.MAX_BATHROOMS}.`
      );
    }

    const requiredSelects = [
      {
        field: "features.heatingType",
        value: features?.heatingType,
        message: "Seleziona il tipo di riscaldamento.",
      },
      {
        field: "features.floor",
        value: features?.floor,
        message: "Seleziona il piano.",
      },
      {
        field: "features.propertyCondition",
        value: features?.propertyCondition,
        message: "Seleziona lo stato dell'immobile.",
      },
      {
        field: "features.garageType",
        value: features?.garageType,
        message: "Seleziona il tipo di garage.",
      },
      {
        field: "features.gardenType",
        value: features?.gardenType,
        message: "Seleziona il tipo di giardino.",
      },
      {
        field: "amenities.kitchenType",
        value: apartment?.amenities?.kitchenType,
        message: "Seleziona il tipo di cucina.",
      },
      {
        field: "houseRules.studentsOnly",
        value: apartment?.houseRules?.studentsOnly,
        message: "Seleziona la tipologia di studenti.",
      },
    ];

    requiredSelects.forEach((item) => {
      if (!isNonEmptyString(item.value)) {
        addError(errors, item.field, item.message);
      }
    });

    const apartmentPhotosCount = getApartmentPhotosCount(apartment);
    if (apartmentPhotosCount < FILES.MIN_COUNT) {
      addError(
        errors,
        "apartmentPhotoFiles",
        `Carica almeno ${FILES.MIN_COUNT} foto dell'appartamento.`
      );
    } else if (apartmentPhotosCount > FILES.MAX_COUNT) {
      addError(
        errors,
        "apartmentPhotoFiles",
        `Puoi caricare al massimo ${FILES.MAX_COUNT} foto dell'appartamento.`
      );
    }

    if (safeRooms.length < APARTMENTS.MIN_ROOMS) {
      addError(errors, "rooms", "Inserisci almeno una stanza.");
    } else if (safeRooms.length > APARTMENTS.MAX_ROOMS) {
      addError(
        errors,
        "rooms",
        `Non puoi inserire piu di ${APARTMENTS.MAX_ROOMS} stanze.`
      );
    }

    safeRooms.forEach((room, index) => {
      const roomValidation = RoomValidator.validate(room, { index, now });
      if (!roomValidation.isValid) {
        roomValidation.errors.forEach((roomError) => {
          addError(errors, roomError.field, roomError.message);
        });
      }
    });

    const aggregates = ApartmentAggregateCalculator.calculate(safeRooms);
    if (
      Number.isFinite(totalAreaMq) &&
      aggregates.roomsAreaTotalMq > totalAreaMq
    ) {
      addError(
        errors,
        "rooms",
        "La somma delle superfici delle stanze supera l'area totale dell'appartamento."
      );
    }

    if (apartment?.aggregates) {
      const stored = apartment.aggregates;
      if (
        stored.minRoomPrice != null &&
        stored.minRoomPrice !== aggregates.minRoomPrice
      ) {
        addError(
          errors,
          "aggregates.minRoomPrice",
          "minRoomPrice non coerente con le stanze."
        );
      }
      if (
        stored.maxRoomPrice != null &&
        stored.maxRoomPrice !== aggregates.maxRoomPrice
      ) {
        addError(
          errors,
          "aggregates.maxRoomPrice",
          "maxRoomPrice non coerente con le stanze."
        );
      }
      if (
        stored.totalRooms != null &&
        stored.totalRooms !== aggregates.totalRooms
      ) {
        addError(
          errors,
          "aggregates.totalRooms",
          "totalRooms non coerente con le stanze."
        );
      }
      if (
        stored.totalRoomsAvailable != null &&
        stored.totalRoomsAvailable !== aggregates.totalRoomsAvailable
      ) {
        addError(
          errors,
          "aggregates.totalRoomsAvailable",
          "totalRoomsAvailable non coerente con le stanze."
        );
      }
      if (
        stored.isAvailableNow != null &&
        stored.isAvailableNow !== aggregates.isAvailableNow
      ) {
        addError(
          errors,
          "aggregates.isAvailableNow",
          "isAvailableNow non coerente con le stanze."
        );
      }
      if (
        stored.availableFromMin != null &&
        !sameDate(stored.availableFromMin, aggregates.availableFromMin)
      ) {
        addError(
          errors,
          "aggregates.availableFromMin",
          "availableFromMin non coerente con le stanze."
        );
      }
    }

    if (requireOwnerDetails) {
      validateOwnerDetails(apartment, errors);
    }

    const stepSnapshot = buildStepStatuses({
      errors,
      requireOwnerDetails,
    });

    const errorsByField = getErrorsByField(stepSnapshot.errors);

    return {
      isValid: stepSnapshot.errors.length === 0,
      errors: stepSnapshot.errors,
      errorsByField,
      steps: stepSnapshot.steps,
      completedSteps: stepSnapshot.completedSteps,
      currentStepIndex: stepSnapshot.currentStepIndex,
      progressPercentage: stepSnapshot.progressPercentage,
      isFormComplete: stepSnapshot.isFormComplete,
    };
  },
};
