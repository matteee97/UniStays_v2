import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import FormSection from "../FormSection";
import OwnerDetails from "../OwnerDetails";
import LoadingIcon from "@/ui/components/common/shared/icons/loadingIcon";
import OneTimeMessage from "@/ui/components/common/messages/OneTimeMessage";
import { USER_ROLES } from "@/shared/types";

const OwnerSection = ({
  getOwnerInfo,
  formData,
  handleChange,
  handleBlur,
  hasFieldError,
  getFieldError,
}) => {
  if (getOwnerInfo === null) {
    return <LoadingIcon />;
  }

  if (!getOwnerInfo) {
    return null;
  }

  return (
    <FormSection
      title={`Dettagli ${USER_ROLES.HOST.toLowerCase()}`}
      description="Informazioni sul proprietario o agenzia"
      icon={<FontAwesomeIcon icon={faUser} />}
    >
      <OneTimeMessage
        message={
          "Le informazioni inserite in questa sezione verranno utilizzate per mostrare i dati su di te (proprietario o agenzia) nella pagina dei tuoi annunci. Gli stessi dati saranno riutilizzati anche per i tuoi annunci futuri e non sarà possibile modificarli in seguito."
        }
        title={"Attenzione"}
        localStorageKey={"owner-section-tip"}
        disableOutsideClick
      />
      <OwnerDetails
        isAgency={formData.ownerDetails.isAgency}
        data={formData.ownerDetails}
        onChange={handleChange}
        onBlur={handleBlur}
        hasFieldError={hasFieldError}
        getFieldError={getFieldError}
      />
    </FormSection>
  );
};

export default OwnerSection;
