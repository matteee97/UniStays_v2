import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import FormSection from "../FormSection";
import AddressFields from "@/ui/components/common/form/AddressFields";
import FormTips from "../FormTips";

const AddressSection = ({
  formData,
  handleChange,
  handleBlur,
  cityHandle,
  showTips,
  getFieldError,
  hasFieldError,
}) => {
  return (
    <FormSection
      title="Indirizzo e posizione"
      description="Inserisci l'indirizzo completo per facilitare la ricerca"
      icon={<FontAwesomeIcon icon={faLocationDot} />}
      required={true}
    >
      <AddressFields
        onChange={handleChange}
        onBlur={handleBlur}
        cityHandle={cityHandle}
        addressData={formData.address}
        className={`w-full px-4 py-3 text-gray-700 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-[#228E8D] ${
          hasFieldError("address.street") ||
          hasFieldError("address.city") ||
          hasFieldError("address.postalCode")
            ? "border-red-300 focus:ring-1 focus:ring-red-500"
            : "border-[#D4F1EF] focus:ring-[#228E8D]"
        }`}
      />
      {(getFieldError("address.street") ||
        getFieldError("address.city") ||
        getFieldError("address.postalCode")) && (
        <div className="text-red-500 text-sm mt-1 space-y-1">
          {getFieldError("address.street") && (
            <p>{getFieldError("address.street")}</p>
          )}
          {getFieldError("address.city") && (
            <p>{getFieldError("address.city")}</p>
          )}
          {getFieldError("address.postalCode") && (
            <p>{getFieldError("address.postalCode")}</p>
          )}
        </div>
      )}

      {showTips && <FormTips currentSection="address" />}
    </FormSection>
  );
};

export default AddressSection;
