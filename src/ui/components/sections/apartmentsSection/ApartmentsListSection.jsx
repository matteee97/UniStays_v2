import LoadingIcon from "@/ui/components/common/shared/icons/LoadingIcon";
import Alert from "@/ui/components/common/messages/Alert";
import ApartmentCard from "@/ui/components/common/cards/ApartmentCard";
import PageNavigation from "@/ui/components/common/form/PageNavigation";
import EmptyResults from "@/ui/components/common/messages/EmptyResults";
import SmallCard from "@/ui/components/common/cards/SmallCard";
import { useNavigateToCity } from "@/ui/hooks";
import LocalStorageToggleButton from "@/ui/components/common/buttons/LocalStorageToggleButton";
import { useUser } from "@clerk/clerk-react";
import { HeartToggle } from "../../common";

export default function ApartmentsListSection({
  app = [],
  showLoading = false,
  city = null,
  university = null,
  error = false,
  setHoveredApartmentId = () => {},
  loadMore = () => {},
  limit = 18,
  totalCount = null,
  allLoaded = false,
  loadedCount = 0,
  displayCount,
  paginaCorrente = 1,
  setPaginaCorrente = () => {},
  alwaysStickyNavigation = false,
  detailedCard = true,
  setDetailedCard = () => {},
  showCity = false,
  storageKey = "detailedCard",
  favoritesIds,
  filtersActive = false,
  setActiveFilters,
}) {
  const hasKnownTotalCount =
    Number.isFinite(totalCount) && Number(totalCount) >= 0;
  const safeLoadedCount =
    Number.isFinite(loadedCount) && loadedCount >= 0 ? loadedCount : app.length;
  const numeroPagine = hasKnownTotalCount
    ? Math.max(1, Math.ceil(totalCount / limit))
    : null;
  const hasNextPage = hasKnownTotalCount
    ? paginaCorrente < numeroPagine
    : !allLoaded || safeLoadedCount > paginaCorrente * limit;

  const goTo = useNavigateToCity();
  const { user } = useUser();
  const userId = user?.id;
  const visibleCount =
    Number.isFinite(displayCount) && displayCount >= 0
      ? displayCount
      : app.length + limit * (paginaCorrente - 1);
  const countLabel = hasKnownTotalCount
    ? `${visibleCount} di ${totalCount} annunc${totalCount === 1 ? "io" : "i"}`
    : `${visibleCount}${allLoaded ? "" : "+"} annunc${visibleCount === 1 ? "io" : "i"}`;

  const handleClick = (app) => {
    const city = {
      city: app.address?.city,
      provinceCode: app.address?.provinceCode,
    };
    goTo(city, `/${app.id}`);
  };

  return (
    <div
      className={`relative p-4 space-y-5 h-full ${
        !alwaysStickyNavigation ? "sm:mb-[52px]" : ""
      }`}
    >
      {showLoading && <LoadingIcon />}
      <div className="flex flex-col gap-4 sm:flex-row justify-between sm:items-center">
        <p className="text-gray-700 text-sm opacity-70">
          {countLabel}
          {city && university && " a " + city + " - " + university}
        </p>
        <LocalStorageToggleButton
          label="Vista dettagliata"
          storageKey={storageKey}
          value={detailedCard}
          onChange={setDetailedCard}
        />
      </div>
      {error && (
        <Alert
          title={"Errore, qualcosa è andato storto:"}
          message={
            "Ci dispiace ma la ricerca non ha prodotto risultati a causa di un errore."
          }
        />
      )}
      {!showLoading && app.length === 0 && !error && (
        <>
          {filtersActive ? (
            <EmptyResults
              title={"Nessun risultato con i filtri attivi"}
              subtitle={
                "Prova ad allargare i filtri o prova a cercare annunci con altri criteri di ricerca."
              }
              onClearFilters={() => {
                setActiveFilters(null);
              }}
            />
          ) : (
            <EmptyResults />
          )}
        </>
      )}
      <div
        className={`grid ${
          detailedCard
            ? "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-3 2xl:grid-cols-4"
        } gap-y-12 gap-x-3 w-full`}
      >
        {app.map((app) =>
          detailedCard ? (
            <ApartmentCard
              key={app.id}
              app={app}
              onHover={() => setHoveredApartmentId(app.id)}
              onHoverOut={() => setHoveredApartmentId(null)}
              handleClick={handleClick}
              userId={userId}
              liked={favoritesIds?.has(app.id) || false}
            />
          ) : (
            <SmallCard
              key={app.id}
              app={app}
              onHover={() => setHoveredApartmentId(app.id)}
              onHoverOut={() => setHoveredApartmentId(null)}
              handleClick={handleClick}
              showCity={showCity}
              imageChildren={
                favoritesIds && (
                  <div className="absolute top-2 right-2 bg-white/50 dark:bg-[#0F1829]/50 backdrop-blur-sm border-[#d4f1ee]/60 dark:border-[#394354] border-2 rounded-full py-1 px-2">
                    <HeartToggle
                      userID={userId}
                      app={app}
                      liked={favoritesIds?.has(app.id) || false}
                    />
                  </div>
                )
              }
            />
          ),
        )}
      </div>
      {!showLoading &&
        app.length > 0 &&
        !error &&
        (hasKnownTotalCount
          ? totalCount >= limit
          : paginaCorrente > 1 || hasNextPage) && (
          <div
            className={`sm:sticky ${
              !alwaysStickyNavigation && "sm:absolute"
            } bottom-[3px] sm:bottom-[13px] left-0 w-full flex justify-center z-20`}
          >
            <PageNavigation
              loadMore={loadMore}
              numeroPagine={numeroPagine}
              hasNextPage={hasNextPage}
              setPaginaCorrente={setPaginaCorrente}
              paginaCorrente={paginaCorrente}
            />
          </div>
        )}
    </div>
  );
}
