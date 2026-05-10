import LoadingIcon from "@/ui/components/common/shared/icons/LoadingIcon";
import Alert from "@/ui/components/common/messages/Alert";
import ApartmentCard from "@/ui/components/common/cards/ApartmentCard";
import PageNavigation from "@/ui/components/common/form/PageNavigation";
import EmptyResults from "@/ui/components/common/messages/EmptyResults";
import RoomSearchCard from "@/ui/components/common/cards/RoomSearchCard";
import { useNavigateToCity } from "@/ui/hooks";
import SearchModeSwitch from "@/ui/components/common/search/SearchModeSwitch";
import { useUser } from "@clerk/clerk-react";
import { SEARCH_MODES } from "@/application/filters/searchModeQuery";

function ApartmentsListSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex flex-col gap-4 sm:flex-row justify-between sm:items-center">
        <div className="h-4 w-40 rounded-full bg-[#d4f1ef]/65" />
        <div className="h-10 w-40 rounded-full bg-[#d4f1ef]/55" />
      </div>

      <div className="mt-6 grid w-full grid-cols-1 gap-x-3 gap-y-12 sm:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[32px] border border-[#d4f1ef] bg-white shadow-sm"
          >
            <div className="h-56 w-full bg-[#d4f1ef]/45" />
            <div className="space-y-4 p-5">
              <div className="h-4 w-24 rounded-full bg-[#d4f1ef]/60" />
              <div className="h-6 w-3/4 rounded-full bg-[#d4f1ef]/50" />
              <div className="h-4 w-full rounded-full bg-[#d4f1ef]/35" />
              <div className="h-4 w-5/6 rounded-full bg-[#d4f1ef]/30" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-16 rounded-2xl bg-[#d4f1ef]/25" />
                <div className="h-16 rounded-2xl bg-[#d4f1ef]/25" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  favoritesIds,
  filtersActive = false,
  setActiveFilters,
  searchMode = SEARCH_MODES.APARTMENTS,
  cityCoords = null,
  onRoomResultClick,
  onSearchModeChange = () => {},
  showSearchModeSwitch = true,
}) {
  const isRoomSearch = searchMode === SEARCH_MODES.ROOMS;
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
    ? `${visibleCount} di ${totalCount} ${
        isRoomSearch
          ? `stanz${totalCount === 1 ? "a" : "e"}`
          : `annunc${totalCount === 1 ? "io" : "i"}`
      }`
    : `${visibleCount}${allLoaded ? "" : "+"} ${
        isRoomSearch
          ? `stanz${visibleCount === 1 ? "a" : "e"}`
          : `annunc${visibleCount === 1 ? "io" : "i"}`
      }`;
  const shouldShowInitialSkeleton = showLoading && app.length === 0 && !error;

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
      {shouldShowInitialSkeleton ? (
        <ApartmentsListSkeleton />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row justify-between sm:items-center">
            <p className="text-gray-700 text-sm opacity-70">
              {countLabel}
              {city && university && " a " + city + " - " + university}
            </p>
            {showSearchModeSwitch && (
              <SearchModeSwitch
                mode={searchMode}
                onChange={onSearchModeChange}
                className="sm:mx-0"
                iconClassName="w-7 h-7"
              />
            )}
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
          <div className="grid w-full grid-cols-1 gap-x-3 gap-y-12 sm:grid-cols-2 2xl:grid-cols-3">
            {app.map((app) =>
              isRoomSearch ? (
                <RoomSearchCard
                  key={app.id}
                  result={app}
                  cityCoords={cityCoords}
                  onHover={(apartmentId) => setHoveredApartmentId(apartmentId)}
                  onHoverOut={() => setHoveredApartmentId(null)}
                  onClick={onRoomResultClick}
                />
              ) : (
                <ApartmentCard
                  key={app.id}
                  app={app}
                  onHover={() => setHoveredApartmentId(app.id)}
                  onHoverOut={() => setHoveredApartmentId(null)}
                  handleClick={handleClick}
                  userId={userId}
                  liked={favoritesIds?.has(app.id) || false}
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
        </>
      )}
    </div>
  );
}
