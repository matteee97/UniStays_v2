import { Link } from "react-router-dom";
import { USER_ROLES } from "@/shared/types";
import { InfoSectionCard } from "../InfoSection";

export default function ApartmentHostSummaryCard({
  host,
  hostPhotoUrl,
  ownerId,
  isAgency,
}) {
  return (
    <InfoSectionCard
      as={Link}
      to={ownerId ? `/host/${ownerId}` : "#"}
      className="flex items-center gap-4"
    >
      {hostPhotoUrl ? (
        <img
          src={hostPhotoUrl}
          alt="immagine profilo proprietario o agenzia"
          className="h-14 w-14 rounded-full border-2 border-[#228E8D] object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#228E8D]/30 bg-[#228E8D]/10 text-lg font-semibold text-[#228E8D]">
          {host?.displayName?.[0]?.toUpperCase() || "H"}
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#228E8D]">
          {isAgency ? "Agenzia" : "Host"}
        </p>
        <p className="text-lg font-semibold text-gray-800">
          {host?.displayName || "Informazioni non presenti"}
        </p>
        <p className="text-xs text-gray-400">
          Contatta l&apos;{USER_ROLES.HOST} per dettagli su visite, contratti e
          disponibilità.
        </p>
      </div>
    </InfoSectionCard>
  );
}
