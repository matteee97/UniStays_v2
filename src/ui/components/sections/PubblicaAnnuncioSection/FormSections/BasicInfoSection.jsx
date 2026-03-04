import React from "react";
import FormSection from "../FormSection";
import FormInput from "@/ui/components/common/form/FormInput";
import FormTips from "../FormTips";
import TextAreaEditor from "@/ui/components/common/form/TextAreaEditor";
import { VALIDATION } from "@/shared/types";

const BasicInfoSection = ({
  formData,
  handleChange,
  handleBlur,
  showTips,
  getFieldError,
  hasFieldError,
}) => {
  return (
    <FormSection
      title="Informazioni base"
      description="Inizia con il titolo e la descrizione del tuo alloggio"
      required={true}
    >
      <FormInput
        name="title"
        value={formData.title}
        placeholder="Titolo dell'annuncio *"
        onChange={handleChange}
        onBlur={handleBlur}
        required={true}
        data-error={hasFieldError("title")}
        hasFieldError={hasFieldError("title")}
      />
      {getFieldError("title") && (
        <p className="text-red-500 text-sm mt-1">{getFieldError("title")}</p>
      )}

      <TextAreaEditor
        id="description"
        name="description"
        label="Descrizione"
        helper="Aggiungi dettagli utili: servizi, regole, trasporti, spazi."
        value={formData.description}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Descrivi il tuo alloggio in dettaglio *"
        rows={4}
        expandedRows={9}
        maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
        hasError={hasFieldError("description")}
        errorMessage={getFieldError("description")}
      />

      {showTips && <FormTips currentSection="general" />}
    </FormSection>
  );
};

export default BasicInfoSection;
