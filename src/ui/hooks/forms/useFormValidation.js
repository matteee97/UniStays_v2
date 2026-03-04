import { useState, useCallback, useMemo } from 'react';
import { ERROR_MESSAGES, VALIDATION } from '@/shared/types';

/**
 * Hook per gestire la validazione del form in modo modulare
 * @param {Object} validationRules - Regole di validazione
 * @param {Object} formData - Dati del form da validare
 * @returns {Object} Oggetto con metodi e stato di validazione
 */
export const useFormValidation = (validationRules, formData) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Valida un singolo campo
  const validateField = useCallback((fieldName, value, rules = validationRules[fieldName]) => {
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule.validator(value, formData);
      if (error) {
        return error;
      }
    }
    return null;
  }, [validationRules, formData]);

  // Valida tutti i campi
  const validateAll = useCallback(() => {
    const newErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const fieldValue = getNestedValue(formData, fieldName);
      const error = validateField(fieldName, fieldValue);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, formData, validateField]);

  // Valida un campo specifico e aggiorna lo stato
  const validateSingleField = useCallback((fieldName) => {
    const fieldValue = getNestedValue(formData, fieldName);
    const error = validateField(fieldName, fieldValue);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return !error;
  }, [formData, validateField]);

  // Marca un campo come "toccato"
  const touchField = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  // Pulisce gli errori
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Pulisce l'errore di un singolo campo
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Controlla se il form è valido
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Controlla se ci sono errori visibili (campo toccato con errore)
  const hasVisibleErrors = useMemo(() => {
    return Object.keys(errors).some(fieldName => touched[fieldName] && errors[fieldName]);
  }, [errors, touched]);

  return {
    errors,
    touched,
    isValid,
    hasVisibleErrors,
    validateAll,
    validateSingleField,
    validateField,
    touchField,
    clearErrors,
    clearFieldError,
    getFieldError: (fieldName) => touched[fieldName] ? errors[fieldName] : null,
    hasFieldError: (fieldName) => !!(touched[fieldName] && errors[fieldName])
  };
};

// Helper per ottenere valori annidati dall'oggetto
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Validatori comuni
export const validators = {
  required: (message = ERROR_MESSAGES.REQUIRED) => ({
    validator: (value) => {
      if (typeof value === 'string') {
        return !value.trim() ? message : null;
      }
      return !value ? message : null;
    }
  }),

  minLength: (min, message) => ({
    validator: (value) => {
      if (!value) return null; // Skip se vuoto (usa required per questo)
      return value.length < min ? (message || ERROR_MESSAGES.MIN_LENGTH(min)) : null;
    }
  }),

  maxLength: (max, message) => ({
    validator: (value) => {
      if (!value) return null;
      return value.length > max ? (message || ERROR_MESSAGES.MAX_LENGTH(max)) : null;
    }
  }),

  email: (message = ERROR_MESSAGES.EMAIL) => ({
    validator: (value) => {
      if (!value) return null;
      return !VALIDATION.EMAIL_REGEX.test(value) ? message : null;
    }
  }),

  numeric: (message = ERROR_MESSAGES.NUMERIC) => ({
    validator: (value) => {
      if (!value) return null;
      return isNaN(value) ? message : null;
    }
  }),

  min: (min, message) => ({
    validator: (value) => {
      if (!value) return null;
      const numValue = Number(value);
      return numValue < min ? (message || ERROR_MESSAGES.MIN(min)) : null;
    }
  }),

  max: (max, message) => ({
    validator: (value) => {
      if (!value) return null;
      const numValue = Number(value);
      return numValue > max ? (message || ERROR_MESSAGES.MAX(max)) : null;
    }
  }),

  arrayMinLength: (min, message) => ({
    validator: (value) => {
      if (!Array.isArray(value)) return null;
      return value.length < min ? (message || ERROR_MESSAGES.MIN_ARRAY_LENGTH(min)) : null;
    }
  }),

  arrayMaxLength: (max, message) => ({
    validator: (value) => {
      if (!Array.isArray(value)) return null;
      return value.length > max ? (message || ERROR_MESSAGES.MAX_ARRAY_LENGTH(max)) : null;
    }
  }),

  custom: (validatorFn, message) => ({
    validator: (value, formData, additionalData) => {
      return validatorFn(value, formData, additionalData) ? null : message;
    }
  }),

  pattern: (regex, message) => ({
    validator: (value) => {
      if (!value) return null;
      return !regex.test(value) ? message : null;
    }
  })
};
