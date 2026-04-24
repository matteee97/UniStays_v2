import { InfoSectionCard, InfoSectionHeader } from "../InfoSection";

export default function ApartmentAdditionalInfoSection({ additionalInfo }) {
  return (
    <InfoSectionCard id="section-informazioni-aggiuntive" variant="gradient">
      <InfoSectionHeader className="mb-3" title="Informazioni aggiuntive" />
      {additionalInfo ? (
        <pre className="whitespace-pre-line text-sm leading-relaxed text-gray-600 text-muted-foreground">
          {additionalInfo}
        </pre>
      ) : (
        <p className="text-sm text-gray-500">
          Non sono state fornite informazioni aggiuntive.
        </p>
      )}
    </InfoSectionCard>
  );
}
