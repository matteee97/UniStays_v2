import { lazy, Suspense, useMemo, useState } from "react";
import { useDeferredInView, useFetchApartmentOccupants } from "@/ui/hooks";
import DotazioniList from "./DotazioniList";
import CaratteristicheList from "./CaratteristicheList";
import RulesSection from "./RulesSection";
import RoommatesSection from "./RoommatesSection";
import { InfoSectionCard, InfoSectionHeader } from "./InfoSection";
import ApartmentAdditionalInfoSection from "./apartmentInfo/ApartmentAdditionalInfoSection";
import ApartmentDescriptionSection from "./apartmentInfo/ApartmentDescriptionSection";
import ApartmentHostSummaryCard from "./apartmentInfo/ApartmentHostSummaryCard";
import ApartmentOverviewSection from "./apartmentInfo/ApartmentOverviewSection";
import { buildApartmentInfoViewModel } from "./apartmentInfo/buildApartmentInfoViewModel";

const LazyRoomPreviewSection = lazy(() => import("./RoomPreviewSection"));
const LazyApartmentMapSection = lazy(
  () => import("./apartmentInfo/ApartmentMapSection"),
);

function RoomSectionSkeleton() {
  return (
    <InfoSectionCard
      id="section-stanze"
      className="space-y-4 overflow-hidden !p-0"
      aria-hidden="true"
    >
      <div className="p-5 pb-0">
        <div className="h-6 w-44 rounded-full bg-[#d4f1ef]/70" />
      </div>
      <div className="flex gap-4 overflow-hidden px-2 pb-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[360px] w-[292px] flex-none rounded-[32px] border border-[#d4f1ef] bg-white p-4"
          >
            <div className="h-44 rounded-[24px] bg-[#d4f1ef]/45" />
            <div className="mt-4 h-4 w-24 rounded-full bg-[#d4f1ef]/60" />
            <div className="mt-3 h-5 w-32 rounded-full bg-[#d4f1ef]/50" />
            <div className="mt-3 h-4 w-full rounded-full bg-[#d4f1ef]/35" />
            <div className="mt-2 h-4 w-4/5 rounded-full bg-[#d4f1ef]/30" />
          </div>
        ))}
      </div>
    </InfoSectionCard>
  );
}

function MapSectionSkeleton() {
  return (
    <InfoSectionCard
      id="section-posizione"
      variant="bare"
      className="relative h-[300px] w-full overflow-hidden md:h-[500px]"
      aria-hidden="true"
    >
      <div className="h-full w-full bg-[#d4f1ef]/45" />
    </InfoSectionCard>
  );
}

export default function ApartmentInfo({ app, rooms = [] }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [roomSectionsRef, shouldLoadOccupants] = useDeferredInView({
    threshold: 0.05,
    rootMargin: "320px 0px",
  });
  const [mapSectionRef, shouldLoadMapSection] = useDeferredInView({
    threshold: 0.05,
    rootMargin: "320px 0px",
  });
  const { occupants } = useFetchApartmentOccupants(
    app?.id,
    shouldLoadOccupants,
  );
  const appViewModel = useMemo(
    () => ({
      ...(app || {}),
      rooms,
      occupants,
    }),
    [app, rooms, occupants],
  );

  const {
    additionalInfo,
    availabilityLabel,
    description,
    features,
    host,
    hostPhotoUrl,
    isAgency,
    occupants: resolvedOccupants,
    ownerId,
    quickStats,
    rooms: resolvedRooms,
  } = useMemo(() => buildApartmentInfoViewModel(appViewModel), [appViewModel]);

  return (
    <div className="space-y-6 sm:ml-3 md:col-span-2">
      <ApartmentOverviewSection
        quickStats={quickStats}
        availabilityLabel={availabilityLabel}
      />

      <ApartmentDescriptionSection
        description={description}
        isExpanded={isDescriptionExpanded}
        onToggle={() => setIsDescriptionExpanded((current) => !current)}
      />

      <ApartmentHostSummaryCard
        host={host}
        hostPhotoUrl={hostPhotoUrl}
        ownerId={ownerId}
        isAgency={isAgency}
      />

      <InfoSectionCard id="section-dotazioni">
        <InfoSectionHeader
          className="mb-3"
          title="Dotazioni"
          badge="Comfort inclusi"
        />
        <DotazioniList
          app={app?.amenities}
          showAllDotazioni={showAllAmenities}
          setShowAllDotazioni={setShowAllAmenities}
        />
      </InfoSectionCard>

      <InfoSectionCard id="section-caratteristiche">
        <InfoSectionHeader
          className="mb-3"
          title="Caratteristiche dell'alloggio"
          badge="Specifiche"
        />
        <CaratteristicheList caratteristiche={features} />
      </InfoSectionCard>

      <InfoSectionCard id="section-regole">
        <InfoSectionHeader
          className="mb-3"
          title="Regole della casa"
          badge="Cosa sapere prima di prenotare"
        />
        <RulesSection regole={app?.houseRules} />
      </InfoSectionCard>

      <div ref={roomSectionsRef} className="space-y-6">
        {shouldLoadOccupants ? (
          <Suspense fallback={<RoomSectionSkeleton />}>
            <LazyRoomPreviewSection
              rooms={resolvedRooms}
              occupants={resolvedOccupants}
              utilitiesIncluded={features?.utilitiesIncluded}
            />
          </Suspense>
        ) : (
          <RoomSectionSkeleton />
        )}

        <RoommatesSection occupants={resolvedOccupants} rooms={resolvedRooms} />
      </div>

      <ApartmentAdditionalInfoSection additionalInfo={additionalInfo} />
      <div ref={mapSectionRef}>
        {shouldLoadMapSection ? (
          <Suspense fallback={<MapSectionSkeleton />}>
            <LazyApartmentMapSection app={app} />
          </Suspense>
        ) : (
          <MapSectionSkeleton />
        )}
      </div>
    </div>
  );
}
