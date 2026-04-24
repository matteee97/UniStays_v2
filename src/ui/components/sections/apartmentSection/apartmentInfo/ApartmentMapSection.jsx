import GoogleMapComponent from "@/ui/components/common/mapComponents/GoogleMapComponent";
import InfoToggle from "@/ui/components/common/indicators/InfoToggle";
import { USER_ROLES } from "@/shared/types";
import { InfoSectionCard } from "../InfoSection";

export default function ApartmentMapSection({ app }) {
  return (
    <InfoSectionCard
      id="section-posizione"
      variant="bare"
      className="relative h-[300px] w-full overflow-hidden md:h-[500px]"
    >
      <GoogleMapComponent appartamenti={[app]} zoom={14} isSingle={true} />
      <InfoToggle title="Info mappa" className="absolute left-3 top-3 max-w-xs">
        <ul className="list-inside list-disc space-y-1">
          <li>
            La posizione indicata è approssimata e potrebbe non corrispondere
            all&apos;indirizzo esatto dell&apos;alloggio.
          </li>
          <li>
            Controlla sempre di persona e confrontati con l&apos;{USER_ROLES.HOST}
            per ottenere indicazioni precise.
          </li>
          <li>
            La piattaforma non garantisce l&apos;accuratezza delle coordinate o
            delle distanze mostrate.
          </li>
        </ul>
      </InfoToggle>
    </InfoSectionCard>
  );
}
