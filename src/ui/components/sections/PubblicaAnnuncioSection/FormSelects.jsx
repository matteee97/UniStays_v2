import React from "react";
import FormSelect from "@/ui/components/common/form/FormSelect";

const FormSelects = ({
  formData,
  handleChange,
  hasFieldError,
  getFieldError,
}) => {
  const safeGetFieldError =
    typeof getFieldError === "function" ? getFieldError : () => null;
  const safeHasFieldError =
    typeof hasFieldError === "function" ? hasFieldError : () => false;

  return (
    <>
      <FormSelect
        id={"riscaldamento"}
        name="features.heatingType"
        options={["centralizzato", "autonomo"]}
        value={formData.features.heatingType}
        onChange={handleChange}
        label="Seleziona tipo di riscaldamento"
        required={true}
        minWidth={"min-w-44"}
        hasFieldError={safeHasFieldError("features.heatingType")}
      />
      {safeGetFieldError("features.heatingType") && (
        <p className="text-red-500 text-sm mt-1">
          {safeGetFieldError("features.heatingType")}
        </p>
      )}
      <FormSelect
        id={"piano"}
        name="features.floor"
        options={Array.from({ length: 11 }, (_, i) => i.toString())}
        value={formData.features.floor}
        onChange={handleChange}
        label="Seleziona piano"
        required={true}
        minWidth={"min-w-44"}
        hasFieldError={safeHasFieldError("features.floor")}
      />
      {safeGetFieldError("features.floor") && (
        <p className="text-red-500 text-sm mt-1">
          {safeGetFieldError("features.floor")}
        </p>
      )}
      <FormSelect
        id={"stato_immobile"}
        name="features.propertyCondition"
        options={["nuovo", "ristrutturato", "da ristrutturare", "abitabile"]}
        value={formData.features.propertyCondition}
        onChange={handleChange}
        label="Stato immobile"
        required={true}
        minWidth={"min-w-44"}
        hasFieldError={safeHasFieldError("features.propertyCondition")}
      />
      {safeGetFieldError("features.propertyCondition") && (
        <p className="text-red-500 text-sm mt-1">
          {safeGetFieldError("features.propertyCondition")}
        </p>
      )}
      <FormSelect
        id={"garage"}
        name="features.garageType"
        options={["non presente", "singolo", "doppio"]}
        value={formData.features.garageType}
        onChange={handleChange}
        label="Garage"
        required={true}
        minWidth={"min-w-44"}
        hasFieldError={safeHasFieldError("features.garageType")}
      />
      {safeGetFieldError("features.garageType") && (
        <p className="text-red-500 text-sm mt-1">
          {safeGetFieldError("features.garageType")}
        </p>
      )}
      <FormSelect
        id={"giardino"}
        name="features.gardenType"
        options={["non presente", "privato", "condominiale"]}
        value={formData.features.gardenType}
        onChange={handleChange}
        label="Giardino"
        required={true}
        minWidth={"min-w-44"}
        hasFieldError={safeHasFieldError("features.gardenType")}
      />
      {safeGetFieldError("features.gardenType") && (
        <p className="text-red-500 text-sm mt-1">
          {safeGetFieldError("features.gardenType")}
        </p>
      )}
      <FormSelect
        id={"solo_studenti"}
        name="houseRules.studentsOnly"
        options={["tutti", "maschi", "femmine"]}
        value={formData.houseRules.studentsOnly}
        onChange={handleChange}
        label="Seleziona solo studenti"
        required={true}
        minWidth={"min-w-44"}
        hasFieldError={safeHasFieldError("houseRules.studentsOnly")}
      />
      {safeGetFieldError("houseRules.studentsOnly") && (
        <p className="text-red-500 text-sm mt-1">
          {safeGetFieldError("houseRules.studentsOnly")}
        </p>
      )}
      <FormSelect
        id={"cucina"}
        name="amenities.kitchenType"
        options={["angolo cottura", "separata", "nessuna"]}
        value={formData.amenities.kitchenType}
        onChange={handleChange}
        label="Tipo di cucina"
        required={true}
        minWidth={"min-w-44"}
        hasFieldError={safeHasFieldError("amenities.kitchenType")}
      />
      {safeGetFieldError("amenities.kitchenType") && (
        <p className="text-red-500 text-sm mt-1">
          {safeGetFieldError("amenities.kitchenType")}
        </p>
      )}
    </>
  );
};

export default FormSelects;
