import { useCitiesByLetter } from "@/ui/hooks";
import WhiteContainer from "../containers/WhiteContainer";

import ButtonDropDown from "../buttons/buttonDropDown/ButtonDropDown";

export default function AddressFields({
  onChange,
  onBlur,
  cityHandle,
  className,
  addressData,
}) {
  const {
    groups: cities,
    loading: citiesLoading,
    error: citiesError,
  } = useCitiesByLetter();
  return (
    <WhiteContainer className={"space-y-4 rounded-xl"}>
      <ButtonDropDown
        onCitySelect={cityHandle}
        citiesByLetter={cities}
        startingWord="Seleziona città *"
        className="w-full bg-transparent text-gray-700 border-2 border-[#D4F1EF] rounded-xl shadow-none px-4 focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
        disabled={citiesLoading || !!citiesError}
        rememberPreferredCity={false}
        syncWithRedux={false}
      />
      {citiesError && (
        <p className="text-sm text-red-600">
          Errore nel caricamento città. Riprovare più tardi.
        </p>
      )}
      <label htmlFor="via" className="sr-only">
        Via *
      </label>
      <input
        id="via"
        name="address.street"
        type="text"
        value={addressData.street}
        placeholder="Via *"
        autoComplete="street-address"
        onChange={onChange}
        onBlur={onBlur}
        className={className}
        required
      />
      <label htmlFor="cap" className="sr-only">
        CAP *
      </label>
      <input
        id="cap"
        name="address.postalCode"
        type="text"
        value={addressData.postalCode}
        placeholder="CAP *"
        autoComplete="postal-code"
        onChange={onChange}
        onBlur={onBlur}
        className={className}
        required
      />
      <label htmlFor="zona" className="sr-only">
        Zona (es. centro città) *
      </label>
      <input
        id="zona"
        name="address.area"
        type="text"
        value={addressData.area}
        placeholder="Zona (es. centro città) *"
        autoComplete="address-level2"
        onChange={onChange}
        onBlur={onBlur}
        className={className}
        required
      />
    </WhiteContainer>
  );
}
