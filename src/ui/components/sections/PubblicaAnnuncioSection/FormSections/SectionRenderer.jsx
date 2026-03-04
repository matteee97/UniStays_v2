import React from "react";
import BasicInfoSection from "./BasicInfoSection";
import CharacteristicsSection from "./CharacteristicsSection";
import AddressSection from "./AddressSection";
import OwnerSection from "./OwnerSection";
import ImagesSection from "./ImagesSection";
import RoomsSection from "./RoomsSection";

/**
 * Componente per renderizzare la sezione corrente del form
 */
const SectionRenderer = ({
  currentStepId,
  formData,
  setFormData,
  handleChange,
  handleBlur,
  cityHandle,
  showTips,
  getFieldError,
  hasFieldError,
  getOwnerInfo,
}) => {
  switch (currentStepId) {
    case "owner":
      return (
        <OwnerSection
          getOwnerInfo={getOwnerInfo}
          formData={formData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          hasFieldError={hasFieldError}
          getFieldError={getFieldError}
        />
      );

    case "basic":
      return (
        <BasicInfoSection
          formData={formData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          showTips={showTips}
          getFieldError={getFieldError}
          hasFieldError={hasFieldError}
        />
      );

    case "characteristics":
      return (
        <CharacteristicsSection
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          showTips={showTips}
          getFieldError={getFieldError}
          hasFieldError={hasFieldError}
        />
      );

    case "address":
      return (
        <AddressSection
          formData={formData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          cityHandle={cityHandle}
          showTips={showTips}
          getFieldError={getFieldError}
          hasFieldError={hasFieldError}
        />
      );

    case "details":
      return (
        <CharacteristicsSection
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          showTips={showTips}
        />
      );

    case "rooms":
      return (
        <RoomsSection
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          showTips={showTips}
          getFieldError={getFieldError}
          hasFieldError={hasFieldError}
        />
      );

    case "images":
      return (
        <ImagesSection
          formData={formData}
          handleChange={handleChange}
          handleBlur={handleBlur}
          showTips={showTips}
          getFieldError={getFieldError}
        />
      );

    case "review":
      return (
        <div className="bg-white rounded-2xl p-6 border-2 border-[#d4f1ef] shadow-lg">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Pronto a pubblicare il tuo annuncio?
            </h3>
            <p className="text-gray-600 text-sm">
              Verifica che tutti i campi obbligatori siano compilati
              correttamente
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default SectionRenderer;
