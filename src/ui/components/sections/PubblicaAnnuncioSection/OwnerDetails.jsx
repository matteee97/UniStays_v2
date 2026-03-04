import WhiteContainer from "@/ui/components/common/containers/WhiteContainer";
import FormInput from "@/ui/components/common/form/FormInput";
import Checkbox from "@/ui/components/common/form/Checkbox";
import TextAreaEditor from "@/ui/components/common/form/TextAreaEditor";
import { VALIDATION } from "@/shared/types";

export default function OwnerDetailsForm({
  isAgency,
  data,
  onChange,
  onBlur,
  hasFieldError,
  getFieldError,
}) {
  return (
    <WhiteContainer className={"space-y-6"}>
      <Checkbox
        label="Sei un'agenzia?"
        name="ownerDetails.isAgency"
        checked={isAgency}
        onChange={onChange}
      />

      <FormInput
        name="ownerDetails.firstName"
        value={data.firstName}
        placeholder={isAgency ? "Nome Agenzia *" : "Nome proprietario *"}
        onChange={onChange}
        onBlur={onBlur}
        hasFieldError={hasFieldError("ownerDetails.firstName")}
        data-error={hasFieldError("ownerDetails.firstName")}
        required
      />
      {hasFieldError("ownerDetails.firstName") && (
        <p className="text-red-500 text-sm mt-1">
          {getFieldError("ownerDetails.firstName")}
        </p>
      )}

      {!isAgency && (
        <>
          <FormInput
            name="ownerDetails.lastName"
            value={data.lastName}
            placeholder="Cognome proprietario *"
            onChange={onChange}
            onBlur={onBlur}
            required
            data-error={hasFieldError("ownerDetails.lastName")}
            hasFieldError={hasFieldError("ownerDetails.lastName")}
          />
          {hasFieldError("ownerDetails.lastName") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("ownerDetails.lastName")}
            </p>
          )}
        </>
      )}

      <FormInput
        name="ownerDetails.phone"
        type="tel"
        value={data.phone}
        placeholder={
          isAgency ? "Telefono agenzia *" : "Telefono proprietario *"
        }
        onChange={onChange}
        onBlur={onBlur}
        required
        data-error={hasFieldError("ownerDetails.phone")}
        hasFieldError={hasFieldError("ownerDetails.phone")}
      />
      {hasFieldError("ownerDetails.phone") && (
        <p className="text-red-500 text-sm mt-1">
          {getFieldError("ownerDetails.phone")}
        </p>
      )}

      <TextAreaEditor
        id="ownerDetails.bio"
        name="ownerDetails.bio"
        label="Bio"
        helper="Racconta qualcosa su di te o sulla tua agenzia (opzionale)."
        value={data.bio}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Scrivi una breve bio per presentarti agli studenti"
        rows={3}
        expandedRows={6}
        maxLength={VALIDATION.MAX_BIO_LENGTH}
        hasError={hasFieldError("ownerDetails.bio")}
        errorMessage={getFieldError("ownerDetails.bio")}
      />
    </WhiteContainer>
  );
}
