import React from "react";
import FormSection from "../FormSection";
import FormSelects from "../FormSelects";
import CheckBoxes from "../CheckBoxes";
import FormInput from "@/ui/components/common/form/FormInput";
import FormTips from "../FormTips";

const DetailsSection = ({ formData, handleChange, handleBlur, showTips }) => {
  return (
    <FormSection
      title="Dettagli e caratteristiche"
      description="Seleziona le caratteristiche e i servizi disponibili"
    >
      <FormSelects
        formData={formData}
        handleChange={handleChange}
        onBlur={handleBlur}
      />
      <CheckBoxes formData={formData} handleChange={handleChange} />

      <FormInput
        name="additionalInfo"
        value={formData.additionalInfo}
        placeholder="Altre informazioni (opzionale)"
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {showTips && <FormTips currentSection="details" />}
    </FormSection>
  );
};

export default DetailsSection;
