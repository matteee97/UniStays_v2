import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRulerCombined, faBath } from "@fortawesome/free-solid-svg-icons";
import FormSection from "../FormSection";
import RangeSliders from "../RangeSliders";
import CounterBox from "@/ui/components/common/form/CounterBox";
import FormSelects from "../FormSelects";
import CheckBoxes from "../CheckBoxes";
import FormInput from "@/ui/components/common/form/FormInput";
import FormTips from "../FormTips";
import { APARTMENTS } from "@/shared/types";
import RangeSlider from "@/ui/components/common/form/RangeSlider";

const CharacteristicsSection = ({
  formData,
  setFormData,
  handleChange,
  handleBlur,
  showTips,
  shadow = true,
  getFieldError,
  hasFieldError,
}) => {
  return (
    <FormSection
      title="Caratteristiche e dettagli"
      description="Specifica dimensioni, bagni, caratteristiche e servizi disponibili"
      icon={<FontAwesomeIcon icon={faRulerCombined} />}
      required={true}
      shadow={shadow}
    >
      <div className="space-y-8">
        <RangeSlider
          text={"Superficie totale:"}
          simbol={"mq"}
          value={formData.features.totalAreaMq}
          minValue={0}
          maxValue={APARTMENTS.MAX_SQUARE_METERS}
          onChange={(e) => {
            const val = Number(e.target.value);
            setFormData((prev) => ({
              ...prev,
              features: { ...prev.features, totalAreaMq: val },
            }));
          }}
          showValue
        />
        {getFieldError("features.totalAreaMq") && (
          <p className="text-red-500 text-sm mt-1">
            {getFieldError("features.totalAreaMq")}
          </p>
        )}

        <CounterBox
          label="Bagni"
          innerText="bagni"
          icon={<FontAwesomeIcon icon={faBath} />}
          value={formData.features.bathroomsCount}
          setValue={(valueOrFn) => {
            const newValue =
              typeof valueOrFn === "function"
                ? valueOrFn(formData.features.bathroomsCount)
                : valueOrFn;
            setFormData((prev) => ({
              ...prev,
              features: {
                ...prev.features,
                bathroomsCount: newValue,
              },
            }));
          }}
          maxValue={APARTMENTS.MAX_BATHROOMS}
        />
        {hasFieldError("features.bathroomsCount") && (
          <p className="text-red-500 text-sm mt-1">
            {getFieldError("features.bathroomsCount")}
          </p>
        )}

        <div className="space-y-2">
          <FormSelects
            formData={formData}
            handleChange={handleChange}
            onBlur={handleBlur}
            hasFieldError={hasFieldError}
            getFieldError={getFieldError}
          />
        </div>
        <div>
          <CheckBoxes formData={formData} handleChange={handleChange} />
        </div>

        <FormInput
          name="additionalInfo"
          value={formData.additionalInfo}
          placeholder="Altre informazioni (opzionale)"
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {showTips && <FormTips currentSection="characteristics" />}
      </div>
    </FormSection>
  );
};

export default CharacteristicsSection;
