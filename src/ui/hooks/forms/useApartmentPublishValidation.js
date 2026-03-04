import { useCallback, useEffect, useMemo, useState } from "react";
import { ApartmentValidator } from "@/core/services/ApartmentValidator";

/**
 * Adapter UI per la validazione del form pubblica annuncio.
 * Mantiene lo stato "touched/errors" ma delega tutte le regole al validatore centrale.
 *
 * @param {object} params - Parametri hook.
 * @param {object} params.formData - Dati correnti del form.
 * @param {boolean} [params.requireOwnerDetails=false] - Se true richiede validazione owner.
 * @returns {{
 *   result: object,
 *   errors: Record<string, string>,
 *   touched: Record<string, boolean>,
 *   isValid: boolean,
 *   hasVisibleErrors: boolean,
 *   validateAll: () => boolean,
 *   validateSingleField: (fieldName: string) => boolean,
 *   touchField: (fieldName: string) => void,
 *   clearErrors: () => void,
 *   clearFieldError: (fieldName: string) => void,
 *   getFieldError: (fieldName: string) => string | null,
 *   hasFieldError: (fieldName: string) => boolean,
 *   getFirstError: () => {field: string, message: string, stepId?: string} | null
 * }}
 */
export const useApartmentPublishValidation = ({
  formData,
  requireOwnerDetails = false,
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const result = useMemo(
    () =>
      ApartmentValidator.validate(formData, formData?.rooms, {
        requireOwnerDetails,
      }),
    [formData, requireOwnerDetails]
  );

  useEffect(() => {
    const touchedFields = Object.keys(touched).filter((field) => touched[field]);
    if (touchedFields.length === 0) return;

    setErrors((previousErrors) => {
      let hasChanges = false;
      const nextErrors = { ...previousErrors };

      touchedFields.forEach((fieldName) => {
        const nextMessage = result.errorsByField[fieldName];
        if (!nextMessage && fieldName in nextErrors) {
          delete nextErrors[fieldName];
          hasChanges = true;
          return;
        }
        if (nextMessage && nextErrors[fieldName] !== nextMessage) {
          nextErrors[fieldName] = nextMessage;
          hasChanges = true;
        }
      });

      return hasChanges ? nextErrors : previousErrors;
    });
  }, [result.errorsByField, touched]);

  const touchField = useCallback((fieldName) => {
    if (!fieldName) return;
    setTouched((previous) => ({
      ...previous,
      [fieldName]: true,
    }));
  }, []);

  const validateSingleField = useCallback(
    (fieldName) => {
      if (!fieldName) return true;
      const message = result.errorsByField[fieldName] || null;
      setErrors((previous) => {
        const nextErrors = { ...previous };
        if (!message) {
          if (!(fieldName in nextErrors)) {
            return previous;
          }
          delete nextErrors[fieldName];
          return nextErrors;
        }
        nextErrors[fieldName] = message;
        return nextErrors;
      });
      return !message;
    },
    [result.errorsByField]
  );

  const validateAll = useCallback(() => {
    const nextErrors = result.errorsByField || {};
    setErrors(nextErrors);

    const nextTouched = {};
    Object.keys(nextErrors).forEach((fieldName) => {
      nextTouched[fieldName] = true;
    });
    setTouched((previous) => ({
      ...previous,
      ...nextTouched,
    }));

    return result.isValid;
  }, [result.errorsByField, result.isValid]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    if (!fieldName) return;
    setErrors((previous) => {
      if (!(fieldName in previous)) return previous;
      const nextErrors = { ...previous };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }, []);

  const isValid = result.isValid;

  const hasVisibleErrors = useMemo(
    () =>
      Object.keys(errors).some(
        (fieldName) => touched[fieldName] && Boolean(errors[fieldName])
      ),
    [errors, touched]
  );

  const getFieldError = useCallback(
    (fieldName) => (touched[fieldName] ? errors[fieldName] || null : null),
    [errors, touched]
  );

  const hasFieldError = useCallback(
    (fieldName) => Boolean(touched[fieldName] && errors[fieldName]),
    [errors, touched]
  );

  const getFirstError = useCallback(
    () => (Array.isArray(result.errors) && result.errors.length > 0 ? result.errors[0] : null),
    [result.errors]
  );

  return {
    result,
    errors,
    touched,
    isValid,
    hasVisibleErrors,
    validateAll,
    validateSingleField,
    touchField,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
    getFirstError,
  };
};
