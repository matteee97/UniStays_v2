import React from "react";
import Checkbox from "@/ui/components/common/form/Checkbox";

const CheckBoxes = ({ formData, handleChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-2">
      <Checkbox
        label={"Parcheggio"}
        name="amenities.parking"
        checked={formData.amenities.parking}
        onChange={handleChange}
      />
      <Checkbox
        label={"Aria condizionata"}
        name="amenities.airConditioning"
        checked={formData.amenities.airConditioning}
        onChange={handleChange}
      />
      <Checkbox
        label={"Utenze incluse"}
        name="features.utilitiesIncluded"
        checked={formData.features.utilitiesIncluded}
        onChange={handleChange}
      />
      <Checkbox
        label={"Wi-fi"}
        name="amenities.wifi"
        checked={formData.amenities.wifi}
        onChange={handleChange}
      />
      <Checkbox
        label={"Ascensore"}
        name="amenities.elevator"
        checked={formData.amenities.elevator}
        onChange={handleChange}
      />
      <Checkbox
        label={"Lavatrice"}
        name="amenities.washer"
        checked={formData.amenities.washer}
        onChange={handleChange}
      />
      <Checkbox
        label={"Balcone"}
        name="amenities.balcony"
        checked={formData.amenities.balcony}
        onChange={handleChange}
      />
      <Checkbox
        label={"Servizi base per cucinare"}
        name="amenities.kitchenBasics"
        checked={formData.amenities.kitchenBasics}
        onChange={handleChange}
      />
      <Checkbox
        label={"Piatti posate in cucina"}
        name="amenities.kitchenware"
        checked={formData.amenities.kitchenware}
        onChange={handleChange}
      />
      <Checkbox
        label={"Lavastoviglie"}
        name="amenities.dishwasher"
        checked={formData.amenities.dishwasher}
        onChange={handleChange}
      />
      <Checkbox
        label={"Forno normale"}
        name="amenities.oven"
        checked={formData.amenities.oven}
        onChange={handleChange}
      />
      <Checkbox
        label={"TV"}
        name="amenities.tv"
        checked={formData.amenities.tv}
        onChange={handleChange}
      />
      <Checkbox
        label={"Scrivania in camera"}
        name="amenities.deskInRoom"
        checked={formData.amenities.deskInRoom}
        onChange={handleChange}
      />
      <Checkbox
        label={"Asciugatrice"}
        name="amenities.dryer"
        checked={formData.amenities.dryer}
        onChange={handleChange}
      />
      <Checkbox
        label={"Microonde"}
        name="amenities.microwave"
        checked={formData.amenities.microwave}
        onChange={handleChange}
      />
      <Checkbox
        label={"Animali ammessi"}
        name="houseRules.petsAllowed"
        checked={formData.houseRules.petsAllowed}
        onChange={handleChange}
      />
      <Checkbox
        label={"Fumatori ammessi"}
        name="houseRules.smokingAllowed"
        checked={formData.houseRules.smokingAllowed}
        onChange={handleChange}
      />
      <Checkbox
        label={"Feste vietate"}
        name="houseRules.partiesForbidden"
        checked={formData.houseRules.partiesForbidden}
        onChange={handleChange}
      />
    </div>
  );
};

export default CheckBoxes;
